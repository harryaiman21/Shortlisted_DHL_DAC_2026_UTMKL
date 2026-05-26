// Public, browser-safe configuration for ReportFlow.
//
// Only values that are SAFE to ship to the browser belong here:
//   - Supabase URL + anon key (anon key is a public JWT; data is protected by RLS)
//   - Google OAuth Client ID (public by design)
//   - Backend URL
//
// NEVER put secret values here (Gemini key, Supabase service role key,
// UiPath webhook secret). Those live in backend/.env on the server.
//
// To override values locally without committing them, copy
// config.local.example.js to config.local.js (gitignored) and add it to your
// HTML pages after this file.

window.RF_CONFIG = Object.assign(window.RF_CONFIG || {}, {
  SUPABASE_URL: "https://tlczogmizfbjtrbnsrxc.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsY3pvZ21pemZianRyYm5zcnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTkxMjcsImV4cCI6MjA5MTQ3NTEyN30.I8jHAqpycMzgLCb2ekd2NNcin5l8SZIJ7lgZHaGqEA0",
  SUPABASE_REPORTS_BUCKET: "reports",

  // Google OAuth client ID (public by design). Used for Drive Picker / Gmail token client.
  GOOGLE_CLIENT_ID: "465934195499-fh2ag22pg46cgdghgc1rd5ls9p55l7fs.apps.googleusercontent.com",

  // Google Identity Services client ID for "Sign in with Google" on the login page.
  // Must be added to Supabase Auth → Providers → Google → Authorized Client IDs.
  GOOGLE_LOGIN_CLIENT_ID: "465934195499-q39n2rp1ic2j9csd2rub6sjr7k1nv1it.apps.googleusercontent.com",

  // Optional Project Number (Drive Picker app id). Public if set.
  GOOGLE_APP_ID: "",

  // Drive Picker API key. Browser-restricted in Google Cloud Console.
  // Leave empty here; set in config.local.js so a leaked repo can't reuse it.
  GOOGLE_API_KEY: "",

  // Where the Express backend lives. Override per environment.
  BACKEND_URL: "http://localhost:3000",
});
