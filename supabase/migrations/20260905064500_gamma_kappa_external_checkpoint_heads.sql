-- ATLAS Ω — expose current ledger heads for external GitHub Governance anchoring.
-- Hash-chain integrity inside Supabase detects ordinary tampering.
-- A checkpoint stored outside the database detects privileged full-history rewrites
-- followed by recomputation of all internal hashes.

create or replace function public.atlas_ledger_heads()
returns table(stream text, head_seq bigint, head_hash text)
language sql
security definer
set search_path = public, pg_temp
as $$
  (select 'GAMMA'::text, g.seq, g.record_hash
   from public.atlas_gamma_ledger g
   order by g.seq desc
   limit 1)
  union all
  (select 'KAPPA'::text, k.seq, k.record_hash
   from public.atlas_kappa_ledger k
   order by k.seq desc
   limit 1);
$$;

revoke all on function public.atlas_ledger_heads() from public;
do $$
begin
  if exists(select 1 from pg_roles where rolname='service_role') then
    execute 'grant execute on function public.atlas_ledger_heads() to service_role';
  end if;
end $$;
