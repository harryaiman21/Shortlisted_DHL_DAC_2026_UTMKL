# Security notes (Phase 1)

Phase 1 cleanup removed several secrets and credentials from the frontend. **The
old values are still in git history**, so you must rotate the keys below before
relying on them in any environment that is exposed to the internet.

## Keys to rotate manually

Each of these was committed in plain text in `app.js` at some point. Rotating
means: create a new key in the source console, paste it into `backend/.env`
(server-side ones) or `config.local.js` (browser-restricted ones), and **delete
the old key entirely** from the source console.

| Key                              | Where it was leaked                  | Where it should live now                                       | How to rotate |
|----------------------------------|--------------------------------------|----------------------------------------------------------------|---------------|
| Gemini API key                   | `app.js` (`GEMINI_API_KEY` constant) | `backend/.env` → `GEMINI_API_KEY` only                         | Google AI Studio → API Keys → Delete old, create new |
| Google Drive Picker API key      | `app.js` (`GOOGLE_API_KEY` constant) | `config.local.js` → `GOOGLE_API_KEY` (browser-restricted)      | Google Cloud Console → APIs & Services → Credentials → Delete old, create new + restrict to your origins |
| Hardcoded admin login            | `app.js` (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) | Deleted; admin is now `profiles.is_admin = true` in Supabase | Anyone who saw the repo could log in as admin. Force-rotate Supabase passwords for any account that ever used those credentials, then set `is_admin` from the Supabase dashboard. |

The Supabase **anon key** is intentionally public (it is a JWT for the `anon`
role and is enforced by RLS). It does not need to be rotated, but RLS on every
table must be correct — see the migration in `supabase/migrations/`.

The Supabase **service role key** must never have been in any committed file.
If you ever pasted it into `app.js` or any HTML file, rotate it immediately:
Supabase dashboard → Settings → API → "Reset service_role key".

## Storage bucket

`sql/setup_storage_bucket_policies.sql` currently provisions the `reports` bucket
as **public** (line 5: `public = true`, line 21-25: `public can read reports`).
Anyone with a file URL can download the report contents.

Phase 1 does not change this (changing the bucket to private requires updating
every read path in the frontend to fetch signed URLs from the backend, which
belongs in Phase 2). The risk to be aware of right now: do not upload anything
sensitive to the bucket until it has been switched to private.

When you're ready to make it private:
1. In Supabase Dashboard → Storage → `reports` bucket → Settings → uncheck "Public bucket".
2. Drop the `"public can read reports"` policy.
3. Add a backend endpoint (e.g. `GET /files/:path/signed-url`) that uses the
   service-role client to issue short-lived signed URLs to authenticated users.
4. Update frontend image/file rendering to call that endpoint instead of
   constructing public URLs.

## What Phase 1 fixed

- Gemini API key removed from frontend; all AI calls now go through
  `POST /ai/generate` on the backend, which uses the server-side key.
- Hardcoded `admin@gmail.com` / `admin123` login bypass deleted.
- Admin authorisation now requires (a) a real Supabase session **and**
  (b) `profiles.is_admin = true`, re-checked on every admin page load.
- Backend admin routes (`GET /admin/reports`, `PATCH /admin/reports/:id/status`)
  require `Authorization: Bearer <jwt>` plus the `is_admin` profile flag.
- UiPath webhook (`POST /webhooks/uipath/report-processed`) requires the
  `x-webhook-secret` header to match `UIPATH_WEBHOOK_SECRET` from `.env`.
- `backend/.env` is gitignored; `backend/.env.example` documents the schema
  with placeholder values only.
