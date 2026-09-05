-- ATLAS Ω — Γ/Κ append-only ledgers
-- Canonical design: DB-generated timestamps/hashes, advisory-lock serialization,
-- append-only events, immutable source rows, explicit verification.

create extension if not exists pgcrypto;

create table if not exists public.atlas_gamma_ledger (
  seq bigint generated always as identity primary key,
  event_type text not null check (event_type in ('FALSIFIER_SEALED','FALSIFIER_INVALIDATED','FALSIFIER_REISSUED')),
  falsifier_id text not null,
  ticker text not null,
  payload jsonb not null,
  sealed_at timestamptz not null,
  prev_hash text not null,
  record_hash text not null unique
);

create table if not exists public.atlas_kappa_ledger (
  seq bigint generated always as identity primary key,
  event_type text not null check (event_type in ('CASE_SEALED','CASE_RESOLVED','CASE_INVALIDATED','CASE_REISSUED')),
  case_id text not null,
  ticker text not null,
  payload jsonb not null,
  sealed_at timestamptz not null,
  prev_hash text not null,
  record_hash text not null unique
);

create or replace function public.atlas_canonical_event_text(
  p_stream text,
  p_seq bigint,
  p_event_type text,
  p_aggregate_id text,
  p_ticker text,
  p_payload jsonb,
  p_sealed_at timestamptz,
  p_prev_hash text
) returns text
language sql immutable
as $$
  select concat_ws(E'\x1f',
    'ATLAS_LEDGER_V1',
    p_stream,
    p_seq::text,
    p_event_type,
    p_aggregate_id,
    p_ticker,
    p_payload::text,
    to_char(p_sealed_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
    p_prev_hash
  );
$$;

create or replace function public.atlas_sha256_hex(p_text text)
returns text
language sql immutable
as $$
  select encode(digest(convert_to(p_text, 'UTF8'), 'sha256'), 'hex');
$$;

create or replace function public.atlas_threshold_crossed(
  p_value numeric,
  p_operator text,
  p_threshold numeric
) returns boolean
language plpgsql immutable
as $$
begin
  if p_operator = '<' then return p_value < p_threshold; end if;
  if p_operator = '<=' then return p_value <= p_threshold; end if;
  if p_operator = '>' then return p_value > p_threshold; end if;
  if p_operator = '>=' then return p_value >= p_threshold; end if;
  raise exception 'UNSUPPORTED_OPERATOR:%', p_operator;
end;
$$;

create or replace function public.atlas_validate_gamma_thresholds(
  p_baseline numeric,
  p_amber_operator text,
  p_amber numeric,
  p_red_operator text,
  p_red numeric
) returns void
language plpgsql immutable
as $$
begin
  if p_amber_operator not in ('<','<=','>','>=') or p_red_operator not in ('<','<=','>','>=') then
    raise exception 'UNSUPPORTED_OPERATOR';
  end if;

  if public.atlas_threshold_crossed(p_baseline, p_amber_operator, p_amber) then
    raise exception 'THRESHOLD_ALREADY_BREACHED';
  end if;

  if (p_amber_operator in ('<','<=') and p_red_operator not in ('<','<='))
     or (p_amber_operator in ('>','>=') and p_red_operator not in ('>','>=')) then
    raise exception 'THRESHOLD_DIRECTION_MISMATCH';
  end if;

  if p_amber_operator in ('<','<=') and p_red > p_amber then
    raise exception 'RED_NOT_MORE_SEVERE_THAN_AMBER';
  end if;
  if p_amber_operator in ('>','>=') and p_red < p_amber then
    raise exception 'RED_NOT_MORE_SEVERE_THAN_AMBER';
  end if;
end;
$$;

create or replace function public.atlas_block_ledger_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'APPEND_ONLY_LEDGER_MUTATION_BLOCKED';
end;
$$;

drop trigger if exists atlas_gamma_immutable on public.atlas_gamma_ledger;
create trigger atlas_gamma_immutable
before update or delete on public.atlas_gamma_ledger
for each row execute function public.atlas_block_ledger_mutation();

drop trigger if exists atlas_kappa_immutable on public.atlas_kappa_ledger;
create trigger atlas_kappa_immutable
before update or delete on public.atlas_kappa_ledger
for each row execute function public.atlas_block_ledger_mutation();

create or replace function public.atlas_append_gamma_event(
  p_event_type text,
  p_falsifier_id text,
  p_ticker text,
  p_payload jsonb
) returns public.atlas_gamma_ledger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_prev text;
  v_sealed timestamptz;
  v_seq bigint;
  v_hash text;
  v_row public.atlas_gamma_ledger;
begin
  perform pg_advisory_xact_lock(hashtext('ATLAS_GAMMA_LEDGER_V1'));
  select coalesce(record_hash, repeat('0',64)) into v_prev
  from public.atlas_gamma_ledger order by seq desc limit 1;
  v_prev := coalesce(v_prev, repeat('0',64));
  v_sealed := clock_timestamp();
  select nextval(pg_get_serial_sequence('public.atlas_gamma_ledger','seq')) into v_seq;
  v_hash := public.atlas_sha256_hex(public.atlas_canonical_event_text(
    'GAMMA', v_seq, p_event_type, p_falsifier_id, p_ticker, p_payload, v_sealed, v_prev
  ));
  insert into public.atlas_gamma_ledger(seq,event_type,falsifier_id,ticker,payload,sealed_at,prev_hash,record_hash)
  overriding system value
  values(v_seq,p_event_type,p_falsifier_id,p_ticker,p_payload,v_sealed,v_prev,v_hash)
  returning * into v_row;
  return v_row;
end;
$$;

create or replace function public.atlas_append_kappa_event(
  p_event_type text,
  p_case_id text,
  p_ticker text,
  p_payload jsonb
) returns public.atlas_kappa_ledger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_prev text;
  v_sealed timestamptz;
  v_seq bigint;
  v_hash text;
  v_row public.atlas_kappa_ledger;
begin
  perform pg_advisory_xact_lock(hashtext('ATLAS_KAPPA_LEDGER_V1'));
  select coalesce(record_hash, repeat('0',64)) into v_prev
  from public.atlas_kappa_ledger order by seq desc limit 1;
  v_prev := coalesce(v_prev, repeat('0',64));
  v_sealed := clock_timestamp();
  select nextval(pg_get_serial_sequence('public.atlas_kappa_ledger','seq')) into v_seq;
  v_hash := public.atlas_sha256_hex(public.atlas_canonical_event_text(
    'KAPPA', v_seq, p_event_type, p_case_id, p_ticker, p_payload, v_sealed, v_prev
  ));
  insert into public.atlas_kappa_ledger(seq,event_type,case_id,ticker,payload,sealed_at,prev_hash,record_hash)
  overriding system value
  values(v_seq,p_event_type,p_case_id,p_ticker,p_payload,v_sealed,v_prev,v_hash)
  returning * into v_row;
  return v_row;
end;
$$;

create or replace function public.atlas_seal_gamma_falsifier(
  p_falsifier_id text,
  p_ticker text,
  p_metric text,
  p_baseline numeric,
  p_unit text,
  p_baseline_source text,
  p_baseline_period_end date,
  p_latest_published_period_end date,
  p_amber_operator text,
  p_amber numeric,
  p_red_operator text,
  p_red numeric,
  p_window text,
  p_weight numeric,
  p_severity text,
  p_observable boolean,
  p_causal boolean,
  p_thesis_relevant boolean,
  p_supersedes_falsifier_id text default null
) returns public.atlas_gamma_ledger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_payload jsonb;
begin
  if p_falsifier_id is null or btrim(p_falsifier_id) = '' or p_ticker is null or btrim(p_ticker) = '' then
    raise exception 'INVALID_IDENTITY';
  end if;
  if p_metric is null or btrim(p_metric) = '' or p_baseline_source is null or btrim(p_baseline_source) = '' then
    raise exception 'UNOBSERVABLE_DEFINITION';
  end if;
  if p_baseline_period_end is distinct from p_latest_published_period_end then
    raise exception 'BASELINE_NON_STANDARD';
  end if;
  if p_weight <= 0 or p_weight > 1 then raise exception 'INVALID_WEIGHT'; end if;
  if p_severity not in ('MINOR','MAJOR','CRITICAL') then raise exception 'INVALID_SEVERITY'; end if;
  if not p_observable or not p_causal or not p_thesis_relevant then
    raise exception 'FALSIFIER_MUST_BE_OBSERVABLE_CAUSAL_THESIS_RELEVANT';
  end if;
  perform public.atlas_validate_gamma_thresholds(p_baseline,p_amber_operator,p_amber,p_red_operator,p_red);

  v_payload := jsonb_build_object(
    'schema_version','GAMMA_V1_2',
    'metric',p_metric,
    'baseline',p_baseline,
    'unit',p_unit,
    'baseline_source',p_baseline_source,
    'baseline_period_end',p_baseline_period_end,
    'latest_published_period_end_at_seal',p_latest_published_period_end,
    'amber_operator',p_amber_operator,
    'amber_threshold',p_amber,
    'red_operator',p_red_operator,
    'red_threshold',p_red,
    'window',p_window,
    'weight',p_weight,
    'severity',p_severity,
    'observable',p_observable,
    'causal',p_causal,
    'thesis_relevant',p_thesis_relevant,
    'supersedes_falsifier_id',p_supersedes_falsifier_id
  );
  return public.atlas_append_gamma_event(
    case when p_supersedes_falsifier_id is null then 'FALSIFIER_SEALED' else 'FALSIFIER_REISSUED' end,
    p_falsifier_id,p_ticker,v_payload
  );
end;
$$;

create or replace function public.atlas_invalidate_gamma_falsifier(
  p_falsifier_id text,
  p_ticker text,
  p_reason text
) returns public.atlas_gamma_ledger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_reason is null or btrim(p_reason) = '' then raise exception 'INVALIDATION_REASON_REQUIRED'; end if;
  return public.atlas_append_gamma_event('FALSIFIER_INVALIDATED',p_falsifier_id,p_ticker,
    jsonb_build_object('schema_version','GAMMA_V1_2','reason',p_reason));
end;
$$;

create or replace function public.atlas_seal_kappa_case(
  p_case_id text,
  p_ticker text,
  p_claim_type text,
  p_horizon_id text,
  p_horizon_end date,
  p_probability numeric,
  p_claim text,
  p_resolution_criteria text,
  p_resolution_source text,
  p_issuer_version text,
  p_supersedes_case_id text default null
) returns public.atlas_kappa_ledger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_payload jsonb;
begin
  if p_probability <= 0 or p_probability >= 1 then raise exception 'INVALID_PROBABILITY'; end if;
  if coalesce(btrim(p_case_id),'')='' or coalesce(btrim(p_claim_type),'')='' or coalesce(btrim(p_horizon_id),'')=''
     or coalesce(btrim(p_claim),'')='' or coalesce(btrim(p_resolution_criteria),'')=''
     or coalesce(btrim(p_resolution_source),'')='' or coalesce(btrim(p_issuer_version),'')='' then
    raise exception 'INCOMPLETE_KAPPA_PREREGISTRATION';
  end if;
  v_payload := jsonb_build_object(
    'schema_version','KAPPA_V1_1',
    'claim_type',p_claim_type,
    'horizon_id',p_horizon_id,
    'horizon_end',p_horizon_end,
    'probability',p_probability,
    'claim',p_claim,
    'resolution_criteria',p_resolution_criteria,
    'resolution_source',p_resolution_source,
    'issuer_version',p_issuer_version,
    'supersedes_case_id',p_supersedes_case_id
  );
  return public.atlas_append_kappa_event(
    case when p_supersedes_case_id is null then 'CASE_SEALED' else 'CASE_REISSUED' end,
    p_case_id,p_ticker,v_payload
  );
end;
$$;

create or replace function public.atlas_resolve_kappa_case(
  p_case_id text,
  p_ticker text,
  p_outcome integer,
  p_resolution_evidence text,
  p_resolved_at timestamptz default now()
) returns public.atlas_kappa_ledger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_seal public.atlas_kappa_ledger;
begin
  if p_outcome not in (0,1) then raise exception 'INVALID_BINARY_OUTCOME'; end if;
  if coalesce(btrim(p_resolution_evidence),'')='' then raise exception 'RESOLUTION_EVIDENCE_REQUIRED'; end if;
  select * into v_seal from public.atlas_kappa_ledger
    where case_id=p_case_id and event_type in ('CASE_SEALED','CASE_REISSUED')
    order by seq desc limit 1;
  if not found then raise exception 'KAPPA_CASE_NOT_SEALED'; end if;
  if exists(select 1 from public.atlas_kappa_ledger where case_id=p_case_id and event_type in ('CASE_RESOLVED','CASE_INVALIDATED')) then
    raise exception 'KAPPA_CASE_ALREADY_TERMINAL';
  end if;
  return public.atlas_append_kappa_event('CASE_RESOLVED',p_case_id,p_ticker,
    jsonb_build_object('schema_version','KAPPA_V1_1','outcome',p_outcome,
      'resolution_evidence',p_resolution_evidence,'resolved_at',p_resolved_at,
      'sealed_seq',v_seal.seq,'sealed_record_hash',v_seal.record_hash));
end;
$$;

create or replace function public.atlas_invalidate_kappa_case(
  p_case_id text,
  p_ticker text,
  p_reason text
) returns public.atlas_kappa_ledger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_seal public.atlas_kappa_ledger;
begin
  if coalesce(btrim(p_reason),'')='' then raise exception 'INVALIDATION_REASON_REQUIRED'; end if;
  select * into v_seal from public.atlas_kappa_ledger
    where case_id=p_case_id and event_type in ('CASE_SEALED','CASE_REISSUED')
    order by seq desc limit 1;
  if not found then raise exception 'KAPPA_CASE_NOT_SEALED'; end if;
  if exists(select 1 from public.atlas_kappa_ledger where case_id=p_case_id and event_type in ('CASE_RESOLVED','CASE_INVALIDATED')) then
    raise exception 'KAPPA_CASE_ALREADY_TERMINAL';
  end if;
  return public.atlas_append_kappa_event('CASE_INVALIDATED',p_case_id,p_ticker,
    jsonb_build_object('schema_version','KAPPA_V1_1','reason',p_reason,
      'sealed_seq',v_seal.seq,'sealed_record_hash',v_seal.record_hash));
end;
$$;

create or replace function public.atlas_verify_gamma_chain()
returns table(ok boolean, broken_seq bigint, reason text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  r public.atlas_gamma_ledger;
  v_prev text := repeat('0',64);
  v_expected text;
begin
  for r in select * from public.atlas_gamma_ledger order by seq loop
    if r.prev_hash is distinct from v_prev then return query select false,r.seq,'PREV_HASH_MISMATCH'; return; end if;
    v_expected := public.atlas_sha256_hex(public.atlas_canonical_event_text('GAMMA',r.seq,r.event_type,r.falsifier_id,r.ticker,r.payload,r.sealed_at,r.prev_hash));
    if r.record_hash is distinct from v_expected then return query select false,r.seq,'RECORD_HASH_MISMATCH'; return; end if;
    v_prev := r.record_hash;
  end loop;
  return query select true,null::bigint,'OK';
end;
$$;

create or replace function public.atlas_verify_kappa_chain()
returns table(ok boolean, broken_seq bigint, reason text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  r public.atlas_kappa_ledger;
  v_prev text := repeat('0',64);
  v_expected text;
begin
  for r in select * from public.atlas_kappa_ledger order by seq loop
    if r.prev_hash is distinct from v_prev then return query select false,r.seq,'PREV_HASH_MISMATCH'; return; end if;
    v_expected := public.atlas_sha256_hex(public.atlas_canonical_event_text('KAPPA',r.seq,r.event_type,r.case_id,r.ticker,r.payload,r.sealed_at,r.prev_hash));
    if r.record_hash is distinct from v_expected then return query select false,r.seq,'RECORD_HASH_MISMATCH'; return; end if;
    v_prev := r.record_hash;
  end loop;
  return query select true,null::bigint,'OK';
end;
$$;

alter table public.atlas_gamma_ledger enable row level security;
alter table public.atlas_kappa_ledger enable row level security;
revoke insert, update, delete on public.atlas_gamma_ledger from public;
revoke insert, update, delete on public.atlas_kappa_ledger from public;
revoke all on function public.atlas_append_gamma_event(text,text,text,jsonb) from public;
revoke all on function public.atlas_append_kappa_event(text,text,text,jsonb) from public;

-- On Supabase, only the service role should seal/resolve events directly.
do $$
begin
  if exists(select 1 from pg_roles where rolname='anon') then
    execute 'revoke insert, update, delete on public.atlas_gamma_ledger from anon';
    execute 'revoke insert, update, delete on public.atlas_kappa_ledger from anon';
  end if;
  if exists(select 1 from pg_roles where rolname='authenticated') then
    execute 'revoke insert, update, delete on public.atlas_gamma_ledger from authenticated';
    execute 'revoke insert, update, delete on public.atlas_kappa_ledger from authenticated';
  end if;
  if exists(select 1 from pg_roles where rolname='service_role') then
    execute 'grant execute on function public.atlas_seal_gamma_falsifier(text,text,text,numeric,text,text,date,date,text,numeric,text,numeric,text,numeric,text,boolean,boolean,boolean,text) to service_role';
    execute 'grant execute on function public.atlas_invalidate_gamma_falsifier(text,text,text) to service_role';
    execute 'grant execute on function public.atlas_seal_kappa_case(text,text,text,text,date,numeric,text,text,text,text,text) to service_role';
    execute 'grant execute on function public.atlas_resolve_kappa_case(text,text,integer,text,timestamptz) to service_role';
    execute 'grant execute on function public.atlas_invalidate_kappa_case(text,text,text) to service_role';
    execute 'grant execute on function public.atlas_verify_gamma_chain() to service_role';
    execute 'grant execute on function public.atlas_verify_kappa_chain() to service_role';
  end if;
end $$;
