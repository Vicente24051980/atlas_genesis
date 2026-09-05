-- ATLAS Ω — Supabase security-linter hardening for Γ/Κ ledger functions.
-- No RPC is callable by anon/authenticated. Only sanctioned service_role entrypoints
-- retain EXECUTE; internal helpers are owner-only.

alter function public.atlas_block_ledger_mutation() set search_path = pg_catalog, public;
alter function public.atlas_canonical_event_text(text,bigint,text,text,text,jsonb,timestamptz,text) set search_path = pg_catalog, public;
alter function public.atlas_threshold_crossed(numeric,text,numeric) set search_path = pg_catalog, public;
alter function public.atlas_validate_gamma_thresholds(numeric,text,numeric,text,numeric) set search_path = pg_catalog, public;
alter function public.atlas_sha256_hex(text) set search_path = pg_catalog, public, extensions;

-- PostgreSQL function EXECUTE defaults and pre-existing explicit grants are removed.
do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as fn
    from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname like 'atlas_%'
  loop
    execute format('revoke all on function %s from public', r.fn);
    if exists(select 1 from pg_roles where rolname='anon') then
      execute format('revoke all on function %s from anon', r.fn);
    end if;
    if exists(select 1 from pg_roles where rolname='authenticated') then
      execute format('revoke all on function %s from authenticated', r.fn);
    end if;
    if exists(select 1 from pg_roles where rolname='service_role') then
      execute format('revoke all on function %s from service_role', r.fn);
    end if;
  end loop;
end $$;

-- Only sanctioned application entrypoints are callable by service_role.
do $$
begin
  if exists(select 1 from pg_roles where rolname='service_role') then
    grant execute on function public.atlas_seal_gamma_falsifier(text,text,text,numeric,text,text,date,date,text,numeric,text,numeric,text,numeric,text,boolean,boolean,boolean,text) to service_role;
    grant execute on function public.atlas_invalidate_gamma_falsifier(text,text,text) to service_role;
    grant execute on function public.atlas_seal_kappa_case(text,text,text,text,date,numeric,text,text,text,text,text) to service_role;
    grant execute on function public.atlas_resolve_kappa_case(text,text,integer,text,timestamptz) to service_role;
    grant execute on function public.atlas_invalidate_kappa_case(text,text,text) to service_role;
    grant execute on function public.atlas_verify_gamma_chain() to service_role;
    grant execute on function public.atlas_verify_kappa_chain() to service_role;
    grant execute on function public.atlas_gamma_chain_head() to service_role;
    grant execute on function public.atlas_kappa_chain_head() to service_role;
    grant execute on function public.atlas_ledger_heads() to service_role;
    grant execute on function public.atlas_verify_gamma_against_anchor(bigint,text) to service_role;
    grant execute on function public.atlas_verify_kappa_against_anchor(bigint,text) to service_role;
  end if;
end $$;
