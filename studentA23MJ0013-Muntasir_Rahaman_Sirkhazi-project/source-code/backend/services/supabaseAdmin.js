const { createClient } = require("@supabase/supabase-js");
const env = require("../config/env");

// Anon client: use only to verify user JWTs via auth.getUser(token).
// Never use anon client for admin/service-role operations.
const anonClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Service-role client: bypasses RLS. Backend-only. NEVER expose to frontend.
const serviceClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

module.exports = { anonClient, serviceClient };
