// Voice-to-Report: browser speech recognition + optional Gemini cleanup.
// Loaded only on enter-report.html. Pushes transcript into #report-text so the
// rest of the existing report-submit flow (drafts, AI summary, submit) works
// unchanged.
(function () {
  function init() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    const btn      = document.getElementById("voice-record-btn");
    const label    = document.getElementById("voice-btn-label");
    const status   = document.getElementById("voice-status");
    const icon     = document.getElementById("voice-icon");
    const live     = document.getElementById("voice-live");
    const clearBtn = document.getElementById("voice-clear");
    const aiBtn    = document.getElementById("voice-clean-ai");
    const feedback = document.getElementById("voice-feedback");
    const reportText = document.getElementById("report-text");
    const reportTitle = document.getElementById("report-title");

    if (!btn || !live || !reportText) return; // not on this page

    if (!SR) {
      status.textContent = "Voice not supported in this browser. Try Chrome or Edge.";
      btn.disabled = true;
      aiBtn.disabled = true;
      return;
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = (document.documentElement.lang || "en-US");

    let listening = false;
    let finalText = "";

    function render(interim) {
      live.textContent = (finalText + (interim || "")).trim();
      // Keep the main report textarea in sync so save/submit just works.
      reportText.value = finalText.trim();
    }

    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += chunk + " ";
        } else {
          interim += chunk;
        }
      }
      render(interim);
    };

    rec.onerror = (e) => {
      feedback.textContent = "Mic error: " + (e.error || "unknown");
      stop();
    };

    rec.onend = () => {
      // Some browsers stop after a pause — auto-resume if the user is still listening.
      if (listening) {
        try { rec.start(); } catch (_) { /* race: ignore */ }
      }
    };

    function start() {
      finalText = reportText.value ? reportText.value.trim() + " " : "";
      try {
        rec.start();
      } catch (e) {
        feedback.textContent = "Could not start mic: " + e.message;
        return;
      }
      listening = true;
      btn.classList.add("recording");
      icon.textContent = "🔴";
      label.textContent = "Stop recording";
      status.textContent = "Listening… speak clearly";
      feedback.textContent = "";
    }

    function stop() {
      listening = false;
      try { rec.stop(); } catch (_) { /* ignore */ }
      btn.classList.remove("recording");
      icon.textContent = "🎤";
      label.textContent = "Start recording";
      status.textContent = "Mic off — click to start";
    }

    btn.addEventListener("click", () => {
      if (listening) stop(); else start();
    });

    clearBtn.addEventListener("click", () => {
      finalText = "";
      live.textContent = "";
      reportText.value = "";
      feedback.textContent = "Transcript cleared.";
    });

    aiBtn.addEventListener("click", async () => {
      const raw = (finalText || reportText.value || "").trim();
      if (raw.length < 10) {
        feedback.textContent = "Record at least one sentence first.";
        return;
      }
      if (typeof window.callBackendAi !== "function") {
        feedback.textContent = "AI cleanup is unavailable (backend not configured).";
        return;
      }

      aiBtn.disabled = true;
      const prevLabel = aiBtn.textContent;
      aiBtn.textContent = "✨ Cleaning…";
      feedback.textContent = "Sending transcript to AI…";

      const prompt = [
        "You are an assistant that converts a raw spoken transcript from a DHL logistics worker",
        "into a clean, structured incident report. Keep the worker's facts, do not invent details.",
        "",
        "Return plain text with these sections (omit a section only if there is truly no info):",
        "Title: <one short line, 8 words max>",
        "What happened: <2–4 sentences>",
        "When: <date/time mentioned, or 'not stated'>",
        "Where: <location mentioned, or 'not stated'>",
        "People / parties involved: <names or roles, or 'not stated'>",
        "Severity: <Low | Medium | High> — with a one-line reason",
        "Suggested next steps: <bulleted list, 2–4 items>",
        "",
        "Transcript:",
        raw
      ].join("\n");

      try {
        const text = await window.callBackendAi(prompt);
        const cleaned = (text || "").trim();
        if (!cleaned) throw new Error("AI returned an empty response.");

        // Pull the Title line out and put it in the title input if empty.
        const titleMatch = cleaned.match(/^\s*Title:\s*(.+)$/im);
        if (titleMatch && reportTitle && !reportTitle.value.trim()) {
          reportTitle.value = titleMatch[1].trim();
        }

        reportText.value = cleaned;
        live.textContent = cleaned;
        finalText = cleaned + " ";
        feedback.textContent = "AI cleanup done — review and submit.";
      } catch (err) {
        feedback.textContent = "AI cleanup failed: " + (err.message || err);
      } finally {
        aiBtn.disabled = false;
        aiBtn.textContent = prevLabel;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
