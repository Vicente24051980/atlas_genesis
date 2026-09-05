-- ATLAS Ω — Γ/Κ append-only tamper-evident ledgers
-- Server computes prev_hash + record_hash. Clients never provide either.
-- A GitHub Governance checkpoint of each stream head is required after canonical sealing batches
-- to detect a privileged full-history rewrite with recomputed hashes.

create extension if not exists pgcrypto;
create schema if not exists atlas_omega;

revoke all on schema atlas_omega from public;
grant usage on schema atlas_omega to authenticated;

create table if not exists atlas_omega.gamma_ledger (
  seq bigint generated always as identity primary key,
  event_type text not null check (event_type in ('FALSIFIER_SEALED','OBSERVATION_RECORDED','FALSIFIER_SUPERSEDED','GOVERNANCE_CORRECTION')),
  aggregate_id text not null,
  payload jsonb not null,
  sealed_at timestamptz not null default clock_timestamp(),
  prev_hash text not null,
  record_hash text not null unique
);

create table if not exists atlas_omega.kappa_ledger (
  seq bigint generated always as identity primary key,
  event_type text not null check (event_type in ('CASE_SEALED','CASE_RESOLVED','CASE_INVALIDATED','CASE_REISSUED')),
  aggregate_id text not null,
  payload jsonb not null,
  sealed_at timestamptz not null default clock_timestamp(),
  prev_hash text not null,
  record_hash text not null unique
);

comment on table atlas_omega.gamma_ledger is 'Γ event ledger. Append-only. Hashes computed server-side.';
comment on table atlas_omega.kappa_ledger is 'Κ event ledger. Append-only. Hashes computed server-side.';

create or replace function atlas_omega.canonical_event_json(
  p_seq bigint,
  p_event_type text,
  p_aggregate_id text,
  p_payload jsonb,
  p_sealed_at timestamptz,
  p_prev_hash text
) returns text
language sql immutable strict
set search_path = pg_catalog
as $$
  select jsonb_build_object(
    'aggregate_id', p_aggregate_id,
    'event_type', p_event_type,
    'payload', p_payload,
    'prev_hash', p_prev_hash,
    'sealed_at', to_char(p_sealed_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
    'seq', p_seq
  )::text;
$$;

create or replace function atlas_omega.block_ledger_mutation()
returns trigger language plpgsql
set search_path = pg_catalog
as $$
begin
  raise exception 'ATLAS_LEDGER_APPEND_ONLY';
end;
$$;

drop trigger if exists gamma_no_update on atlas_omega.gamma_ledger;
create trigger gamma_no_update before update or delete on atlas_omega.gamma_ledger
for each row execute function atlas_omega.block_ledger_mutation();

drop trigger if exists kappa_no_update on atlas_omega.kappa_ledger;
create trigger kappa_no_update before update or delete on atlas_omega.kappa_ledger
for each row execute function atlas_omega.block_ledger_mutation();

create or replace function atlas_omega.gamma_before_insert()
returns trigger language plpgsql security definer
set search_path = pg_catalog, atlas_omega
as $$
declare
  v_prev text;
begin
  perform pg_advisory_xact_lock(hashtext('atlas_omega.gamma_ledger'));
  select record_hash into v_prev from atlas_omega.gamma_ledger order by seq desc limit 1;
  new.prev_hash := coalesce(v_prev, 'GENESIS');
  new.sealed_at := coalesce(new.sealed_at, clock_timestamp());
  new.record_hash := encode(digest(convert_to(atlas_omega.canonical_event_json(
    new.seq, new.event_type, new.aggregate_id, new.payload, new.sealed_at, new.prev_hash
  ), 'UTF8'), 'sha256'), 'hex');
  return new;
end;
$$;

drop trigger if exists gamma_hash_insert on atlas_omega.gamma_ledger;
create trigger gamma_hash_insert before insert on atlas_omega.gamma_ledger
for each row execute function atlas_omega.gamma_before_insert();

create or replace function atlas_omega.kappa_before_insert()
returns trigger language plpgsql security definer
set search_path = pg_catalog, atlas_omega
as $$
declare
  v_prev text;
begin
  perform pg_advisory_xact_lock(hashtext('atlas_omega.kappa_ledger'));
  select record_hash into v_prev from atlas_omega.kappa_ledger order by seq desc limit 1;
  new.prev_hash := coalesce(v_prev, 'GENESIS');
  new.sealed_at := coalesce(new.sealed_at, clock_timestamp());
  new.record_hash := encode(digest(convert_to(atlas_omega.canonical_event_json(
    new.seq, new.event_type, new.aggregate_id, new.payload, new.sealed_at, new.prev_hash
  ), 'UTF8'), 'sha256'), 'hex');
  return new;
end;
$$;

drop trigger if exists kappa_hash_insert on atlas_omega.kappa_ledger;
create trigger kappa_hash_insert before insert on atlas_omega.kappa_ledger
for each row execute function atlas_omega.kappa_before_insert();

-- Γ v1.2 ingestion: latest-period assertion and threshold coherence are mandatory payload fields.
create or replace function atlas_omega.seal_gamma_falsifier(p_payload jsonb)
returns atlas_omega.gamma_ledger
language plpgsql security definer
set search_path = pg_catalog, atlas_omega
as $$
declare
  v_op text := p_payload->>'operator';
  v_baseline numeric := (p_payload->>'baseline')::numeric;
  v_amber numeric := (p_payload->>'amber')::numeric;
  v_red numeric := (p_payload->>'red')::numeric;
  v_latest boolean := coalesce((p_payload->>'baseline_is_latest_published_period')::boolean, false);
  v_row atlas_omega.gamma_ledger;
begin
  if coalesce(p_payload->>'falsifier_id','') = '' or coalesce(p_payload->>'ticker','') = '' or coalesce(p_payload->>'metric','') = '' then
    raise exception 'INVALID_DEFINITION';
  end if;
  if not v_latest then raise exception 'BASELINE_NON_STANDARD'; end if;
  if v_op in ('LT','LTE') and not (v_red < v_amber) then raise exception 'INVALID_THRESHOLD_ORDER'; end if;
  if v_op in ('GT','GTE') and not (v_red > v_amber) then raise exception 'INVALID_THRESHOLD_ORDER'; end if;
  if v_op = 'LT' and v_baseline < v_amber then raise exception 'THRESHOLD_ALREADY_BREACHED'; end if;
  if v_op = 'LTE' and v_baseline <= v_amber then raise exception 'THRESHOLD_ALREADY_BREACHED'; end if;
  if v_op = 'GT' and v_baseline > v_amber then raise exception 'THRESHOLD_ALREADY_BREACHED'; end if;
  if v_op = 'GTE' and v_baseline >= v_amber then raise exception 'THRESHOLD_ALREADY_BREACHED'; end if;
  if v_op not in ('LT','LTE','GT','GTE') then raise exception 'INVALID_OPERATOR'; end if;

  insert into atlas_omega.gamma_ledger(event_type, aggregate_id, payload, prev_hash, record_hash)
  values ('FALSIFIER_SEALED', p_payload->>'falsifier_id', p_payload, '', '') returning * into v_row;
  return v_row;
end;
$$;

create or replace function atlas_omega.append_gamma_event(p_event_type text, p_aggregate_id text, p_payload jsonb)
returns atlas_omega.gamma_ledger
language plpgsql security definer
set search_path = pg_catalog, atlas_omega
as $$
declare v_row atlas_omega.gamma_ledger;
begin
  if p_event_type not in ('OBSERVATION_RECORDED','FALSIFIER_SUPERSEDED','GOVERNANCE_CORRECTION') then
    raise exception 'INVALID_GAMMA_EVENT_TYPE';
  end if;
  insert into atlas_omega.gamma_ledger(event_type, aggregate_id, payload, prev_hash, record_hash)
  values (p_event_type, p_aggregate_id, p_payload, '', '') returning * into v_row;
  return v_row;
end;
$$;

create or replace function atlas_omega.seal_kappa_case(p_payload jsonb)
returns atlas_omega.kappa_ledger
language plpgsql security definer
set search_path = pg_catalog, atlas_omega
as $$
declare
  v_probability numeric := (p_payload->>'probability')::numeric;
  v_row atlas_omega.kappa_ledger;
begin
  if coalesce(p_payload->>'case_id','') = '' or coalesce(p_payload->>'claim','') = ''
     or coalesce(p_payload->>'claim_type','') = '' or coalesce(p_payload->>'horizon_class','') = ''
     or coalesce(p_payload->>'resolution_criteria','') = '' or coalesce(p_payload->>'resolution_source','') = ''
     or coalesce(p_payload->>'emitter_version','') = '' then
    raise exception 'INVALID_KAPPA_CASE';
  end if;
  if not (v_probability > 0 and v_probability < 1) then raise exception 'INVALID_PROBABILITY'; end if;
  if exists(select 1 from atlas_omega.kappa_ledger where event_type='CASE_SEALED' and aggregate_id=p_payload->>'case_id') then
    raise exception 'CASE_ALREADY_SEALED';
  end if;
  insert into atlas_omega.kappa_ledger(event_type, aggregate_id, payload, prev_hash, record_hash)
  values ('CASE_SEALED', p_payload->>'case_id', p_payload, '', '') returning * into v_row;
  return v_row;
end;
$$;

create or replace function atlas_omega.append_kappa_event(p_event_type text, p_case_id text, p_payload jsonb)
returns atlas_omega.kappa_ledger
language plpgsql security definer
set search_path = pg_catalog, atlas_omega
as $$
declare v_row atlas_omega.kappa_ledger;
begin
  if p_event_type not in ('CASE_RESOLVED','CASE_INVALIDATED','CASE_REISSUED') then raise exception 'INVALID_KAPPA_EVENT_TYPE'; end if;
  if not exists(select 1 from atlas_omega.kappa_ledger where event_type='CASE_SEALED' and aggregate_id=p_case_id) then raise exception 'CASE_NOT_SEALED'; end if;
  if p_event_type='CASE_RESOLVED' and coalesce(p_payload->>'outcome','') not in ('0','1') then raise exception 'INVALID_OUTCOME'; end if;
  if p_event_type='CASE_INVALIDATED' and coalesce(p_payload->>'reason','')='' then raise exception 'INVALIDATION_REASON_REQUIRED'; end if;
  if p_event_type='CASE_REISSUED' and coalesce(p_payload->>'new_case_id','')='' then raise exception 'REISSUE_LINK_REQUIRED'; end if;
  insert into atlas_omega.kappa_ledger(event_type, aggregate_id, payload, prev_hash, record_hash)
  values (p_event_type, p_case_id, p_payload, '', '') returning * into v_row;
  return v_row;
end;
$$;

create or replace function atlas_omega.verify_gamma_ledger()
returns table(ok boolean, bad_seq bigint, expected_hash text, actual_hash text)
language plpgsql security definer
set search_path = pg_catalog, atlas_omega
as $$
declare
  r record; v_prev text := 'GENESIS'; v_expected text;
begin
  for r in select * from atlas_omega.gamma_ledger order by seq loop
    v_expected := encode(digest(convert_to(atlas_omega.canonical_event_json(r.seq,r.event_type,r.aggregate_id,r.payload,r.sealed_at,v_prev),'UTF8'),'sha256'),'hex');
    if r.prev_hash <> v_prev or r.record_hash <> v_expected then
      return query select false, r.seq, v_expected, r.record_hash; return;
    end if;
    v_prev := r.record_hash;
  end loop;
  return query select true, null::bigint, null::text, null::text;
end;
$$;

create or replace function atlas_omega.verify_kappa_ledger()
returns table(ok boolean, bad_seq bigint, expected_hash text, actual_hash text)
language plpgsql security definer
set search_path = pg_catalog, atlas_omega
as $$
declare
  r record; v_prev text := 'GENESIS'; v_expected text;
begin
  for r in select * from atlas_omega.kappa_ledger order by seq loop
    v_expected := encode(digest(convert_to(atlas_omega.canonical_event_json(r.seq,r.event_type,r.aggregate_id,r.payload,r.sealed_at,v_prev),'UTF8'),'sha256'),'hex');
    if r.prev_hash <> v_prev or r.record_hash <> v_expected then
      return query select false, r.seq, v_expected, r.record_hash; return;
    end if;
    v_prev := r.record_hash;
  end loop;
  return query select true, null::bigint, null::text, null::text;
end;
$$;

create or replace function atlas_omega.ledger_heads()
returns table(stream text, seq bigint, record_hash text)
language sql security definer
set search_path = pg_catalog, atlas_omega
as $$
  (select 'GAMMA', seq, record_hash from atlas_omega.gamma_ledger order by seq desc limit 1)
  union all
  (select 'KAPPA', seq, record_hash from atlas_omega.kappa_ledger order by seq desc limit 1);
$$;

alter table atlas_omega.gamma_ledger enable row level security;
alter table atlas_omega.kappa_ledger enable row level security;
revoke all on atlas_omega.gamma_ledger, atlas_omega.kappa_ledger from public, anon, authenticated;
revoke all on all sequences in schema atlas_omega from public, anon, authenticated;

grant execute on function atlas_omega.seal_gamma_falsifier(jsonb) to authenticated;
grant execute on function atlas_omega.append_gamma_event(text,text,jsonb) to authenticated;
grant execute on function atlas_omega.seal_kappa_case(jsonb) to authenticated;
grant execute on function atlas_omega.append_kappa_event(text,text,jsonb) to authenticated;
grant execute on function atlas_omega.verify_gamma_ledger() to authenticated;
grant execute on function atlas_omega.verify_kappa_ledger() to authenticated;
grant execute on function atlas_omega.ledger_heads() to authenticated;
