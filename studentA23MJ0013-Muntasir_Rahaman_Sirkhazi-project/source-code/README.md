# ReportFlow (DHL)

Static frontend + Express backend for entering and reviewing reports. Uses
Supabase for auth/database/storage, Gemini for AI summarisation (proxied via
the backend), and exposes stub routes for UiPath integration.

## Project layout

```
.
├── *.html                                   # Frontend pages (kept at root for URLs)
├── assets/
│   ├── css/styles.css                       # Stylesheet
│   ├── js/{app,auth-gate,i18n,config}.js    # Frontend scripts
│   └── img/                                 # Static images
├── sql/                                     # Older one-off SQL (still useful)
├── supabase/migrations/                     # Numbered SQL migrations
└── backend/                                 # Express API
    ├── server.js
    ├── config/env.js
    ├── services/supabaseAdmin.js
    ├── middleware/{auth,errorHandler}.js
    └── routes/{health,ai,admin,uipath,webhooks}.js
```

## Run locally

### 1. Backend (Node.js + Express)

```bash
cd backend
cp .env.example .env          # then fill in real values (see below)
npm install
npm run dev                    # http://localhost:3000
```

Sanity check:

```bash
curl http://localhost:3000/health
# -> {"ok":true,"service":"reportflow-backend","time":"..."}
```

### 2. Frontend (static)

Serve the repo root over HTTP (Google OAuth requires it):

```bash
python -m http.server 5500
```

Open `http://localhost:5500/index.html`. Browser-side configuration lives in
`assets/js/config.js`; for local-only overrides (such as your Drive Picker
API key), copy `assets/js/config.local.example.js` to
`assets/js/config.local.js` and add a
`<script src="assets/js/config.local.js"></script>` after
`assets/js/config.js` in the HTML pages that need it.

## Environment variables (backend/.env)

| Var                          | Purpose                                                  |
|------------------------------|----------------------------------------------------------|
| `NODE_ENV`                   | `development` (default) or `production`                  |
| `PORT`                       | Port for the Express server (default `3000`)             |
| `FRONTEND_ORIGIN`            | Comma-separated list of allowed CORS origins             |
| `SUPABASE_URL`               | Your Supabase project URL                                |
| `SUPABASE_ANON_KEY`          | Anon JWT, used to verify user JWTs on the backend        |
| `SUPABASE_SERVICE_ROLE_KEY`  | **Backend-only**. Bypasses RLS. Never expose in frontend |
| `GEMINI_API_KEY`             | Used by `POST /ai/generate`                              |
| `UIPATH_WEBHOOK_SECRET`      | Required `x-webhook-secret` for `/webhooks/uipath/*`     |

## Database setup

Run the migrations in your Supabase SQL editor in this order (idempotent):

1. `supabase/migrations/001_profiles_admin_security.sql` — profiles table + `is_admin` + RLS
2. `sql/add_reports_user_id_and_policies.sql` — adds `reports.user_id` + RLS
3. `sql/add_admin_processing_columns.sql` — `extracted_text`, `processing_status`, etc.
4. `sql/add_admin_response_column.sql` — `admin_response` field
5. `sql/add_reports_explanation_column.sql` — `explanation` field
6. `sql/add_tags_and_admin_role.sql` — `tags` field (idempotent)
7. `sql/setup_storage_bucket_policies.sql` — see the warning in `SECURITY_NOTES.md` (bucket is public)

To grant admin to your account, run (in the SQL editor, not the frontend):

```sql
update public.profiles set is_admin = true where email = 'you@example.com';
```

## Backend routes

| Method | Path                                  | Auth                | Purpose |
|--------|---------------------------------------|---------------------|---------|
| GET    | `/health`                             | public              | Liveness probe |
| POST   | `/ai/generate`                        | Bearer JWT          | Gemini proxy. Body: `{ prompt, modelChain? }` |
| POST   | `/ai/summarize`                       | Bearer JWT          | Stub (Phase 2) |
| POST   | `/ai/classify-incident`               | Bearer JWT          | Stub (Phase 2) |
| GET    | `/admin/reports`                      | Bearer JWT + admin  | List recent reports |
| PATCH  | `/admin/reports/:id/status`           | Bearer JWT + admin  | Update status / admin response |
| GET    | `/uipath/pending-reports`             | Bearer JWT + admin  | Reports awaiting processing |
| POST   | `/webhooks/uipath/report-processed`   | `x-webhook-secret`  | UiPath posts back when done (stub) |

## Manual security checks

```bash
# Health is public
curl -i http://localhost:3000/health

# Protected routes reject unauthenticated requests
curl -i -X POST http://localhost:3000/ai/generate -H "content-type: application/json" -d '{"prompt":"hi"}'
# -> 401

# Admin routes reject normal users (use a real user JWT — should also 403)
curl -i http://localhost:3000/admin/reports -H "authorization: Bearer <user-jwt>"
# -> 403

# Webhook rejects requests without the shared secret
curl -i -X POST http://localhost:3000/webhooks/uipath/report-processed -H "content-type: application/json" -d '{"report_id":"x"}'
# -> 401
```

## Security notes

See `SECURITY_NOTES.md` for the list of keys that must be rotated and for the
status of the storage bucket.

## Deployment

- Backend → Render or Railway. Set the env vars above in the dashboard.
- Frontend → Vercel or Netlify (static). Update `assets/js/config.js` (or
  `assets/js/config.local.js`) so `BACKEND_URL` points at the deployed
  backend, and add the deployed frontend origin to the backend's
  `FRONTEND_ORIGIN`.
