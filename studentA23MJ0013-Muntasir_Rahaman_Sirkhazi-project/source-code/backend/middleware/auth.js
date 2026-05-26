const { anonClient, serviceClient } = require("../services/supabaseAdmin");
const env = require("../config/env");

async function requireUser(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;
    if (!token) return res.status(401).json({ error: "Missing bearer token" });

    const { data, error } = await anonClient.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: "Invalid or expired token" });

    req.user = data.user;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
}

async function requireAdmin(req, res, next) {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Not authenticated" });

    const { data, error } = await serviceClient
      .from("profiles")
      .select("is_admin")
      .eq("id", req.user.id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: "Profile lookup failed" });
    if (!data?.is_admin) return res.status(403).json({ error: "Admin only" });
    next();
  } catch (err) {
    next(err);
  }
}

function requireWebhookSecret(req, res, next) {
  const expected = env.UIPATH_WEBHOOK_SECRET;
  const got = req.headers["x-webhook-secret"];
  if (!expected) return res.status(503).json({ error: "Webhook not configured" });
  if (got !== expected) return res.status(401).json({ error: "Bad webhook secret" });
  next();
}

module.exports = { requireUser, requireAdmin, requireWebhookSecret };
