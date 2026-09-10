-- Remove an obsolete database trigger firewall that contradicted the CRM permission matrix.
-- RLS + has_permission remains the single authorization source for every module.
do $$
declare rule record;
begin
  for rule in
    select n.nspname as schema_name, c.relname as table_name, t.tgname as trigger_name
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_proc p on p.oid = t.tgfoid
    where not t.tgisinternal
      and n.nspname = 'public'
      and pg_get_functiondef(p.oid) ilike '%can modify authorized HRMS, messaging, finance and staff-access records only%'
  loop
    execute format('drop trigger if exists %I on %I.%I', rule.trigger_name, rule.schema_name, rule.table_name);
  end loop;
end $$;

create or replace function public.next_b2b_code()
returns text language sql security definer set search_path=public as $$
  select 'B2B-' || lpad((coalesce(max(nullif(regexp_replace(code, '[^0-9]', '', 'g'), '')::integer), 100) + 1)::text, 3, '0')
  from public.b2b_partners;
$$;

revoke all on function public.next_b2b_code() from public;
grant execute on function public.next_b2b_code() to authenticated;
