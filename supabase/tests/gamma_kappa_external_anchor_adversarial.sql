\set ON_ERROR_STOP on

truncate table public.atlas_gamma_ledger restart identity;

select (public.atlas_seal_gamma_falsifier(
  'ANCHOR-1','AAA','growth',20,'pct','10-Q','2026-06-30','2026-06-30',
  '<',10,'<',0,'2Q',0.5,'MAJOR',true,true,true,null
)).record_hash;
select (public.atlas_seal_gamma_falsifier(
  'ANCHOR-2','BBB','growth',20,'pct','10-Q','2026-06-30','2026-06-30',
  '<',10,'<',0,'2Q',0.5,'MAJOR',true,true,true,null
)).record_hash;

create temporary table expected_anchor as select * from public.atlas_gamma_chain_head();

do $$
declare a record; v_ok boolean; begin
  select * into a from expected_anchor;
  select ok into v_ok from public.atlas_verify_gamma_against_anchor(a.head_seq,a.head_hash);
  if not v_ok then raise exception 'ANCHOR_SHOULD_VERIFY_BEFORE_TAMPER'; end if;
end $$;

-- A same-database chain alone cannot prove that the valid tail was not deleted.
-- Simulate privileged tail deletion: retained records remain internally valid,
-- but the externally anchored head must fail.
alter table public.atlas_gamma_ledger disable trigger atlas_gamma_immutable;
delete from public.atlas_gamma_ledger where seq=(select max(seq) from public.atlas_gamma_ledger);
alter table public.atlas_gamma_ledger enable trigger atlas_gamma_immutable;

do $$
declare a record; v_internal boolean; v_anchor boolean; v_reason text; begin
  select ok into v_internal from public.atlas_verify_gamma_chain();
  if not v_internal then raise exception 'SHORTENED_CHAIN_EXPECTED_TO_BE_INTERNALLY_VALID'; end if;
  select * into a from expected_anchor;
  select ok,reason into v_anchor,v_reason from public.atlas_verify_gamma_against_anchor(a.head_seq,a.head_hash);
  if v_anchor or v_reason <> 'ANCHOR_SEQ_MISMATCH' then
    raise exception 'TAIL_DELETION_NOT_DETECTED_BY_EXTERNAL_ANCHOR:%',coalesce(v_reason,'NULL');
  end if;
end $$;

-- Full truncation likewise requires an external checkpoint to be detectable.
truncate table public.atlas_gamma_ledger restart identity;
do $$
declare a record; v_anchor boolean; begin
  select * into a from expected_anchor;
  select ok into v_anchor from public.atlas_verify_gamma_against_anchor(a.head_seq,a.head_hash);
  if v_anchor then raise exception 'TRUNCATION_NOT_DETECTED_BY_EXTERNAL_ANCHOR'; end if;
end $$;

select 'EXTERNAL_ANCHOR_TESTS_PASS' as result;
