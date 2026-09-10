-- Shared, multi-device persistence for B2B partners and university catalogues.
create table if not exists public.b2b_partners (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  partner_type text not null,
  country text not null,
  country_code text not null,
  city text,
  photo_url text,
  contact_person text not null,
  contact_email text not null,
  contact_phone text not null,
  status text not null,
  commission_terms text not null,
  agreement_status text not null,
  agreement_expiry date,
  assigned_staff text not null default '',
  next_follow_up date,
  referred_students_count integer not null default 0,
  total_payout_claimed text not null default '',
  notes text not null default '',
  created_by uuid references public.staff_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_university_catalog (
  id text primary key,
  country_code text not null check (char_length(country_code) = 2),
  country text not null,
  name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references public.staff_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partner_university_catalog_country_idx
  on public.partner_university_catalog(country_code, name);

alter table public.b2b_partners enable row level security;
alter table public.partner_university_catalog enable row level security;

drop policy if exists b2b_partners_read on public.b2b_partners;
drop policy if exists b2b_partners_manage on public.b2b_partners;
create policy b2b_partners_read on public.b2b_partners for select to authenticated
  using (public.has_permission('b2b.view'));
create policy b2b_partners_manage on public.b2b_partners for all to authenticated
  using (public.has_permission('b2b.edit')) with check (public.has_permission('b2b.edit'));

drop policy if exists partner_university_catalog_read on public.partner_university_catalog;
drop policy if exists partner_university_catalog_manage on public.partner_university_catalog;
create policy partner_university_catalog_read on public.partner_university_catalog for select to authenticated
  using (public.has_permission('counselling.view'));
create policy partner_university_catalog_manage on public.partner_university_catalog for all to authenticated
  using (public.has_permission('counselling.edit')) with check (public.has_permission('counselling.edit'));

create or replace function public.next_b2b_code()
returns text language sql security definer set search_path=public as $$
  select 'B2B-' || lpad((coalesce(max(nullif(regexp_replace(code, '\\D', '', 'g'), '')::integer), 100) + 1)::text, 3, '0')
  from public.b2b_partners;
$$;

revoke all on function public.next_b2b_code() from public;
grant execute on function public.next_b2b_code() to authenticated;
