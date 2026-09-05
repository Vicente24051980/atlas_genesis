-- ATLAS Ω — explicit function privilege hardening for Γ/Κ ledgers.
-- PostgreSQL grants EXECUTE on new functions to PUBLIC by default; revoke it.

revoke all on function public.atlas_seal_gamma_falsifier(text,text,text,numeric,text,text,date,date,text,numeric,text,numeric,text,numeric,text,boolean,boolean,boolean,text) from public;
revoke all on function public.atlas_invalidate_gamma_falsifier(text,text,text) from public;
revoke all on function public.atlas_seal_kappa_case(text,text,text,text,date,numeric,text,text,text,text,text) from public;
revoke all on function public.atlas_resolve_kappa_case(text,text,integer,text,timestamptz) from public;
revoke all on function public.atlas_invalidate_kappa_case(text,text,text) from public;
revoke all on function public.atlas_verify_gamma_chain() from public;
revoke all on function public.atlas_verify_kappa_chain() from public;

-- Internal append helpers remain non-public.
revoke all on function public.atlas_append_gamma_event(text,text,text,jsonb) from public;
revoke all on function public.atlas_append_kappa_event(text,text,text,jsonb) from public;

-- Supabase service_role is the only application role granted direct ledger mutation/verification functions.
do $$
begin
  if exists(select 1 from pg_roles where rolname='anon') then
    execute 'revoke all on function public.atlas_seal_gamma_falsifier(text,text,text,numeric,text,text,date,date,text,numeric,text,numeric,text,numeric,text,boolean,boolean,boolean,text) from anon';
    execute 'revoke all on function public.atlas_invalidate_gamma_falsifier(text,text,text) from anon';
    execute 'revoke all on function public.atlas_seal_kappa_case(text,text,text,text,date,numeric,text,text,text,text,text) from anon';
    execute 'revoke all on function public.atlas_resolve_kappa_case(text,text,integer,text,timestamptz) from anon';
    execute 'revoke all on function public.atlas_invalidate_kappa_case(text,text,text) from anon';
    execute 'revoke all on function public.atlas_verify_gamma_chain() from anon';
    execute 'revoke all on function public.atlas_verify_kappa_chain() from anon';
  end if;
  if exists(select 1 from pg_roles where rolname='authenticated') then
    execute 'revoke all on function public.atlas_seal_gamma_falsifier(text,text,text,numeric,text,text,date,date,text,numeric,text,numeric,text,numeric,text,boolean,boolean,boolean,text) from authenticated';
    execute 'revoke all on function public.atlas_invalidate_gamma_falsifier(text,text,text) from authenticated';
    execute 'revoke all on function public.atlas_seal_kappa_case(text,text,text,text,date,numeric,text,text,text,text,text) from authenticated';
    execute 'revoke all on function public.atlas_resolve_kappa_case(text,text,integer,text,timestamptz) from authenticated';
    execute 'revoke all on function public.atlas_invalidate_kappa_case(text,text,text) from authenticated';
    execute 'revoke all on function public.atlas_verify_gamma_chain() from authenticated';
    execute 'revoke all on function public.atlas_verify_kappa_chain() from authenticated';
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
