-- ATLAS Ω — portable pgcrypto schema resolution.
-- Supabase commonly places pgcrypto in schema `extensions`, while vanilla PostgreSQL
-- commonly installs it in `public`. Resolve the actual extension schema once at migration
-- time and bake that qualified name into atlas_sha256_hex().

do $migration$
declare
  v_schema text;
  v_sql text;
begin
  select n.nspname
    into v_schema
  from pg_extension e
  join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'pgcrypto';

  if v_schema is null then
    raise exception 'PGCRYPTO_EXTENSION_NOT_FOUND';
  end if;

  v_sql := format($fn$
    create or replace function public.atlas_sha256_hex(p_text text)
    returns text
    language sql immutable
    as $body$
      select encode(%I.digest(convert_to(p_text, 'UTF8'), 'sha256'::text), 'hex');
    $body$;
  $fn$, v_schema);

  execute v_sql;
end
$migration$;
