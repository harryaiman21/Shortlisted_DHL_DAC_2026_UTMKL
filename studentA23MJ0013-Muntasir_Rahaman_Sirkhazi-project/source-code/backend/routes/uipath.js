const express = require("express");
const { requireUser, requireAdmin, requireWebhookSecret } = require("../middleware/auth");
const { serviceClient } = require("../services/supabaseAdmin");

const router = express.Router();

// Admin-only: list reports waiting for the UiPath robot to process.
router.get("/pending-reports", requireUser, requireAdmin, async (_req, res, next) => {
  try {
    const { data, error } = await serviceClient
      .from("reports")
      .select("id, title, processing_status, created_at")
      .eq("processing_status", "pending")
      .order("created_at", { ascending: true })
      .limit(50);
    if (error) throw error;
    res.json({ reports: data || [] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
