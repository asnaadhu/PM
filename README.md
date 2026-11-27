# Portfolio Maldives

A professional portfolio and public CV publishing platform for Maldivian talent and specialists.
Professionals build a CV in a guided editor, publish it at a shareable URL, and get discovered in a
searchable directory. Administrators verify, feature and moderate profiles from a dashboard.

## Features

- **CV editor**: identity, bio, experience, projects, skills, languages, certifications, awards,
  education, and eight visual themes. Import or export a profile as JSON.
- **Public portfolio pages** at `/p/<slug>` and a print-ready resume at `/print/<slug>`.
- **Directory** of published specialists, filterable by employment sector and atoll.
- **AI assistant** (Google Gemini) to polish bios, rewrite achievement bullets and suggest skills,
  with built-in fallbacks when no API key is configured.
- **Admin dashboard** (password protected) for verification, featuring, moderation, roles,
  contact inquiries and the atoll and island registry.

## Tech stack

React 19, React Router 7, Tailwind CSS 4, Motion and Vite on the frontend. An Express server
(`server.ts`) serves the API and the built app. Supabase (optional) stores the shared positions registry.

## Getting started

Requirements: Node.js 20 or newer.

```bash
npm install
cp .env.example .env   # then fill in what you need
npm run dev            # http://localhost:3000
```

In development the admin password defaults to `admin`. Sign in with `admin@portfoliomaldives.mv`.

### Scripts

| Command             | What it does                                       |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Start the Express + Vite dev server on port 3000   |
| `npm run build`     | Build the frontend and bundle the server to `dist` |
| `npm start`         | Run the production build                           |
| `npm run typecheck` | Type-check the project                             |

## Configuration

All settings are environment variables; see [`.env.example`](.env.example).

| Variable                                     | Required             | Purpose                                                  |
| -------------------------------------------- | -------------------- | -------------------------------------------------------- |
| `ADMIN_PASSWORD`                             | Yes, in production   | Admin dashboard password. Admin API is disabled without it in production. |
| `ADMIN_TOKEN_SECRET`                         | Recommended          | Signs admin session tokens so sessions survive restarts. |
| `GEMINI_API_KEY`                             | No                   | Enables the AI assistant.                                |
| `DATA_DIR`                                   | No                   | Where `store.json` is written (default `./data`).        |
| `PORT`                                       | No                   | HTTP port (default `3000`).                              |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | No                  | Shared positions registry (`supabase/migrations`). Without it the position picker is empty. |

## Data and persistence

Published portfolios and contact inquiries are kept in memory and written to `DATA_DIR/store.json`
after every change, so they survive restarts. Put `DATA_DIR` on a persistent volume when deploying.
Each browser also keeps a local copy of profiles, so the editor keeps working offline.

## Security notes

- All `/api/admin/*` routes require a signed token from `POST /api/admin/login`.
- Publishing cannot set moderation fields (`verified`, `isFeatured`, `status`, `role`).
- AI, publish, inquiry and login endpoints are rate-limited per IP.
- Specialist sign-in is still a demo flow with no passwords. Add real user accounts (for example
  Supabase Auth) before relying on it to protect who can edit which profile.

## Project structure

```
server.ts               Express app: API routes and static or Vite serving
server/                 Store, admin auth, rate limiting and input sanitising
src/App.tsx             Routes and app state
src/components/         Views (editor, portfolio, directory, admin) and modals
src/services/api.ts     Client API with local-storage fallback
src/data/               Seed profiles, atolls and sectors
supabase/migrations/    Positions registry schema
```
