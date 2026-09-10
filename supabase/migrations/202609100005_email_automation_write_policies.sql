-- Allow authorized communication administrators to maintain templates and automations directly.
drop policy if exists email_admin_templates_write on public.email_templates;
drop policy if exists email_admin_automations_write on public.email_automations;
create policy email_admin_templates_write on public.email_templates for all to authenticated
  using (public.has_permission('email.manage')) with check (public.has_permission('email.manage'));
create policy email_admin_automations_write on public.email_automations for all to authenticated
  using (public.has_permission('email.manage')) with check (public.has_permission('email.manage'));

