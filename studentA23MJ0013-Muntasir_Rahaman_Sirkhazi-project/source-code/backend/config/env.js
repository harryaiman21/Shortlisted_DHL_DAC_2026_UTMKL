// Centralized environment loading.
// Required vars throw at startup so we never run with a half-configured backend.

require("dotenv").config();

function required(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required env var: ${name}. See backend/.env.example.`);
  }
  return value.trim();
}

function optional(name, fallback = "") {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

const env = {
  NODE_ENV: optional("NODE_ENV", "development"),
  PORT: Number(optional("PORT", "3000")),
  FRONTEND_ORIGIN: optional("FRONTEND_ORIGIN", "http://localhost:5500"),

  SUPABASE_URL: required("SUPABASE_URL"),
  SUPABASE_ANON_KEY: required("SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: required("SUPABASE_SERVICE_ROLE_KEY"),

  GEMINI_API_KEY: optional("GEMINI_API_KEY"),
  UIPATH_WEBHOOK_SECRET: optional("UIPATH_WEBHOOK_SECRET"),
};

module.exports = env;
