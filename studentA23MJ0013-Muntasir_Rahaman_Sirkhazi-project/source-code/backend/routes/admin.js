const express = require("express");
const env = require("../config/env");
const { requireUser, requireAdmin } = require("../middleware/auth");
const { serviceClient } = require("../services/supabaseAdmin");

const router = express.Router();

const EMBED_MODEL = "gemini-embedding-001";
const BACKFILL_BATCH_LIMIT = 50;
const BACKFILL_MAX_TEXT = 8000;

async function generateEmbeddingForBackfill(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${env.GEMINI_API_KEY}`;
  const body = { model: `models/${EMBED_MODEL}`, content: { parts: [{ text }] } };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Gemini ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
  const data = await response.json();
  const values = data?.embedding?.values;
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error("Embedding response malformed");
  }
  return values;
}

function reportTextForEmbedding(report) {
  const parts = [
    report.title,
    report.description,
    report.explanation,
    report.extracted_text,
    report.content,
  ].filter(Boolean).join("\n\n");
  return parts.slice(0, BACKFILL_MAX_TEXT);
}

const ALLOWED_STATUSES = new Set([
  "pending",
  "extracted",
  "processed",
  "under_review",
  "resolved",
]);

router.get("/reports", requireUser, requireAdmin, async (_req, res, next) => {
  try {
    const { data, error } = await serviceClient
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    res.json({ reports: data || [] });
  } catch (err) {
    next(err);
  }
});

router.patch("/reports/:id/status", requireUser, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, admin_response } = req.body || {};
    if (!ALLOWED_STATUSES.has(status)) {
      return res.status(400).json({ error: `status must be one of: ${[...ALLOWED_STATUSES].join(", ")}` });
    }

    const update = { processing_status: status };
    if (typeof admin_response === "string") update.admin_response = admin_response;
    if (status === "processed" || status === "resolved") {
      update.processed_at = new Date().toISOString();
    }

    const { data, error } = await serviceClient
      .from("reports")
      .update(update)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Report not found" });

    res.json({ report: data });
  } catch (err) {
    next(err);
  }
});

router.post("/backfill-embeddings", requireUser, requireAdmin, async (_req, res, next) => {
  try {
    if (!env.GEMINI_API_KEY) {
      return res.status(503).json({ error: "GEMINI_API_KEY not configured" });
    }

    const { data: pending, error: fetchErr } = await serviceClient
      .from("reports")
      .select("id, title, description, explanation, extracted_text, content")
      .is("embedding", null)
      .order("created_at", { ascending: false })
      .limit(BACKFILL_BATCH_LIMIT);
    if (fetchErr) throw fetchErr;

    const reports = pending || [];
    let processed = 0;
    let skipped = 0;
    const failures = [];

    for (const report of reports) {
      const text = reportTextForEmbedding(report);
      if (!text || text.trim().length < 10) {
        skipped += 1;
        continue;
      }
      try {
        const embedding = await generateEmbeddingForBackfill(text);
        const { error: updateErr } = await serviceClient
          .from("reports")
          .update({ embedding, embedding_model: EMBED_MODEL })
          .eq("id", report.id);
        if (updateErr) throw updateErr;
        processed += 1;
      } catch (err) {
        const message = err?.message || String(err);
        console.error(`[backfill] report ${report.id} failed:`, message);
        failures.push({ id: report.id, error: message });
      }
    }

    const { count: remainingCount } = await serviceClient
      .from("reports")
      .select("id", { count: "exact", head: true })
      .is("embedding", null);

    res.json({
      processed,
      skipped,
      failed: failures.length,
      failures: failures.slice(0, 5),
      remaining: remainingCount ?? 0,
      batch_size: BACKFILL_BATCH_LIMIT,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
