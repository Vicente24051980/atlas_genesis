-- Supabase installs pgcrypto in schema extensions. Qualify digest explicitly.
create or replace function public.atlas_sha256_hex(p_text text)
returns text
language sql immutable
as $$
  select encode(extensions.digest(convert_to(p_text, 'UTF8'), 'sha256'::text), 'hex');
$$;
