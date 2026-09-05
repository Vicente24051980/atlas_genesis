-- ATLAS Ω — external anchor verification.
-- A hash chain stored only in the same mutable database cannot prove that a valid tail was not deleted.
-- Production must persist (head_seq, head_hash) outside Supabase, canonically in GitHub Governance Log.

create or replace function public.atlas_gamma_chain_head()
returns table(head_seq bigint, head_hash text)
language sql
security definer
set search_path = public, pg_temp
as $$
  select
    coalesce((select max(g.seq) from public.atlas_gamma_ledger g),0)::bigint,
    coalesce((select g.record_hash from public.atlas_gamma_ledger g order by g.seq desc limit 1), repeat('0',64));
$$;

create or replace function public.atlas_kappa_chain_head()
returns table(head_seq bigint, head_hash text)
language sql
security definer
set search_path = public, pg_temp
as $$
  select
    coalesce((select max(k.seq) from public.atlas_kappa_ledger k),0)::bigint,
    coalesce((select k.record_hash from public.atlas_kappa_ledger k order by k.seq desc limit 1), repeat('0',64));
$$;

create or replace function public.atlas_verify_gamma_against_anchor(
  p_expected_seq bigint,
  p_expected_hash text
) returns table(ok boolean, broken_seq bigint, reason text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_chain record;
  v_head record;
begin
  select * into v_chain from public.atlas_verify_gamma_chain();
  if not v_chain.ok then return query select false,v_chain.broken_seq,v_chain.reason; return; end if;
  select * into v_head from public.atlas_gamma_chain_head();
  if v_head.head_seq is distinct from p_expected_seq then
    return query select false,v_head.head_seq,'ANCHOR_SEQ_MISMATCH'; return;
  end if;
  if v_head.head_hash is distinct from p_expected_hash then
    return query select false,v_head.head_seq,'ANCHOR_HASH_MISMATCH'; return;
  end if;
  return query select true,null::bigint,'OK';
end;
$$;

create or replace function public.atlas_verify_kappa_against_anchor(
  p_expected_seq bigint,
  p_expected_hash text
) returns table(ok boolean, broken_seq bigint, reason text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_chain record;
  v_head record;
begin
  select * into v_chain from public.atlas_verify_kappa_chain();
  if not v_chain.ok then return query select false,v_chain.broken_seq,v_chain.reason; return; end if;
  select * into v_head from public.atlas_kappa_chain_head();
  if v_head.head_seq is distinct from p_expected_seq then
    return query select false,v_head.head_seq,'ANCHOR_SEQ_MISMATCH'; return;
  end if;
  if v_head.head_hash is distinct from p_expected_hash then
    return query select false,v_head.head_seq,'ANCHOR_HASH_MISMATCH'; return;
  end if;
  return query select true,null::bigint,'OK';
end;
$$;

revoke all on function public.atlas_gamma_chain_head() from public;
revoke all on function public.atlas_kappa_chain_head() from public;
revoke all on function public.atlas_verify_gamma_against_anchor(bigint,text) from public;
revoke all on function public.atlas_verify_kappa_against_anchor(bigint,text) from public;

do $$
begin
  if exists(select 1 from pg_roles where rolname='service_role') then
    execute 'grant execute on function public.atlas_gamma_chain_head() to service_role';
    execute 'grant execute on function public.atlas_kappa_chain_head() to service_role';
    execute 'grant execute on function public.atlas_verify_gamma_against_anchor(bigint,text) to service_role';
    execute 'grant execute on function public.atlas_verify_kappa_against_anchor(bigint,text) to service_role';
  end if;
end $$;
