-- Security tests for the database rules. Run with scripts/test-db.sh against a throwaway Postgres 15+.
\set ON_ERROR_STOP 1
create schema t;
create table t.results (n serial, name text, ok boolean, detail text);
grant usage on schema t to anon, authenticated;
grant insert, select on t.results to anon, authenticated;
grant usage on sequence t.results_n_seq to anon, authenticated;
create function t.try(q text) returns text language plpgsql as $$
begin execute q; return 'ok'; exception when others then return sqlstate || ': ' || sqlerrm; end $$;
create function t.ck(name text, ok boolean, detail text default '') returns void language sql as $$
  insert into t.results (name, ok, detail) values (name, coalesce(ok, false), detail) $$;
grant execute on all functions in schema t to anon, authenticated;

insert into auth.users values
 ('00000000-0000-0000-0000-0000000000ad', 'admin@pm.mv'),
 ('00000000-0000-0000-0000-00000000005e', 'seeker@pm.mv'),
 ('00000000-0000-0000-0000-0000000000c0', 'hr@company.mv'),
 ('00000000-0000-0000-0000-0000000000ee', 'other@pm.mv');
insert into public.admins values ('00000000-0000-0000-0000-0000000000ad');

\set ADMIN '''00000000-0000-0000-0000-0000000000ad'''
\set SEEK '''00000000-0000-0000-0000-00000000005e'''
\set CO '''00000000-0000-0000-0000-0000000000c0'''
\set OTHER '''00000000-0000-0000-0000-0000000000ee'''

-- ===== Seeker creates a CV =====
reset role; select set_config('request.jwt.claim.sub', :SEEK, false); set role authenticated;
select t.ck('seeker creates own CV', t.try($q$insert into public.profiles (id, full_name, title, verified) values ('00000000-0000-0000-0000-00000000005e', 'Hassan Diver', 'Dive Instructor', true)$q$) = 'ok');
select t.ck('self-verify on insert is ignored', (select not verified from public.profiles where id = auth.uid()));
select t.ck('cannot create a CV for someone else', t.try($q$insert into public.profiles (id, full_name, title) values ('00000000-0000-0000-0000-0000000000ee', 'Fake', 'Fake')$q$) <> 'ok');
select t.ck('seeker saves private contact', t.try($q$insert into public.profile_contacts (user_id, email, phone) values ('00000000-0000-0000-0000-00000000005e', 'hassan@example.mv', '+960 7771234')$q$) = 'ok');
update public.profiles set verified = true, title = 'Senior Dive Instructor' where id = auth.uid();
select t.ck('self-verify on update is ignored', (select not verified and title = 'Senior Dive Instructor' from public.profiles where id = auth.uid()));

-- ===== Company requests a profile =====
reset role; select set_config('request.jwt.claim.sub', :CO, false); set role authenticated;
select t.ck('company request is created', t.try($q$insert into public.companies (owner_id, name, status, verified) values ('00000000-0000-0000-0000-0000000000c0', 'Raa Dive Resort', 'approved', true)$q$) = 'ok');
select t.ck('company cannot self-approve on insert', (select status = 'pending' and not verified from public.companies where owner_id = auth.uid()));
select t.ck('company saves contact details', t.try($q$insert into public.company_contacts (company_id, contact_name, contact_email) select id, 'Mariyam Zeen', 'hr@resort.mv' from public.companies where owner_id = auth.uid()$q$) = 'ok');
select t.ck('pending company cannot post a job', t.try($q$insert into public.jobs (company_id, title) select id, 'Sneaky Job' from public.companies where owner_id = auth.uid()$q$) <> 'ok');
update public.companies set status = 'approved' where owner_id = auth.uid();
select t.ck('company cannot self-approve on update', (select status = 'pending' from public.companies where owner_id = auth.uid()));

-- ===== Public visitor =====
reset role; select set_config('request.jwt.claim.sub', '', false); set role anon;
select t.ck('visitor sees listed CV', (select count(*) = 1 from public.profiles));
select t.ck('visitor cannot see private contact', (select count(*) = 0 from public.profile_contacts));
select t.ck('visitor cannot see pending company', (select count(*) = 0 from public.companies));
select t.ck('visitor cannot create a CV', t.try($q$insert into public.profiles (id, full_name, title) values ('00000000-0000-0000-0000-0000000000ee', 'X', 'Y')$q$) <> 'ok');
select t.ck('visitor cannot read company contacts', t.try($q$select * from public.company_contacts$q$) <> 'ok');

-- ===== Another signed-in user =====
reset role; select set_config('request.jwt.claim.sub', :OTHER, false); set role authenticated;
update public.companies set status = 'approved';
select t.ck('other user sees no company contacts', (select count(*) = 0 from public.company_contacts));
reset role;
select t.ck('other user could not approve the company', (select status = 'pending' from public.companies));

-- ===== Admin approves =====
select set_config('request.jwt.claim.sub', :ADMIN, false); set role authenticated;
select t.ck('admin sees the request contact', (select count(*) = 1 from public.company_contacts));
update public.companies set status = 'approved' where owner_id = '00000000-0000-0000-0000-0000000000c0';
select t.ck('admin approved the company', (select status = 'approved' and reviewed_at is not null from public.companies where owner_id = '00000000-0000-0000-0000-0000000000c0'));

-- ===== Approved company posts jobs =====
reset role; select set_config('request.jwt.claim.sub', :CO, false); set role authenticated;
select t.ck('approved company posts a job', t.try($q$insert into public.jobs (id, company_id, title, salary_min, salary_max) select '10000000-0000-0000-0000-000000000001', id, 'Dive Instructor', 18000, 22000 from public.companies where owner_id = auth.uid()$q$) = 'ok');
select t.ck('approved company posts a closed job', t.try($q$insert into public.jobs (id, company_id, title, is_open) select '10000000-0000-0000-0000-000000000002', id, 'Pastry Chef', false from public.companies where owner_id = auth.uid()$q$) = 'ok');
select t.ck('salary range must make sense', t.try($q$insert into public.jobs (company_id, title, salary_min, salary_max) select id, 'Bad', 20000, 100 from public.companies where owner_id = auth.uid()$q$) <> 'ok');
select t.ck('company cannot see seeker contact before they apply', (select count(*) = 0 from public.profile_contacts));

reset role; select set_config('request.jwt.claim.sub', '', false); set role anon;
select t.ck('visitor sees approved company and its jobs', (select count(*) = 1 from public.companies) and (select count(*) = 2 from public.jobs));

-- ===== Seeker applies =====
reset role; select set_config('request.jwt.claim.sub', :SEEK, false); set role authenticated;
select t.ck('seeker applies to open job', t.try($q$insert into public.applications (job_id, applicant_id, note) values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000005e', 'Available in January')$q$) = 'ok');
select t.ck('cannot apply to a closed job', t.try($q$insert into public.applications (job_id, applicant_id) values ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000005e')$q$) <> 'ok');
select t.ck('cannot apply as someone else', t.try($q$insert into public.applications (job_id, applicant_id) values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000ee')$q$) <> 'ok');
select t.ck('cannot apply twice', t.try($q$insert into public.applications (job_id, applicant_id) values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000005e')$q$) <> 'ok');
update public.applications set status = 'offered';
reset role;
select t.ck('applicant cannot change own status', (select status = 'applied' from public.applications));

-- ===== Company reviews =====
select set_config('request.jwt.claim.sub', :CO, false); set role authenticated;
select t.ck('company sees the application', (select count(*) = 1 from public.applications));
select t.ck('company now sees applicant contact', (select count(*) = 1 from public.profile_contacts));
update public.applications set status = 'shortlisted', note = 'tampered';
select t.ck('company shortlists but cannot edit the note', (select status = 'shortlisted' and note = 'Available in January' from public.applications));
select t.ck('company invites seeker', t.try($q$insert into public.invitations (job_id, profile_id) values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000005e')$q$) = 'ok');
select t.ck('cannot invite to a closed job', t.try($q$insert into public.invitations (job_id, profile_id) values ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000005e')$q$) <> 'ok');

-- ===== Other user sees none of it =====
reset role; select set_config('request.jwt.claim.sub', :OTHER, false); set role authenticated;
select t.ck('other user sees no applications', (select count(*) = 0 from public.applications));
select t.ck('other user sees no invitations', (select count(*) = 0 from public.invitations));
select t.ck('other user sees no private contacts', (select count(*) = 0 from public.profile_contacts));
select t.ck('other user cannot invite', t.try($q$insert into public.invitations (job_id, profile_id) values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000005e')$q$) <> 'ok');
select t.ck('other user cannot edit someone else''s job', (select 1 from (select 1) x) = 1 and t.try($q$update public.jobs set title = 'Hacked'$q$) = 'ok');
reset role;
select t.ck('job title unchanged after other user update', (select count(*) = 0 from public.jobs where title = 'Hacked'));

-- ===== Seeker: invitations, saved jobs, privacy choices =====
select set_config('request.jwt.claim.sub', :SEEK, false); set role authenticated;
select t.ck('seeker sees invitation', (select count(*) = 1 from public.invitations));
select t.ck('seeker saves a job', t.try($q$insert into public.saved_jobs (job_id) values ('10000000-0000-0000-0000-000000000001')$q$) = 'ok');
update public.profiles set show_contact = true, open_to_work = true where id = auth.uid();
reset role; select set_config('request.jwt.claim.sub', :OTHER, false); set role authenticated;
select t.ck('saved jobs are private', (select count(*) = 0 from public.saved_jobs));
select t.ck('cannot save a job for someone else', t.try($q$insert into public.saved_jobs (user_id, job_id) values ('00000000-0000-0000-0000-00000000005e', '10000000-0000-0000-0000-000000000002')$q$) <> 'ok');
reset role; select set_config('request.jwt.claim.sub', '', false); set role anon;
select t.ck('public contact visible once the person chooses', (select count(*) = 1 from public.profile_contacts));
reset role; select set_config('request.jwt.claim.sub', :SEEK, false); set role authenticated;
update public.profiles set published = false where id = auth.uid();
reset role; select set_config('request.jwt.claim.sub', '', false); set role anon;
select t.ck('unlisted CV hidden from visitors', (select count(*) = 0 from public.profiles) and (select count(*) = 0 from public.profile_contacts));
reset role; select set_config('request.jwt.claim.sub', :CO, false); set role authenticated;
select t.ck('company still sees an applicant''s unlisted CV', (select count(*) = 1 from public.profiles));

-- ===== Decline, resubmit, revoke =====
reset role; select set_config('request.jwt.claim.sub', :ADMIN, false); set role authenticated;
update public.companies set status = 'declined' where owner_id = '00000000-0000-0000-0000-0000000000c0';
reset role; select set_config('request.jwt.claim.sub', '', false); set role anon;
select t.ck('jobs of a declined company disappear', (select count(*) = 0 from public.jobs));
reset role; select set_config('request.jwt.claim.sub', :SEEK, false); set role authenticated;
select t.ck('cannot apply while company is not approved', t.try($q$delete from public.applications; insert into public.applications (job_id, applicant_id) values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000005e')$q$) <> 'ok');
reset role; select set_config('request.jwt.claim.sub', :CO, false); set role authenticated;
update public.companies set about = 'Updated details' where owner_id = auth.uid();
select t.ck('editing a declined request sends it again', (select status = 'pending' from public.companies where owner_id = auth.uid()));

-- ===== Admin moderation =====
reset role; select set_config('request.jwt.claim.sub', :ADMIN, false); set role authenticated;
update public.profiles set verified = true where id = '00000000-0000-0000-0000-00000000005e';
select t.ck('admin verifies a CV', (select verified from public.profiles where id = '00000000-0000-0000-0000-00000000005e'));
select t.ck('admin removes a CV', t.try($q$delete from public.profiles where id = '00000000-0000-0000-0000-00000000005e'$q$) = 'ok');
select t.ck('removed CV is gone', (select count(*) = 0 from public.profiles));

reset role;
select n, case when ok then 'PASS' else 'FAIL' end as result, name, detail from t.results order by n;
select count(*) filter (where ok) as passed, count(*) filter (where not ok) as failed from t.results;
