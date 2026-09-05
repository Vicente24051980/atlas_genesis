\set ON_ERROR_STOP on

truncate table public.atlas_gamma_ledger restart identity;
truncate table public.atlas_kappa_ledger restart identity;

-- A1: a falsifier cannot be born already AMBER.
do $$
begin
  begin
    perform public.atlas_seal_gamma_falsifier(
      'TEST-A1','TEST','margin',59,'pct','filing','2026-06-30','2026-06-30',
      '<',62,'<',52,'1Q',0.25,'MAJOR',true,true,true,null
    );
    raise exception 'TEST_A1_DID_NOT_REJECT';
  exception when others then
    if position('THRESHOLD_ALREADY_BREACHED' in sqlerrm)=0 then raise; end if;
  end;
end $$;

-- A7: baseline must be the latest published period at seal time.
do $$
begin
  begin
    perform public.atlas_seal_gamma_falsifier(
      'TEST-A7','TEST','growth',20,'pct','filing','2026-03-31','2026-06-30',
      '<',10,'<',0,'2Q',0.25,'MAJOR',true,true,true,null
    );
    raise exception 'TEST_A7_DID_NOT_REJECT';
  exception when others then
    if position('BASELINE_NON_STANDARD' in sqlerrm)=0 then raise; end if;
  end;
end $$;

-- Valid Γ records establish a chain.
select (public.atlas_seal_gamma_falsifier(
  'TEST-G1','AAA','growth',20,'pct','filing-A','2026-06-30','2026-06-30',
  '<',10,'<',0,'2Q',0.30,'MAJOR',true,true,true,null
)).record_hash;
select (public.atlas_seal_gamma_falsifier(
  'TEST-G2','BBB','leverage',1.2,'x','filing-B','2026-06-30','2026-06-30',
  '>',2.0,'>',3.0,'1Q',0.70,'CRITICAL',true,true,true,null
)).record_hash;

do $$
declare v_ok boolean; begin
  select ok into v_ok from public.atlas_verify_gamma_chain();
  if not v_ok then raise exception 'GAMMA_CHAIN_SHOULD_VERIFY'; end if;
end $$;

-- A8/A5 normal path: sealed rows cannot be changed or deleted.
do $$
begin
  begin
    update public.atlas_gamma_ledger set payload=jsonb_set(payload,'{weight}','0.01'::jsonb) where falsifier_id='TEST-G1';
    raise exception 'UPDATE_WAS_NOT_BLOCKED';
  exception when others then
    if position('APPEND_ONLY_LEDGER_MUTATION_BLOCKED' in sqlerrm)=0 then raise; end if;
  end;
  begin
    delete from public.atlas_gamma_ledger where falsifier_id='TEST-G1';
    raise exception 'DELETE_WAS_NOT_BLOCKED';
  exception when others then
    if position('APPEND_ONLY_LEDGER_MUTATION_BLOCKED' in sqlerrm)=0 then raise; end if;
  end;
end $$;

-- A5 privileged tampering simulation: even if immutability is bypassed, verification detects it.
alter table public.atlas_gamma_ledger disable trigger atlas_gamma_immutable;
update public.atlas_gamma_ledger
set payload=jsonb_set(payload,'{weight}','0.01'::jsonb)
where falsifier_id='TEST-G1';
alter table public.atlas_gamma_ledger enable trigger atlas_gamma_immutable;

do $$
declare v_ok boolean; v_reason text; begin
  select ok,reason into v_ok,v_reason from public.atlas_verify_gamma_chain();
  if v_ok or v_reason <> 'RECORD_HASH_MISMATCH' then
    raise exception 'LEDGER_TAMPERED_NOT_DETECTED:%',coalesce(v_reason,'NULL');
  end if;
end $$;

-- Reset after intentional corruption.
truncate table public.atlas_gamma_ledger restart identity;

-- Kappa: seal -> resolution is append-only and criteria remain only on seal event.
select (public.atlas_seal_kappa_case(
  'K-TEST-1','AAA','THESIS','4Q','2027-06-30',0.70,
  'Revenue grows >=10%','Revenue YoY >=10% in each of four quarters','10-Q/10-K','ATLAS-v4.18',null
)).record_hash;
select (public.atlas_resolve_kappa_case(
  'K-TEST-1','AAA',1,'10-Q/10-K evidence','2027-06-30T12:00:00Z'
)).record_hash;

do $$
declare v_count int; v_ok boolean; begin
  select count(*) into v_count from public.atlas_kappa_ledger where case_id='K-TEST-1';
  if v_count <> 2 then raise exception 'KAPPA_EVENT_COUNT_WRONG:%',v_count; end if;
  select ok into v_ok from public.atlas_verify_kappa_chain();
  if not v_ok then raise exception 'KAPPA_CHAIN_SHOULD_VERIFY'; end if;
  begin
    perform public.atlas_resolve_kappa_case('K-TEST-1','AAA',0,'second outcome','2027-07-01T00:00:00Z');
    raise exception 'SECOND_TERMINAL_EVENT_ALLOWED';
  exception when others then
    if position('KAPPA_CASE_ALREADY_TERMINAL' in sqlerrm)=0 then raise; end if;
  end;
end $$;

-- Original Kappa preregistration cannot be mutated.
do $$
begin
  begin
    update public.atlas_kappa_ledger
    set payload=jsonb_set(payload,'{probability}','0.2'::jsonb)
    where event_type='CASE_SEALED' and case_id='K-TEST-1';
    raise exception 'KAPPA_UPDATE_WAS_NOT_BLOCKED';
  exception when others then
    if position('APPEND_ONLY_LEDGER_MUTATION_BLOCKED' in sqlerrm)=0 then raise; end if;
  end;
end $$;

select 'ADVERSARIAL_LEDGER_TESTS_PASS' as result;
