// Photo → structured incident extraction (Gemini Vision).
// On enter-report.html: pick/snap a photo, optional hint, click Extract → backend
// returns { title, what_happened, damage_type, severity, tracking_number,
// suggested_tags }. We auto-fill the title, report text, and tags fields so the
// rest of the existing submit flow works unchanged.
(function () {
  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"];

  function init() {
    const input    = document.getElementById("photo-input");
    const pickLbl  = document.getElementById("photo-pick-label");
    const preview  = document.getElementById("photo-preview");
    const wrap     = document.getElementById("photo-preview-wrap");
    const clearBtn = document.getElementById("photo-clear");
    const extract  = document.getElementById("photo-extract");
    const hintEl   = document.getElementById("photo-hint");
    const feedback = document.getElementById("photo-feedback");
    const result   = document.getElementById("photo-result");

    const titleField = document.getElementById("report-title");
    const textField  = document.getElementById("report-text");
    const tagsField  = document.getElementById("report-tags");

    if (!input || !extract || !textField) return; // not on this page

    let selectedFile = null;

    function clearPhoto() {
      selectedFile = null;
      input.value = "";
      preview.src = "";
      wrap.classList.add("hidden");
      result.classList.add("hidden");
      result.innerHTML = "";
      feedback.textContent = "";
      extract.disabled = true;
      pickLbl.textContent = "Take or choose a photo";
    }

    function onPick(file) {
      if (!file) return;
      if (!ALLOWED_MIMES.includes(file.type.toLowerCase())) {
        feedback.textContent = `Unsupported image type: ${file.type || "unknown"}.`;
        return;
      }
      if (file.size > MAX_BYTES) {
        feedback.textContent = `Image too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.`;
        return;
      }
      selectedFile = file;
      pickLbl.textContent = file.name;
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        wrap.classList.remove("hidden");
        extract.disabled = false;
        feedback.textContent = "";
      };
      reader.readAsDataURL(file);
    }

    input.addEventListener("change", (e) => onPick(e.target.files && e.target.files[0]));
    clearBtn.addEventListener("click", clearPhoto);

    function fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = String(reader.result || "");
          const comma = dataUrl.indexOf(",");
          resolve(comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl);
        };
        reader.onerror = () => reject(reader.error || new Error("Could not read file"));
        reader.readAsDataURL(file);
      });
    }

    async function callBackend(imageBase64, mimeType, hint) {
      const BACKEND_URL = (window.RF_CONFIG?.BACKEND_URL || "").replace(/\/$/, "");
      if (!BACKEND_URL) throw new Error("BACKEND_URL is not configured.");
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Please sign in to use AI features.");

      const res = await fetch(`${BACKEND_URL}/ai/extract-from-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageBase64, mimeType, hint: hint || "" }),
      });

      if (!res.ok) {
        let message = `AI vision failed (${res.status})`;
        try {
          const errBody = await res.json();
          if (errBody?.error) message = errBody.error;
        } catch (_) {}
        throw new Error(message);
      }
      const data = await res.json();
      const m = (data.text || "").match(/\{[\s\S]*\}/);
      if (!m) throw new Error("AI returned no JSON.");
      return JSON.parse(m[0]);
    }

    function renderResult(parsed) {
      const sev = Number(parsed.severity) || null;
      const row = (k, v) => v == null || v === "" ? "" : `<div class="photo-result-row"><span class="photo-result-key">${k}</span><span class="photo-result-val">${escapeHtml(String(v))}</span></div>`;
      result.innerHTML = `
        <p class="eyebrow">AI extracted</p>
        ${row("Title", parsed.title)}
        ${row("What happened", parsed.what_happened)}
        ${row("Damage type", parsed.damage_type)}
        ${row("Severity", sev ? `S${sev}` : null)}
        ${row("Tracking #", parsed.tracking_number)}
        ${row("Suggested tags", Array.isArray(parsed.suggested_tags) ? parsed.suggested_tags.join(", ") : null)}
        <p class="helper-text" style="margin-top:8px">Fields below have been filled in automatically. Review and submit.</p>
      `;
      result.classList.remove("hidden");
    }

    function escapeHtml(s) {
      return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    function applyToForm(parsed) {
      if (parsed.title && titleField && !titleField.value.trim()) {
        titleField.value = String(parsed.title).slice(0, 200);
      }
      const lines = [];
      if (parsed.what_happened) lines.push(parsed.what_happened);
      if (parsed.damage_type && parsed.damage_type !== "none") lines.push(`Damage type: ${parsed.damage_type}`);
      if (parsed.severity) lines.push(`Severity (AI suggested): S${parsed.severity}`);
      if (parsed.tracking_number) lines.push(`Tracking #: ${parsed.tracking_number}`);
      const composed = lines.join("\n\n");
      if (composed && textField) {
        textField.value = textField.value.trim()
          ? textField.value.trim() + "\n\n" + composed
          : composed;
      }
      if (Array.isArray(parsed.suggested_tags) && parsed.suggested_tags.length && tagsField) {
        const existing = new Set(tagsField.value.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean));
        for (const t of parsed.suggested_tags) {
          if (typeof t === "string" && t.trim()) existing.add(t.trim().toLowerCase());
        }
        tagsField.value = Array.from(existing).join(", ");
      }
    }

    extract.addEventListener("click", async () => {
      if (!selectedFile) {
        feedback.textContent = "Pick a photo first.";
        return;
      }
      extract.disabled = true;
      const prev = extract.textContent;
      extract.textContent = "✨ Looking at the photo…";
      feedback.textContent = "Sending photo to AI…";
      try {
        const b64 = await fileToBase64(selectedFile);
        const parsed = await callBackend(b64, selectedFile.type, (hintEl?.value || "").trim());
        renderResult(parsed);
        applyToForm(parsed);
        feedback.textContent = "Done — review the filled fields and submit.";
      } catch (err) {
        feedback.textContent = "Failed: " + (err.message || err);
      } finally {
        extract.disabled = false;
        extract.textContent = prev;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
