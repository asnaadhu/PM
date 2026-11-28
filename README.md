# Portfolio Maldives

A free jobs board and CV directory for the Maldives.

- **Anyone** can browse job ads and CVs, no account needed.
- **Anyone** can sign up for free by email, list a CV, switch on **Open to new challenges**, and apply to jobs.
- **Companies** ask for a company profile. Once the board team approves it, they can post job ads, review applicants, and invite people to apply.
- **The board team** (admins) approves companies, verifies people and companies, and removes anything that doesn't belong.

Built with React, Vite and [Supabase](https://supabase.com) (database, sign-in and photo storage). The optional writing help uses Claude through a Supabase Edge Function.

## Features

| Area | What it does |
|---|---|
| Jobs (`/`) | Search; filter by sector, atoll and job type; sort by newest, closing soon or salary (MVR per month). Saved jobs, plus **New**, **Invited** and application-status badges. |
| Job page (`/jobs/:id`) | Shareable link. Apply with your CV and a note, withdraw, or save the job. Closed jobs refuse applications. |
| Talent (`/talent`) | Listed CVs, with an **Open to work only** filter. People who are open to work are listed first. |
| CV page (`/cv/:slug`) | Shareable link and Download PDF. Contact details appear only when allowed (see below). Approved companies can **Invite to apply**. |
| My CV (`/my-cv`) | Full CV editor with photo, experience, education, skills, languages and certificates. Includes the **Open to new challenges** switch, a "List my CV" choice, a "Show my email and phone" choice, invitations, and your applications with each company's decision. |
| Hiring (`/hiring`) | Request a company profile. Once approved, post, edit, close or delete jobs, then shortlist, make an offer or decline applicants. |
| Registry (`/registry`) | Admins only: approve or decline company requests, revoke approval, verify, and remove. |

Plus light, dark and system themes; phone-friendly layouts; and "Improve with Claude" for CV summaries and job descriptions.

## Who can see what

These rules are enforced by the database itself (Postgres row-level security), not just the website. They're tested in `supabase/tests/rls_test.sql`.

- Listed CVs, approved companies and their jobs are public.
- **Contact details** (email and phone) live in a separate table. Only these people can read them:
  - the person themselves;
  - admins;
  - companies the person applied to;
  - everyone, if the person ticks "Show my email and phone".
- New companies start as **pending**. Only admins can approve them. Until then they can't post jobs, and nobody else can see them.
- Nobody can verify or approve themselves. A company can change an applicant's status, but not their note.
- Applications are visible to the applicant, the hiring company and admins. Saved jobs are private.
- People can only upload photos into their own folder.

## Set up (about 15 minutes)

### 1. Create a Supabase project
Go to supabase.com and create a free project. Note the **Project URL** and the **anon public key** (Project Settings → API).

### 2. Create the database
In the Supabase dashboard, open **SQL Editor** and run these files in order:
1. `supabase/migrations/20261128000000_portfolio_maldives.sql`: the tables and security rules
2. `supabase/migrations/20261128000100_storage.sql`: the public `photos` bucket and its upload rules

If you use the Supabase CLI instead, run `supabase link` and then `supabase db push`.

### 3. Turn on email sign-in
- **Authentication → Providers → Email:** make sure it's enabled.
- **Authentication → URL Configuration:**
  - Set **Site URL** to your site's address (for example `https://portfoliomaldives.mv`).
  - Add `http://localhost:5173/**` to **Redirect URLs** for local testing.
- Optional: in **Authentication → Email Templates → Magic Link**, add `{{ .Token }}` so the email also shows a 6-digit code. The sign-in page accepts either the link or the code.
- Supabase's built-in email sender is only for testing and sends just a few emails an hour. Before launch, set up your own email sending (SMTP, for example Resend or Postmark) under **Authentication → Emails → SMTP Settings**.

### 4. Make yourself an admin
Sign in to the site once with your email. Then run this in the SQL Editor, using your own email address:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'you@example.com';
```

Reload the site. The **Registry** tab appears. If you save your own company in **Hiring**, it's approved straight away.

### 5. Run the site locally
Requires Node.js 20 or newer.

```bash
npm install
```

```bash
cp .env.example .env.local
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then start the site:

```bash
npm run dev
```

Open http://localhost:5173.

### 6. Writing help with Claude (optional)
Get an API key from platform.claude.com, then deploy the function with the Supabase CLI:

```bash
supabase secrets set ANTHROPIC_API_KEY=your-key
```

```bash
supabase functions deploy improve-text
```

Only signed-in people can use it. The key never reaches the browser. It uses Claude Opus 5.5 at low effort; set the `CLAUDE_MODEL` secret to use a different model. Without the function, the site works normally and the "Improve with Claude" buttons show "Writing help isn't available right now".

### 7. Put it online
The site is static files, so any static host works:

- **Netlify** or **Cloudflare Pages:** build command `npm run build`, output folder `dist`. `public/_redirects` already sends every page to the app.
- **Vercel:** import the repo. `vercel.json` already handles page links.

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host's environment settings, then add the live address to Supabase's Site URL and Redirect URLs (step 3).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Type-check and build to `dist` |
| `npm run preview` | Serve the built site |
| `npm run typecheck` | Type-check only |
| `scripts/test-db.sh` | Run the database security tests against a throwaway Postgres (set `PGHOST`, `PGPORT`, `PGUSER`) |

## Project structure

```
src/pages/            One file per page (Jobs, Job, Talent, CV, My CV, Hiring, Registry, Sign in)
src/components/       Header, cards and shared UI
src/lib/              Supabase client, data functions, sign-in state, PDF, image upload, constants
src/styles.css        Design tokens (light and dark) and all styles
supabase/migrations/  Database tables, security rules and storage bucket
supabase/functions/   improve-text: Claude writing help
supabase/tests/       Database security tests
```

## Notes and limits

- The Jobs and Talent pages load up to 500 jobs and 1,000 CVs and filter them in the browser. That's fine for launch; move the filters into the database queries when the board grows past that.
- The PDF uses a standard font, so Dhivehi (Thaana) text doesn't appear in downloaded CVs.
- "New" badges compare against your last visit on the same device.
- Supabase's free plan pauses projects after a week without activity. Upgrade before launch so the site stays up.
