-- Portfolio Maldives: free CVs for everyone, job ads from approved companies.
--
-- Security model (enforced here, not in the browser):
--   * Anyone (even signed out) can read listed CVs, approved companies and their jobs.
--   * Anyone signed in can create one CV. Contact details live in a separate table
--     that only the owner, admins, companies they applied to, or everyone (if the
--     person chose "show my contact details") can read.
--   * Anyone signed in can request a company profile. It starts as 'pending' and
--     only admins can approve it. Only approved companies can post jobs.
--   * Applications are visible to the applicant, the hiring company and admins.
--
-- Admins are added by hand in the SQL editor (see README).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- CVs (profiles)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  slug text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
  full_name text not null check (char_length(full_name) between 1 and 120),
  title text not null check (char_length(title) between 1 and 120),
  headline text not null default '' check (char_length(headline) <= 200),
  sector text not null default '',
  atoll text not null default '',
  island text not null default '',
  years integer check (years between 0 and 60),
  summary text not null default '' check (char_length(summary) <= 3000),
  availability text[] not null default '{}',
  skills text[] not null default '{}',
  experience jsonb not null default '[]' check (jsonb_typeof(experience) = 'array'),
  education jsonb not null default '[]' check (jsonb_typeof(education) = 'array'),
  languages jsonb not null default '[]' check (jsonb_typeof(languages) = 'array'),
  certifications jsonb not null default '[]' check (jsonb_typeof(certifications) = 'array'),
  photo_path text check (photo_path is null or char_length(photo_path) <= 300),
  published boolean not null default true,
  open_to_work boolean not null default false,
  show_contact boolean not null default false,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Private contact details for a CV.
create table public.profile_contacts (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  email text check (email is null or char_length(email) <= 200),
  phone text check (phone is null or char_length(phone) <= 40),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Companies
-- ---------------------------------------------------------------------------
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  sector text not null default '',
  atoll text not null default '',
  island text not null default '',
  about text not null default '' check (char_length(about) <= 3000),
  website text check (website is null or website ~ '^https://'),
  logo_path text check (logo_path is null or char_length(logo_path) <= 300),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  verified boolean not null default false,
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Who the board team should contact about a company request. Owner and admins only.
create table public.company_contacts (
  company_id uuid primary key references public.companies (id) on delete cascade,
  contact_name text not null check (char_length(contact_name) between 1 and 120),
  contact_email text check (contact_email is null or char_length(contact_email) <= 200),
  contact_phone text check (contact_phone is null or char_length(contact_phone) <= 40),
  updated_at timestamptz not null default now(),
  check (contact_email is not null or contact_phone is not null)
);

-- ---------------------------------------------------------------------------
-- Jobs, applications, invitations, saved jobs
-- ---------------------------------------------------------------------------
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  type text not null default 'Full-time'
    check (type in ('Full-time', 'Part-time', 'Contract', 'Seasonal', 'Internship', 'Freelance')),
  sector text not null default '',
  atoll text not null default '',
  island text not null default '',
  salary_min integer check (salary_min >= 0),
  salary_max integer check (salary_max >= 0),
  deadline date,
  description text not null default '' check (char_length(description) <= 6000),
  requirements text not null default '' check (char_length(requirements) <= 3000),
  accommodation boolean not null default false,
  is_open boolean not null default true,
  posted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (salary_min is null or salary_max is null or salary_max >= salary_min)
);
create index jobs_company_idx on public.jobs (company_id);
create index jobs_open_idx on public.jobs (is_open, posted_at desc);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  applicant_id uuid not null references public.profiles (id) on delete cascade,
  note text not null default '' check (char_length(note) <= 1500),
  status text not null default 'applied' check (status in ('applied', 'shortlisted', 'offered', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, applicant_id)
);
create index applications_applicant_idx on public.applications (applicant_id);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (job_id, profile_id)
);
create index invitations_profile_idx on public.invitations (profile_id);

create table public.saved_jobs (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

-- ---------------------------------------------------------------------------
-- Helper checks (security definer so policies can look across tables)
-- ---------------------------------------------------------------------------
create or replace function public.owns_company(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.companies where id = cid and owner_id = auth.uid());
$$;

create or replace function public.company_approved(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.companies where id = cid and status = 'approved');
$$;

create or replace function public.owns_job(jid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.jobs j join public.companies c on c.id = j.company_id
    where j.id = jid and c.owner_id = auth.uid()
  );
$$;

create or replace function public.job_accepting(jid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.jobs j join public.companies c on c.id = j.company_id
    where j.id = jid and j.is_open and c.status = 'approved'
      and (j.deadline is null or j.deadline >= current_date)
  );
$$;

-- True when the person applied to a job at the caller's company.
create or replace function public.applied_to_me(pid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.applications a
    join public.jobs j on j.id = a.job_id
    join public.companies c on c.id = j.company_id
    where a.applicant_id = pid and c.owner_id = auth.uid()
  );
$$;

create or replace function public.contact_is_public(pid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = pid and published and show_contact);
$$;

-- ---------------------------------------------------------------------------
-- Field protection: people can't verify or approve themselves
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      new.verified := false;
    else
      new.verified := old.verified;
      new.id := old.id;
      new.slug := old.slug;
      new.created_at := old.created_at;
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.protect_company()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.verified := case when public.is_admin() then new.verified else false end;
    -- Admins' own companies are approved straight away; everyone else waits.
    new.status := case when public.is_admin() then 'approved' else 'pending' end;
    new.requested_at := now();
    new.reviewed_at := case when public.is_admin() then now() else null end;
    return new;
  end if;
  new.owner_id := old.owner_id;
  new.created_at := old.created_at;
  if not public.is_admin() then
    new.verified := old.verified;
    new.reviewed_at := old.reviewed_at;
    if old.status = 'declined' then
      -- Editing a declined request sends it again.
      new.status := 'pending';
      new.requested_at := now();
    else
      new.status := old.status;
      new.requested_at := old.requested_at;
    end if;
  elsif new.status is distinct from old.status then
    new.reviewed_at := now();
  end if;
  return new;
end;
$$;

create or replace function public.protect_application()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Companies may only change the status of an application.
  new.job_id := old.job_id;
  new.applicant_id := old.applicant_id;
  new.note := old.note;
  new.created_at := old.created_at;
  return new;
end;
$$;

create trigger profiles_protect before insert or update on public.profiles
  for each row execute function public.protect_profile();
create trigger companies_protect before insert or update on public.companies
  for each row execute function public.protect_company();
create trigger applications_protect before update on public.applications
  for each row execute function public.protect_application();

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger profile_contacts_touch before update on public.profile_contacts for each row execute function public.touch_updated_at();
create trigger companies_touch before update on public.companies for each row execute function public.touch_updated_at();
create trigger company_contacts_touch before update on public.company_contacts for each row execute function public.touch_updated_at();
create trigger jobs_touch before update on public.jobs for each row execute function public.touch_updated_at();
create trigger applications_touch before update on public.applications for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_contacts enable row level security;
alter table public.companies enable row level security;
alter table public.company_contacts enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.invitations enable row level security;
alter table public.saved_jobs enable row level security;

create policy "admins: see own row" on public.admins
  for select using (user_id = auth.uid() or public.is_admin());

create policy "profiles: read listed, own, applicants, admin" on public.profiles
  for select using (published or id = auth.uid() or public.is_admin() or public.applied_to_me(id));
create policy "profiles: create own" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles: update own or admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "profiles: delete own or admin" on public.profiles
  for delete using (id = auth.uid() or public.is_admin());

create policy "contacts: read if allowed" on public.profile_contacts
  for select using (
    user_id = auth.uid() or public.is_admin() or public.applied_to_me(user_id) or public.contact_is_public(user_id)
  );
create policy "contacts: write own" on public.profile_contacts
  for insert with check (user_id = auth.uid());
create policy "contacts: update own" on public.profile_contacts
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "contacts: delete own or admin" on public.profile_contacts
  for delete using (user_id = auth.uid() or public.is_admin());

create policy "companies: read approved, own, admin" on public.companies
  for select using (status = 'approved' or owner_id = auth.uid() or public.is_admin());
create policy "companies: request own" on public.companies
  for insert with check (owner_id = auth.uid());
create policy "companies: update own or admin" on public.companies
  for update using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
create policy "companies: delete own or admin" on public.companies
  for delete using (owner_id = auth.uid() or public.is_admin());

create policy "company contacts: owner and admin" on public.company_contacts
  for select using (public.owns_company(company_id) or public.is_admin());
create policy "company contacts: owner writes" on public.company_contacts
  for insert with check (public.owns_company(company_id));
create policy "company contacts: owner updates" on public.company_contacts
  for update using (public.owns_company(company_id)) with check (public.owns_company(company_id));

create policy "jobs: read from approved companies" on public.jobs
  for select using (public.company_approved(company_id) or public.owns_company(company_id) or public.is_admin());
create policy "jobs: approved companies post" on public.jobs
  for insert with check (public.owns_company(company_id) and public.company_approved(company_id));
create policy "jobs: approved companies edit" on public.jobs
  for update using (public.owns_company(company_id) and public.company_approved(company_id))
  with check (public.owns_company(company_id) and public.company_approved(company_id));
create policy "jobs: owner or admin deletes" on public.jobs
  for delete using (public.owns_company(company_id) or public.is_admin());

create policy "applications: applicant, company, admin read" on public.applications
  for select using (applicant_id = auth.uid() or public.owns_job(job_id) or public.is_admin());
create policy "applications: apply to open jobs" on public.applications
  for insert with check (applicant_id = auth.uid() and status = 'applied' and public.job_accepting(job_id));
create policy "applications: company sets status" on public.applications
  for update using (public.owns_job(job_id)) with check (public.owns_job(job_id));
create policy "applications: applicant withdraws" on public.applications
  for delete using (applicant_id = auth.uid() or public.is_admin());

create policy "invitations: invitee, company, admin read" on public.invitations
  for select using (profile_id = auth.uid() or public.owns_job(job_id) or public.is_admin());
create policy "invitations: company invites to open jobs" on public.invitations
  for insert with check (public.owns_job(job_id) and public.job_accepting(job_id));
create policy "invitations: either side removes" on public.invitations
  for delete using (profile_id = auth.uid() or public.owns_job(job_id));

create policy "saved jobs: own" on public.saved_jobs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- API access (rows are still filtered by the policies above)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.profile_contacts, public.companies, public.jobs to anon;
grant select, insert, update, delete on
  public.profiles, public.profile_contacts, public.companies, public.company_contacts,
  public.jobs, public.applications, public.invitations, public.saved_jobs
  to authenticated;
grant select on public.admins to authenticated;
grant execute on function
  public.is_admin(), public.owns_company(uuid), public.company_approved(uuid), public.owns_job(uuid),
  public.job_accepting(uuid), public.applied_to_me(uuid), public.contact_is_public(uuid)
  to anon, authenticated;
