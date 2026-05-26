---
name: DHL ReportFlow deploy targets
description: Hosting plan for the DHL ReportFlow project — backend on Render/Railway, frontend on Vercel/Netlify
type: project
---

DHL ReportFlow project: deploy backend (Node.js + Express in `backend/`) to **Render or Railway**; deploy frontend (static HTML/JS/CSS at repo root) to **Vercel or Netlify**.

**Why:** User stated this preference on 2026-04-25 when planning the frontend/backend split refactor. Frontend stays static (free static hosting tier); backend needs a Node runtime and persistent env vars (Gemini key, Supabase service role key, UiPath webhook secret).

**How to apply:** When suggesting deploy steps, scripts, or `package.json` engines/start commands, target Render/Railway conventions for backend (Procfile or `start` script, PORT env, no filesystem persistence). For frontend, structure so Vercel/Netlify can deploy from repo root with `.vercelignore`/`.netlifyignore` excluding `backend/`. Don't suggest VPS/Docker setups unless asked.
