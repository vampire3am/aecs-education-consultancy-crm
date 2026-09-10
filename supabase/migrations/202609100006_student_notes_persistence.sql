create table if not exists public.student_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 5000),
  created_by uuid not null references public.staff_profiles(id),
  created_at timestamptz not null default now()
);
alter table public.student_notes enable row level security;
drop policy if exists student_notes_read on public.student_notes;
drop policy if exists student_notes_insert on public.student_notes;
create policy student_notes_read on public.student_notes for select to authenticated
  using (public.has_permission('students.view'));
create policy student_notes_insert on public.student_notes for insert to authenticated
  with check (public.has_permission('students.edit') and created_by = auth.uid());

