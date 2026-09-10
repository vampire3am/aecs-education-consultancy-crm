-- The seeded ADMIN matrix had management permissions disabled, which made the
-- administrator UI appear editable while every write was rejected by RLS.
update public.permissions
set enabled = true
where role in ('ADMIN', 'DIRECTOR');
