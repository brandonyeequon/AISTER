# AI-STER Production Plan

## Current State
- Frontend complete, 0 TypeScript errors, clean build
- Supabase auth (after login bug fix)
- All evaluation data in localStorage — nothing persists server-side
- Admin/Analytics dashboards show hardcoded data
- Role-gating defined in types but never enforced
- AI key exposed in browser (`VITE_GEMINI_API_KEY`)
- Sign-up flow stubbed ("coming soon")

---

## Phase 1 — Make It Functional (MVP for Test Users)

**Goal:** Test users can sign in, complete real evaluations, data persists across devices.

### 1.1 Supabase Schema

```sql
-- profiles (1:1 with auth.users, holds role + display name)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'evaluator' check (role in ('teacher','evaluator','admin')),
  created_at timestamptz default now()
);

-- evaluations (one row per evaluation record)
create table evaluations (
  id uuid primary key default gen_random_uuid(),
  evaluator_id uuid not null references profiles(id) on delete cascade,
  status text not null check (status in ('in-progress','completed')),
  current_step text not null,
  timer_seconds int not null default 0,
  details jsonb not null default '{}',                  -- student name, teacher, date, etc.
  observation_notes text not null default '',
  category_final_notes jsonb not null default '{}',     -- {LL,IC,IP,CC,PR}
  ster_scores jsonb not null default '{}',              -- {competencyId: {score,notes}}
  lesson_plan_file_path text,
  notes_file_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  submitted_at timestamptz
);

-- Auto-create profile on signup via trigger
-- Enable RLS: user can CRUD own evaluations; admin can read all
```

**Key decisions:** store scores as `jsonb` (matches current `STERScores` shape — zero migration of the frontend type); file uploads go to Supabase Storage with a path stored here.

### 1.2 Replace localStorage with Supabase

Refactor `src/utils/evaluationRecords.ts` from localStorage to Supabase queries:

- `getEvaluationRecords()` → `supabase.from('evaluations').select().eq('evaluator_id', user.id)`
- `saveEvaluationRecord()` → `upsert` (auto-save on field change, debounced)
- Keep `EvaluationRecord` type — add a `snake_case ↔ camelCase` mapper at the boundary
- Keep `aister:active-evaluation-id:v1` in localStorage (that's a UI preference, not data)

### 1.3 Sign-Up Flow

Replace the "coming soon" tab with a real form: email + password + full name → `supabase.auth.signUp()` with `{options: {data: {full_name, role: 'evaluator'}}}`. Trigger auto-creates profile row. Tell users to check email for confirmation (or disable email confirm in Supabase for test users).

### 1.4 Role-Gating

- Add `requireRole={['admin']}` prop to `ProtectedRoute`
- Gate `/admin` and `/research` to admin role
- Hide those navbar tabs for non-admins
- Seed your account as `admin` manually in Supabase after sign-up

### 1.5 Vercel Environment

Add these in Vercel dashboard, then redeploy:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`
- `VITE_USE_MOCK_API=false`

### 1.6 Supabase URL Configuration

Dashboard → Auth → URL Configuration: set Site URL to Vercel prod URL, add Vercel preview wildcard.

### 1.7 Disable Conflicting Workflow

Delete `.github/workflows/deploy.yml` (GitHub Pages) — it will ship out-of-date builds alongside Vercel.

**Phase 1 exit criteria:** Two test users on two different browsers can each complete an evaluation, log out, log back in, and see their own (but not each other's) evaluations.

---

## Phase 2 — Harden & Wire Real Data

### 2.1 Server-Side AI (Security)

Move `analyzeNotesWithGemini` logic from `src/utils/aiAnalyzer.ts` into the existing `supabase/functions/ai-analysis/index.ts`:

- Set `GEMINI_API_KEY` as a Supabase Function secret (not a `VITE_` var)
- Frontend calls `supabase.functions.invoke('ai-analysis', { body: {observationNotes} })`
- Remove `VITE_GEMINI_API_KEY` from `.env.example` and Vercel
- Deploy with `supabase functions deploy ai-analysis`

### 2.2 File Uploads

Currently only filenames are stored. Upload to Supabase Storage:

- Create `evaluation-files` bucket (private)
- Upload on file select, store `{path}` in `lesson_plan_file_path` / `notes_file_path`
- Generate signed URLs for download

### 2.3 Wire Admin Dashboard

Replace hardcoded cards in `AdminDashboard.tsx`:

- Total Teachers → `select count() from profiles where role='teacher'`
- Total Evaluations → `select count() from evaluations`
- Pending Reviews → `select count() from evaluations where status='in-progress'`
- Recent logs → pull last N rows from evaluations ordered by `updated_at`

### 2.4 Apply RLS Migration

Run `supabase/supabase/migrations/20260410130107_rls_alignment_patch.sql` against your Supabase project (via SQL editor or `supabase db push`).

---

## Phase 3 — Polish

### 3.1 Wire Research Analytics

Replace Recharts mock data with real aggregate queries. Respect the date-range filter.

### 3.2 Persist Settings

Add `user_preferences` table (or a `preferences jsonb` column on profiles). Save notifications / email updates / default duration.

### 3.3 User Management for Admins

`AdminDashboard` currently has no way to promote/demote users. Add a users table with role dropdown.

### 3.4 Reset Password

`supabase.auth.resetPasswordForEmail()` flow + reset page.

### 3.5 Code Cleanup

- Delete `src/utils/mockApi.ts` (dead code, never imported)
- Fix the unreachable `/` duplicate route in `App.tsx`
- Split the 923kB bundle (Vite warning) with route-level `React.lazy`

---

## Recommended Order

Do **1.1 → 1.2 → 1.3 → 1.4** as one sprint, then **1.5 → 1.6 → 1.7** as the deploy cutover, then test. Phase 2 and 3 can wait until real users have given feedback.
