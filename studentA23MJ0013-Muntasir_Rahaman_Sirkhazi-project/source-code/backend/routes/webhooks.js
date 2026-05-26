const express = require("express");
const { requireWebhookSecret } = require("../middleware/auth");

const router = express.Router();

// Phase 2 placeholder: UiPath posts back when a report has been processed.
// Auth: x-webhook-secret header must match UIPATH_WEBHOOK_SECRET.
router.post("/uipath/report-processed", requireWebhookSecret, (req, res) => {
  const { report_id } = req.body || {};
  if (!report_id) return res.status(400).json({ error: "report_id is required" });

  // Phase 2: update the report row (extracted_text, processing_status, processed_at).
  res.json({
    ok: true,
    received: { report_id },
    note: "Stub. Phase 2 will persist the processed payload to Supabase.",
  });
});

module.exports = router;
