# Deployment Setup

## 1. Apply the Supabase schema

In the Supabase SQL editor, run these three migrations in order:

```
supabase/supabase/migrations/20260414000000_phase1_schema.sql
supabase/supabase/migrations/20260414010000_phase2_storage.sql
supabase/supabase/migrations/20260414020000_phase3_prefs_admin.sql
```

Phase 1 creates `profiles` and `evaluations`, enables RLS, and installs the auto-profile trigger.
Phase 2 creates the private `evaluation-files` storage bucket plus its path-scoped RLS policies.
Phase 3 adds `profiles.preferences` (jsonb, used by Settings) and grants admins the ability to update any profile's role.

Ignore `20260410130107_rls_alignment_patch.sql` — it targets a normalized schema we do not use.

## 2. Seed your admin account

After signing up through the app, in the SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@uvu.edu';
```

## 3. Deploy the `ai-analysis` edge function

The Gemini API key lives server-side as a Supabase Function secret — it is never shipped to the browser.

```bash
# one-time: set the secret
supabase secrets set GEMINI_API_KEY=<your-google-ai-studio-key>

# deploy the function
supabase functions deploy ai-analysis
```

Verify from the Supabase dashboard → Edge Functions → `ai-analysis` that the function is deployed and the secret is set.

## 4. Vercel environment variables

Dashboard → Project → Settings → Environment Variables:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | from Supabase project settings |
| `VITE_SUPABASE_ANON_KEY` | from Supabase project settings |
| `VITE_USE_MOCK_API` | `false` |

`VITE_GEMINI_API_KEY` is **no longer required on the frontend** — remove it from Vercel if you set it previously.

Redeploy after saving.

## 5. Supabase URL configuration

Dashboard → Authentication → URL Configuration:

- **Site URL:** the Vercel production URL, e.g. `https://aister.vercel.app`
- **Redirect URLs:** add the production URL, the preview wildcard (`https://*.vercel.app/*`), and the reset-password destination (`https://aister.vercel.app/reset-password`). Password recovery emails send users to Site URL + this path.

## 6. (Optional) Disable email confirmation for test users

Dashboard → Authentication → Providers → Email → uncheck "Confirm email". Users can then sign up and sign in immediately without waiting for a confirmation email.

## 7. GitHub Pages workflow

The old `.github/workflows/deploy.yml` has been removed — Vercel is the single deploy target.
