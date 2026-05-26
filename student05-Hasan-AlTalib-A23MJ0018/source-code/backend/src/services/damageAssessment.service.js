// damageAssessment.service.js
// Intentionally hardwired to Anthropic — vision requires Claude.
// Do NOT change this to use callAI() or the DeepSeek toggle.

import Anthropic from "@anthropic-ai/sdk";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const client = ANTHROPIC_KEY ? new Anthropic({ apiKey: ANTHROPIC_KEY }) : null;

// ── Photo analysis prompt (Claude Vision only) ────────────────────────────────
const PHOTO_PROMPT = `You are a DHL damage assessment specialist. Analyze this logistics parcel damage photo.

Return ONLY valid JSON with this exact structure (no markdown fences, no extra text):
{
  "damageType": "one of: crushed|torn|wet|missing_contents|surface_scratch|dented|broken|other",
  "severityScore": <number 1.0-5.0>,
  "affectedAreas": ["list of affected areas, e.g. corner, side, top"],
  "packagingCondition": "one of: intact|compromised|destroyed",
  "confidence": <number 0.0-1.0>
}

SEVERITY SCORING GUIDE — use the full range. Do NOT default to the middle.

  5.0  Destroyed: cardboard shredded or split open, inner contents exposed
       or spilling out, packaging unrecoverable. The parcel is not fit for
       continued delivery without re-packaging by the hub.

  4.0  Severe: major structural damage — large tears, holes, or wide gaps;
       inner packaging (mylar, bubble wrap, foam) visibly exposed; outer
       carton no longer protects contents. Item inside is likely damaged.

  3.0  Moderate: visible damage to the outer packaging — noticeable tears,
       deep dents, or compromised seams — but contents are not exposed
       and probably intact. Customer will complain; investigation needed.

  2.0  Minor: surface tears, small scratches, light dents. Packaging is
       still functional. Cosmetic complaint, low operational impact.

  1.0  Cosmetic: minor scuffs, slight wear from handling. No structural
       concern. Likely no customer-visible issue.

DECISION RULES:
- When in doubt between two scores, choose the HIGHER one. Underestimating
  severity causes SLA breaches and customer escalation.
- If you see exposed inner packaging (foil, foam, bubble wrap) through the
  outer carton, severity is at least 4.0.
- If you see contents (the actual product) through the damage, severity is 5.0.
- A parcel that looks intact from one angle but has major damage on another
  side should be scored based on the worst visible damage.

Be objective but err toward protecting the customer. Set packagingCondition
to "destroyed" for any score ≥ 4, "compromised" for 3.x, "intact" for ≤ 2.`;

// ── Text severity extraction (deterministic — no AI needed) ───────────────────
const SEVERITY_KEYWORDS = [
  { score: 5, words: ["destroyed", "completely damaged", "totally destroyed", "crushed completely", "beyond repair"] },
  { score: 4, words: ["heavily damaged", "broken", "smashed", "shattered", "severely damaged", "crushed", "collapsed"] },
  { score: 3, words: ["damaged", "dented", "bent", "torn", "wet", "soaked", "compromised"] },
  { score: 2, words: ["scratched", "minor damage", "slight damage", "slightly", "small dent", "small tear"] },
  { score: 1, words: ["small scratch", "minimal", "barely", "minor scratch", "almost intact", "cosmetic"] },
];

export function extractTextSeverity(text) {
  if (!text || typeof text !== "string") {
    return { claimedSeverity: 3, keywords: [] };
  }

  const lower = text.toLowerCase();
  const foundKeywords = [];
  let highestScore = 0;

  for (const { score, words } of SEVERITY_KEYWORDS) {
    for (const word of words) {
      if (lower.includes(word)) {
        foundKeywords.push(word);
        if (score > highestScore) {
          highestScore = score;
        }
      }
    }
  }

  return {
    claimedSeverity: highestScore || 3, // default to 3 if no keywords found
    keywords: [...new Set(foundKeywords)].slice(0, 8),
  };
}

// ── Consistency check (deterministic formula) ────────────────────────────────
function buildConsistencyCheck(photoSeverity, textSeverity) {
  const diff = Math.abs(photoSeverity - textSeverity);
  // score = 5 − diff, clamped [1, 5]
  const score = Math.min(5, Math.max(1, Math.round((5 - diff) * 10) / 10));
  const discrepancyDetected = diff >= 1.5;

  let discrepancyReason = "";
  let recommendation = "Photo and text descriptions are broadly consistent.";

  if (discrepancyDetected) {
    const direction = photoSeverity > textSeverity ? "understates" : "overstates";
    discrepancyReason = `Photo shows severity ${photoSeverity.toFixed(1)} but text implies severity ${textSeverity.toFixed(1)} — text ${direction} actual damage.`;
    recommendation =
      diff >= 2.5
        ? "Escalate for manual review — significant mismatch between photo evidence and text description."
        : "Flag for reviewer attention — moderate discrepancy detected between photo and text.";
  }

  return {
    score,
    discrepancyDetected,
    discrepancyReason,
    recommendation,
  };
}

// ── JSON parser / sanitiser ───────────────────────────────────────────────────
function parseJson(text) {
  const cleaned = String(text || "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return JSON.parse(cleaned);
}

function sanitizePhotoAnalysis(raw) {
  const severityScore = Math.max(1.0, Math.min(5.0, Number(raw?.severityScore || 3)));
  const confidence    = Math.max(0.0, Math.min(1.0, Number(raw?.confidence || 0.7)));
  const affectedAreas = Array.isArray(raw?.affectedAreas) ? raw.affectedAreas.map(String) : [];

  return {
    damageType:          raw?.damageType || "other",
    severityScore:       Math.round(severityScore * 10) / 10,
    affectedAreas,
    packagingCondition:  raw?.packagingCondition || "compromised",
    confidence:          Math.round(confidence * 100) / 100,
  };
}

// ── Claude Vision call ────────────────────────────────────────────────────────
async function callClaudeVision({ buffer, mimetype, description }) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `${PHOTO_PROMPT}\n\nIncident description for context:\n${description || "(none provided)"}`,
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimetype,
              data: buffer.toString("base64"),
            },
          },
        ],
      },
    ],
  });

  return sanitizePhotoAnalysis(parseJson(response.content?.[0]?.text || "{}"));
}

// ── Main exported function ────────────────────────────────────────────────────
/**
 * assessDamagePhoto({ buffer, mimetype, description })
 *
 * Returns structured damage assessment with three sections:
 *   - photoAnalysis  (from Claude Vision)
 *   - textAnalysis   (deterministic keyword extraction)
 *   - consistencyCheck (deterministic formula)
 *
 * Returns null if no photo provided or if Claude times out.
 * Never throws — always fails soft.
 */
export async function assessDamagePhoto({ buffer, mimetype, description }) {
  if (!buffer || !mimetype) {
    return null;
  }

  if (!client) {
    throw new Error("Vision analysis requires an ANTHROPIC_API_KEY — set it in your environment variables.");
  }

  try {
    // Run photo analysis with a 10-second timeout
    const photoAnalysis = await Promise.race([
      callClaudeVision({ buffer, mimetype, description }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Damage assessment timeout")), 30000),
      ),
    ]);

    // Text analysis is deterministic — always runs, never fails
    const textAnalysis = extractTextSeverity(description);

    // Consistency check — deterministic formula
    const consistencyCheck = buildConsistencyCheck(
      photoAnalysis.severityScore,
      textAnalysis.claimedSeverity,
    );

    return {
      photoAnalysis,
      textAnalysis,
      consistencyCheck,
      assessedAt: new Date(),
    };
  } catch (error) {
    console.error("[damageAssessment]", error.message);
    return null;
  }
}
