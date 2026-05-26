const express = require("express");
const env = require("../config/env");
const { requireUser } = require("../middleware/auth");
const { serviceClient } = require("../services/supabaseAdmin");

const router = express.Router();

const EMBED_MODEL = "gemini-embedding-001";
const DUPLICATE_DEFAULT_THRESHOLD = 0.82;
const DUPLICATE_DEFAULT_LIMIT = 5;
const DUPLICATE_LOOKBACK_DAYS = 30;
const DUPLICATE_MAX_TEXT = 8000;

const DEFAULT_MODEL_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

// Reasonable defaults for structured extraction prompts. Thinking is disabled
// because our prompts ask Gemini to extract / output JSON, not to reason; with
// thinking on, the 2.5 models can spend the output budget on internal thoughts
// and return a candidate with no `parts[0].text` (finishReason MAX_TOKENS),
// which would otherwise look like an "empty response" failure.
const DEFAULT_GEN_CONFIG = {
  temperature: 0.2,
  maxOutputTokens: 8192,
  thinkingConfig: { thinkingBudget: 0 },
};

async function callGemini(prompt, modelChain) {
  if (!env.GEMINI_API_KEY) {
    const err = new Error("AI is not configured on the server (GEMINI_API_KEY is empty)");
    err.status = 503;
    throw err;
  }

  let lastError = null;
  for (const model of modelChain) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${env.GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: DEFAULT_GEN_CONFIG,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.map((p) => p.text || "").join("").trim() || null;

        if (text) return { text, model };

        const finishReason = candidate?.finishReason || "UNKNOWN";
        const blockReason = data.promptFeedback?.blockReason || null;
        lastError = new Error(
          `Model ${model} returned no text (finishReason=${finishReason}${blockReason ? `, blockReason=${blockReason}` : ""})`
        );
        // MAX_TOKENS / SAFETY won't get better on retry of the same prompt,
        // but trying a different model in the chain might help.
        continue;
      }

      const errText = await response.text();
      lastError = new Error(`Gemini ${response.status} (${model}): ${errText.slice(0, 400)}`);
      // 401/403 (bad key, API not enabled, billing) won't recover by retrying.
      const retryable = [429, 500, 502, 503].includes(response.status);
      if (!retryable) break;
    } catch (err) {
      lastError = err;
    }
  }

  const err = lastError || new Error("Gemini: all models failed");
  err.status = 502;
  // Surface the actual upstream reason — it's just Gemini's own error string,
  // not a secret, and without it failures are impossible to diagnose.
  err.publicMessage = `AI request failed: ${err.message}`;
  throw err;
}

router.post("/generate", requireUser, async (req, res, next) => {
  try {
    const { prompt, modelChain } = req.body || {};
    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "prompt (string) is required" });
    }
    if (prompt.length > 200_000) {
      return res.status(413).json({ error: "prompt too large" });
    }
    const chain = Array.isArray(modelChain) && modelChain.length ? modelChain : DEFAULT_MODEL_CHAIN;
    const result = await callGemini(prompt, chain);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Photo → structured incident extraction (Gemini Vision).
// Body: { imageBase64 (no data: prefix), mimeType, hint? }.
// Returns JSON: { title, what_happened, damage_type, severity, tracking_number, suggested_tags }
async function callGeminiVision(prompt, imageBase64, mimeType, modelChain) {
  if (!env.GEMINI_API_KEY) {
    const err = new Error("AI is not configured on the server (GEMINI_API_KEY is empty)");
    err.status = 503;
    throw err;
  }

  let lastError = null;
  for (const model of modelChain) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${env.GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: imageBase64 } },
            ],
          }],
          generationConfig: DEFAULT_GEN_CONFIG,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.map((p) => p.text || "").join("").trim() || null;
        if (text) return { text, model };
        lastError = new Error(`Model ${model} returned no text (finishReason=${candidate?.finishReason || "UNKNOWN"})`);
        continue;
      }

      const errText = await response.text();
      lastError = new Error(`Gemini Vision ${response.status} (${model}): ${errText.slice(0, 400)}`);
      const retryable = [429, 500, 502, 503].includes(response.status);
      if (!retryable) break;
    } catch (err) {
      lastError = err;
    }
  }

  const err = lastError || new Error("Gemini Vision: all models failed");
  err.status = 502;
  err.publicMessage = `AI vision request failed: ${err.message}`;
  throw err;
}

router.post("/extract-from-image", requireUser, async (req, res, next) => {
  try {
    const { imageBase64, mimeType, hint } = req.body || {};
    if (typeof imageBase64 !== "string" || !imageBase64.trim()) {
      return res.status(400).json({ error: "imageBase64 (string, no data: prefix) is required" });
    }
    if (typeof mimeType !== "string" || !/^image\/(png|jpeg|jpg|webp|heic|heif)$/i.test(mimeType)) {
      return res.status(400).json({ error: "mimeType must be image/png, image/jpeg, image/webp, image/heic, or image/heif" });
    }
    if (imageBase64.length > 7_000_000) {
      return res.status(413).json({ error: "image too large (max ~5 MB)" });
    }

    const prompt = [
      "You are an assistant that looks at a photo from a DHL logistics worker and extracts a structured incident report.",
      "Look carefully for: damaged packaging, water/crush damage, broken seals, wrong labels, visible tracking numbers (alphanumeric on shipping labels), license plates, signs of theft, etc.",
      hint ? `Worker hint: "${String(hint).slice(0, 500)}"` : "",
      "",
      "Return ONLY a JSON object with these exact keys (no markdown, no commentary):",
      "{",
      '  "title": short 8-word incident title,',
      '  "what_happened": 2-3 sentence factual description of what is visible in the photo,',
      '  "damage_type": one of ["crushed","water","torn","broken_seal","leaked","label_issue","missing_contents","other","none"],',
      '  "severity": integer 1-5 (1 minor, 5 critical),',
      '  "tracking_number": string if a tracking number is clearly visible, else null,',
      '  "suggested_tags": array of 2-5 short lowercase tags (e.g. ["damage","fragile","urgent"])',
      "}",
      "If the photo does NOT show a logistics-related incident, return all fields as null and severity 1.",
    ].filter(Boolean).join("\n");

    const result = await callGeminiVision(prompt, imageBase64, mimeType, DEFAULT_MODEL_CHAIN);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/summarize", requireUser, (_req, res) => {
  res.status(501).json({
    error: "Not implemented yet",
    note: "Phase 2: server-side structured summarization. Use POST /ai/generate for now.",
  });
});

router.post("/classify-incident", requireUser, (_req, res) => {
  res.status(501).json({
    error: "Not implemented yet",
    note: "Phase 2: incident classification (urgency, category, duplicate detection).",
  });
});

async function generateEmbedding(text) {
  if (!env.GEMINI_API_KEY) {
    const err = new Error("AI is not configured on the server (GEMINI_API_KEY is empty)");
    err.status = 503;
    throw err;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${env.GEMINI_API_KEY}`;
  const body = {
    model: `models/${EMBED_MODEL}`,
    content: { parts: [{ text }] },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    const err = new Error(`Gemini embedding ${response.status}: ${errText.slice(0, 400)}`);
    err.status = 502;
    err.publicMessage = `Embedding request failed: ${err.message}`;
    throw err;
  }

  const data = await response.json();
  const values = data?.embedding?.values;
  if (!Array.isArray(values) || values.length === 0) {
    const err = new Error(`Embedding response malformed (got ${values?.length || 0} values)`);
    err.status = 502;
    throw err;
  }
  return values;
}

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

function clampText(text) {
  if (!text) return "";
  if (text.length <= DUPLICATE_MAX_TEXT) return text;
  return text.slice(0, DUPLICATE_MAX_TEXT);
}

router.post("/embed", requireUser, async (req, res, next) => {
  try {
    const { text } = req.body || {};
    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "text (string) is required" });
    }
    const embedding = await generateEmbedding(clampText(text));
    res.json({ embedding, model: EMBED_MODEL });
  } catch (err) {
    next(err);
  }
});

router.post("/find-duplicates", requireUser, async (req, res, next) => {
  try {
    const { text, threshold, limit, excludeId } = req.body || {};
    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "text (string) is required" });
    }

    const minSim = typeof threshold === "number" ? Math.max(0, Math.min(1, threshold)) : DUPLICATE_DEFAULT_THRESHOLD;
    const topK = typeof limit === "number" ? Math.max(1, Math.min(20, Math.floor(limit))) : DUPLICATE_DEFAULT_LIMIT;

    const embedding = await generateEmbedding(clampText(text));

    const since = new Date(Date.now() - DUPLICATE_LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();
    let query = serviceClient
      .from("reports")
      .select("id, title, description, created_at, processing_status, source_type, embedding")
      .gte("created_at", since)
      .not("embedding", "is", null)
      .order("created_at", { ascending: false })
      .limit(500);

    const { data, error } = await query;
    if (error) throw error;

    const candidates = (data || []).filter((r) => excludeId ? String(r.id) !== String(excludeId) : true);

    const scored = candidates
      .map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        created_at: r.created_at,
        processing_status: r.processing_status,
        source_type: r.source_type,
        similarity: cosineSimilarity(embedding, r.embedding),
      }))
      .filter((r) => r.similarity >= minSim)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    res.json({ embedding, model: EMBED_MODEL, threshold: minSim, matches: scored });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
