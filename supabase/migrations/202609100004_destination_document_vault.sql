-- Store Abroad destination resources in the same protected object bucket as the CRM vault.
create table if not exists public.destination_documents (
  id uuid primary key default gen_random_uuid(),
  destination_code text not null references public.study_destination_catalog(code) on delete cascade,
  document_name text not null,
  storage_path text not null unique,
  file_size bigint not null check (file_size > 0 and file_size <= 20971520),
  mime_type text not null,
  status text not null default 'UNDER_REVIEW' check (status in ('UNDER_REVIEW','VERIFIED','ACTION_REQUIRED','REJECTED','EXPIRED')),
  notes text not null default '',
  uploaded_by uuid not null references public.staff_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.destination_documents enable row level security;
drop policy if exists destination_documents_read on public.destination_documents;
drop policy if exists destination_documents_insert on public.destination_documents;
drop policy if exists destination_documents_update on public.destination_documents;
drop policy if exists destination_documents_delete on public.destination_documents;
create policy destination_documents_read on public.destination_documents for select to authenticated
  using (public.has_permission('documents.view') or public.has_permission('counselling.view'));
create policy destination_documents_insert on public.destination_documents for insert to authenticated
  with check (public.has_permission('documents.upload') or public.has_permission('counselling.edit'));
create policy destination_documents_update on public.destination_documents for update to authenticated
  using (public.has_permission('documents.review')) with check (public.has_permission('documents.review'));
create policy destination_documents_delete on public.destination_documents for delete to authenticated
  using (public.has_permission('documents.delete') or public.has_permission('counselling.edit'));

