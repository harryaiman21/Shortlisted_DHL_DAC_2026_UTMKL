const AI_SUMMARY_VERSION = 5;
const REPORTS_VIEW_KEY = "reportflow-view";
const ACTIVE_SOURCE_KEY = "reportflow-active-source";
const PICKER_STATE_KEY = "reportflow-picker-state";
const ADMIN_SESSION_KEY = "reportflow-admin-session";
const DRAFTS_KEY = "reportflow-drafts";
const DRAFT_HISTORY_KEY = "reportflow-draft-history";
const DRAFT_HISTORY_LIMIT = 50;
const DRAFT_FILES_DB = "reportflow-draft-files";
const DRAFT_FILES_STORE = "files";

// All public, browser-safe configuration comes from config.js (window.RF_CONFIG).
// Secrets (Gemini, Supabase service role, UiPath webhook secret) live in
// backend/.env and are accessed only via the backend.
const RF_CONFIG = (typeof window !== "undefined" && window.RF_CONFIG) || {};
const SUPABASE_URL = RF_CONFIG.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = RF_CONFIG.SUPABASE_ANON_KEY || "";
const SUPABASE_REPORTS_BUCKET = RF_CONFIG.SUPABASE_REPORTS_BUCKET || "reports";
const GOOGLE_CLIENT_ID = RF_CONFIG.GOOGLE_CLIENT_ID || "";
const GOOGLE_API_KEY = RF_CONFIG.GOOGLE_API_KEY || "";
const GOOGLE_APP_ID = RF_CONFIG.GOOGLE_APP_ID || "";
const BACKEND_URL = (RF_CONFIG.BACKEND_URL || "").replace(/\/$/, "");

const supabaseClient = window.supabase?.createClient && SUPABASE_URL && SUPABASE_ANON_KEY
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const GOOGLE_IDENTITY_SCOPES = ["openid", "email", "profile"].join(" ");
const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const GOOGLE_GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const pickerState = {
  driveAccount: null,
  driveFile: null,
  emailAccount: null,
  emailMessage: null
};
const googleTokens = {
  drive: null,
  gmail: null
};

// localStorage can't hold the bytes of an uploaded file, so when a draft has a
// file source we stash the actual File objects in IndexedDB keyed by draft id.
// On reopen we read them back and re-populate the file input via DataTransfer
// — that way "Submit Report" works without forcing the user to re-pick the
// file.
function openDraftFilesDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB is not available."));
      return;
    }
    const req = window.indexedDB.open(DRAFT_FILES_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(DRAFT_FILES_STORE)) {
        db.createObjectStore(DRAFT_FILES_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPutDraftFiles(draftId, files) {
  if (!draftId || !files || !files.length) return;
  const db = await openDraftFilesDb();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(DRAFT_FILES_STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
      tx.objectStore(DRAFT_FILES_STORE).put(Array.from(files), draftId);
    });
  } finally {
    db.close();
  }
}

async function idbGetDraftFiles(draftId) {
  if (!draftId) return [];
  let db;
  try {
    db = await openDraftFilesDb();
  } catch {
    return [];
  }
  try {
    const stored = await new Promise((resolve, reject) => {
      const tx = db.transaction(DRAFT_FILES_STORE, "readonly");
      const req = tx.objectStore(DRAFT_FILES_STORE).get(draftId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    if (!stored) return [];
    if (Array.isArray(stored)) return stored.filter((item) => item instanceof Blob);
    return stored instanceof Blob ? [stored] : [];
  } catch {
    return [];
  } finally {
    db.close();
  }
}

async function idbDeleteDraftFiles(draftId) {
  if (!draftId) return;
  let db;
  try {
    db = await openDraftFilesDb();
  } catch {
    return;
  }
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(DRAFT_FILES_STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
      tx.objectStore(DRAFT_FILES_STORE).delete(draftId);
    });
  } catch { /* best-effort */ } finally {
    db.close();
  }
}

function rfSaveDraft() {
  const editId = new URLSearchParams(window.location.search).get("draft");
  const existingDraft = editId ? getDraftById(editId) : null;
  const titleText = (document.querySelector("#report-title")?.value || "").trim() || "Untitled draft";
  const tagsRaw = (document.querySelector("#report-tags")?.value || "").trim();
  const sourceType = getActiveSourceType ? getActiveSourceType() : "manual";

  let content;
  let filesToPersist = null;
  if (sourceType === "file") {
    const fileInput = document.querySelector("#report-file");
    const files = Array.from(fileInput?.files || []);
    content = files.length > 0
      ? files.map((f) => f.name).join(", ")
      : (existingDraft?.content || "");
    if (files.length > 0) filesToPersist = files;
  } else if (sourceType === "manual") {
    content = (document.querySelector("#report-text")?.value || "").trim();
  } else {
    content = getReportBodyForSource ? getReportBodyForSource(sourceType) : "";
  }

  const explanation = getSourceExplanation ? getSourceExplanation(sourceType) : "";

  const draft = {
    id: editId || (createReportId ? createReportId() : ("draft-" + Date.now())),
    title: titleText,
    sourceType: sourceType,
    content: content,
    explanation: explanation,
    tags: tagsRaw,
    savedAt: new Date().toISOString()
  };

  try {
    const existing = JSON.parse(localStorage.getItem(DRAFTS_KEY) || "[]");
    const arr = Array.isArray(existing) ? existing : [];
    const idx = arr.findIndex(function(d) { return d.id === draft.id; });
    if (idx >= 0) { arr[idx] = draft; } else { arr.unshift(draft); }
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(arr));
  } catch (e) {
    alert("Could not save draft: " + e.message);
    return;
  }

  if (filesToPersist) {
    idbPutDraftFiles(draft.id, filesToPersist).catch(function(err) {
      console.warn("Could not persist draft file bytes:", err);
    });
  }

  const historyEntryId = (createReportId ? createReportId() : ("hist-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8)));
  try {
    const histRaw = JSON.parse(localStorage.getItem(DRAFT_HISTORY_KEY) || "[]");
    const hist = Array.isArray(histRaw) ? histRaw : [];
    hist.unshift({
      id: historyEntryId,
      draftId: draft.id,
      title: draft.title,
      sourceType: draft.sourceType,
      savedAt: draft.savedAt
    });
    if (hist.length > DRAFT_HISTORY_LIMIT) hist.length = DRAFT_HISTORY_LIMIT;
    localStorage.setItem(DRAFT_HISTORY_KEY, JSON.stringify(hist));
  } catch (e) { /* history is best-effort */ }

  if (document.querySelector("#draft-history-list")) {
    // For a brand-new report (no ?draft= yet), reflect the new id in the URL
    // so the history panel can scope itself to this draft on this and later
    // saves without forcing a reload.
    if (!editId) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("draft", draft.id);
        window.history.replaceState({}, "", url.toString());
      } catch (e) { /* best-effort */ }
    }
    renderDraftHistory(historyEntryId);
    if (typeof showToast === "function") showToast("Draft saved");
    if (typeof setFormStatus === "function") setFormStatus("Draft saved.", false);
    return;
  }

  window.location.href = "drafts.html";
}

function getCurrentDraftIdFromUrl() {
  try {
    return new URLSearchParams(window.location.search).get("draft") || null;
  } catch (e) {
    return null;
  }
}

function formatDraftHistoryTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function renderDraftHistory(highlightId) {
  const list = document.querySelector("#draft-history-list");
  const empty = document.querySelector("#draft-history-empty");
  if (!list) return;

  // Scope the panel to the report currently being edited. If there's no
  // ?draft= in the URL (brand-new report that hasn't been saved yet), nothing
  // matches and the empty state is shown — that's intentional.
  const currentDraftId = getCurrentDraftIdFromUrl();

  let history = [];
  try { history = JSON.parse(localStorage.getItem(DRAFT_HISTORY_KEY) || "[]") || []; } catch { history = []; }
  history = (Array.isArray(history) ? history : []).filter(function(h) {
    return currentDraftId && h && h.draftId === currentDraftId;
  }).sort(function(a, b) {
    return new Date(a.savedAt || 0) - new Date(b.savedAt || 0);
  });

  if (history.length === 0) {
    list.innerHTML = "";
    list.classList.add("hidden");
    if (empty) empty.classList.remove("hidden");
    return;
  }

  list.classList.remove("hidden");
  if (empty) empty.classList.add("hidden");

  list.innerHTML = history.map(function(d) {
    const title = escapeHtml(d.title || "Untitled draft");
    const time = escapeHtml(formatDraftHistoryTime(d.savedAt));
    const source = escapeHtml(getSourceLabel(d.sourceType || "manual"));
    const isNew = highlightId && d.id === highlightId ? " is-new" : "";
    return (
      '<li class="draft-history-item' + isNew + '">' +
        '<span class="draft-history-item-title">' + title + '</span>' +
        '<span class="draft-history-item-meta">' +
          '<span class="draft-history-item-time">' + time + '</span>' +
          '<span class="draft-history-item-source">' + source + '</span>' +
        '</span>' +
      '</li>'
    );
  }).join("");
}

function getAppOrigin() {
  return `${window.location.protocol}//${window.location.host}`;
}

function getAdminSession() {
  return window.localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

function setAdminSession(isAdmin) {
  if (isAdmin) {
    window.localStorage.setItem(ADMIN_SESSION_KEY, "true");
    return;
  }

  window.localStorage.removeItem(ADMIN_SESSION_KEY);
}

function setStatusMessage(selector, message, isError = false) {
  const statusNode = document.querySelector(selector);
  if (!statusNode) {
    return;
  }

  statusNode.textContent = message || "";
  statusNode.classList.toggle("error", Boolean(message) && isError);
  statusNode.classList.toggle("success", Boolean(message) && !isError);
}

async function getCurrentSession() {
  ensureSupabaseConfigured();
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    throw error;
  }

  return data.session || null;
}

// Calls the backend Gemini proxy (POST /ai/generate). The Gemini key never
// touches the browser — it lives in backend/.env. Returns the response text.
async function findSimilarReports(text, options = {}) {
  if (!BACKEND_URL) {
    console.warn("[duplicate-check] skipped: BACKEND_URL not configured");
    return null;
  }
  if (!supabaseClient) {
    console.warn("[duplicate-check] skipped: supabaseClient not configured");
    return null;
  }
  const trimmed = (text || "").trim();
  if (trimmed.length < 30) {
    console.warn(`[duplicate-check] skipped: text too short (${trimmed.length} chars, need ≥30)`);
    return null;
  }

  const { data: sessionData } = await supabaseClient.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    console.warn("[duplicate-check] skipped: no auth session");
    return null;
  }

  console.log(`[duplicate-check] checking ${trimmed.length} chars against last 30 days...`);
  try {
    const response = await fetch(`${BACKEND_URL}/ai/find-duplicates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: trimmed,
        threshold: options.threshold,
        limit: options.limit,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[duplicate-check] backend returned ${response.status}:`, body.slice(0, 300));
      return null;
    }
    const result = await response.json();
    console.log(`[duplicate-check] found ${result.matches?.length || 0} matches above threshold ${result.threshold}`);
    return result;
  } catch (err) {
    console.error("[duplicate-check] network/fetch error:", err);
    return null;
  }
}

const SAME_REPORT_THRESHOLD = 0.95;

function showDuplicateWarningModal({ matches }) {
  console.log(`[duplicate-check] opening warning modal with ${matches.length} matches`);
  return new Promise((resolve) => {
    const sameMatches = matches.filter((m) => m.similarity >= SAME_REPORT_THRESHOLD);
    const isIdentical = sameMatches.length > 0;
    const overlay = document.createElement("div");
    overlay.className = "duplicate-warning-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(15,18,28,0.55);display:flex;align-items:center;justify-content:center;z-index:99999;padding:24px;";

    const matchesHtml = matches.map((m) => {
      const pct = Math.round(m.similarity * 100);
      const isSame = m.similarity >= SAME_REPORT_THRESHOLD;
      const statusClass = (m.processing_status || "pending").replace(/\s+/g, "-");
      const matchLabel = isSame
        ? `<span class="duplicate-similarity" style="background:#dc2626;color:#fff;font-weight:800;letter-spacing:0.06em;">SAME REPORT</span>`
        : `<span class="duplicate-similarity">${pct}% match</span>`;
      const itemBorder = isSame ? "border:2px solid #dc2626;background:#fef2f2;" : "";
      return `
        <div class="duplicate-item" style="${itemBorder}">
          <div class="duplicate-item-bar" style="--match: ${pct}%${isSame ? ";background:#dc2626;" : ""}"></div>
          <div class="duplicate-item-main">
            <div class="duplicate-item-title">${escapeHtml(m.title || "Untitled")}</div>
            <div class="duplicate-item-meta">${escapeHtml((m.description || "").slice(0, 180))}</div>
            <div class="duplicate-item-foot">
              ${matchLabel}
              <span class="duplicate-date">${escapeHtml(formatDate(m.created_at))}</span>
              <span class="duplicate-status ${escapeHtml(statusClass)}">${escapeHtml(m.processing_status || "pending")}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    const eyebrowText = isIdentical ? "🔁 Same report already exists" : "Possible duplicate detected";
    const eyebrowColor = isIdentical ? "#dc2626" : "#b45309";
    const headingText = isIdentical
      ? `This is the same as ${sameMatches.length === 1 ? "an existing report" : `${sameMatches.length} existing reports`}`
      : `${matches.length} similar report${matches.length > 1 ? "s" : ""} found`;
    const subText = isIdentical
      ? "An identical (or near-identical) report already exists. Submitting again will create a duplicate. Please review the existing one instead."
      : "We found existing reports from the last 30 days that look similar to yours. Review them before submitting to avoid duplicates.";
    const submitBtnLabel = isIdentical ? "Submit anyway (duplicate)" : "Submit anyway";
    const submitBtnBg = isIdentical ? "#dc2626" : "#0f5483";

    overlay.innerHTML = `
      <div class="duplicate-warning-modal" style="max-width:640px;width:100%;max-height:90vh;overflow-y:auto;background:#fff;border-radius:18px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.25);${isIdentical ? "border-top:6px solid #dc2626;" : ""}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:8px;">
          <div>
            <p class="eyebrow" style="color:${eyebrowColor};font-weight:700;letter-spacing:0.06em;margin:0 0 4px;">${eyebrowText}</p>
            <h2 style="margin:0;font-size:1.4rem;">${escapeHtml(headingText)}</h2>
            <p class="duplicate-warning-sub" style="color:#555;font-size:0.95rem;margin-top:8px;line-height:1.5;">${escapeHtml(subText)}</p>
          </div>
          <button class="close-modal" type="button" aria-label="Close" style="border:0;background:#eef2f7;border-radius:50%;width:36px;height:36px;font-size:1.5rem;cursor:pointer;flex-shrink:0;">×</button>
        </div>
        <div class="duplicate-list" style="display:grid;gap:10px;margin:18px 0;">${matchesHtml}</div>
        <div class="duplicate-actions" style="display:flex;justify-content:flex-end;gap:10px;margin-top:12px;">
          <button class="secondary-button" type="button" data-action="cancel" style="padding:10px 18px;border-radius:999px;border:1px solid #ddd;background:#fff;cursor:pointer;font-weight:600;">Cancel and review</button>
          <button class="primary-button" type="button" data-action="submit" style="padding:10px 18px;border-radius:999px;border:0;background:${submitBtnBg};color:#fff;cursor:pointer;font-weight:600;">${escapeHtml(submitBtnLabel)}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = (decision) => {
      overlay.remove();
      resolve(decision);
    };

    overlay.querySelector(".close-modal").addEventListener("click", () => close("cancel"));
    overlay.querySelector('[data-action="cancel"]').addEventListener("click", () => close("cancel"));
    overlay.querySelector('[data-action="submit"]').addEventListener("click", () => close("submit"));
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close("cancel"); });
  });
}

async function callBackendAi(prompt, modelChain) {
  if (!BACKEND_URL) {
    throw new Error("AI is unavailable: BACKEND_URL is not configured in config.js.");
  }
  if (!supabaseClient) {
    throw new Error("AI is unavailable: Supabase is not configured.");
  }

  const { data: sessionData } = await supabaseClient.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    throw new Error("Please sign in to use AI features.");
  }

  const response = await fetch(`${BACKEND_URL}/ai/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, modelChain }),
  });

  if (!response.ok) {
    let message = `AI request failed (${response.status})`;
    try {
      const errBody = await response.json();
      if (errBody?.error) message = errBody.error;
    } catch (_e) { /* ignore */ }
    throw new Error(message);
  }

  const data = await response.json();
  if (!data?.text) {
    throw new Error("AI returned an empty response.");
  }
  return data.text;
}

async function getCurrentUserId() {
  const session = await getCurrentSession();
  return session?.user?.id || null;
}

function tr(key, fallback) {
  if (window.RF_I18N && typeof window.RF_I18N.t === "function") {
    return window.RF_I18N.t(key);
  }
  return fallback != null ? fallback : key;
}

async function renderAuthLinks() {
  const authLinks = document.querySelector("#auth-links");
  const protectedLinks = document.querySelector("#protected-links");
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  if (!authLinks) {
    return;
  }

  try {
    const session = await getCurrentSession();
    if (session?.user && getAdminSession()) {
      if (protectedLinks) {
        protectedLinks.innerHTML = `
          <a class="nav-link${currentPage === "admin.html" ? " active" : ""}" href="admin.html">${tr("nav.admin", "Admin")}</a>
          <a class="nav-link${currentPage === "analytics.html" ? " active" : ""}" href="analytics.html">${tr("nav.analytics", "Analytics")}</a>
        `;
      }

      authLinks.innerHTML = `
        <span class="auth-user">${escapeHtml(session.user.email || "Admin")}</span>
        <button id="logout-button" class="secondary-button auth-button" type="button">${tr("nav.logout", "Logout")}</button>
      `;
      document.querySelector("#logout-button")?.addEventListener("click", async () => {
        await handleLogout();
      });
      return;
    }

    if (session?.user) {
      if (protectedLinks) {
        const draftCount = getDrafts().length;
        const draftBadge = draftCount > 0 ? ` <span class="draft-nav-badge">${draftCount}</span>` : "";
        protectedLinks.innerHTML = `
          <a class="nav-link${currentPage === "enter-report.html" ? " active" : ""}" href="enter-report.html">${tr("nav.enter_report", "Enter Report")}</a>
          <a class="nav-link${currentPage === "drafts.html" ? " active" : ""}" href="drafts.html">${tr("nav.drafts", "Drafts")}${draftBadge}</a>
          <a class="nav-link${currentPage === "reports.html" ? " active" : ""}" href="reports.html">${tr("nav.reports", "Reports")}</a>
          <a class="nav-link${currentPage === "profile.html" ? " active" : ""}" href="profile.html">${tr("nav.profile", "Profile")}</a>
        `;
      }

      authLinks.innerHTML = `
        <a class="auth-user" href="profile.html" title="View profile">${escapeHtml(session.user.email || "Signed in")}</a>
        <button id="logout-button" class="secondary-button auth-button" type="button">${tr("nav.logout", "Logout")}</button>
      `;
      document.querySelector("#logout-button")?.addEventListener("click", async () => {
        await handleLogout();
      });
      return;
    }
  } catch (error) {
    console.error("Failed to load auth session:", error);
  }

  if (protectedLinks) {
    protectedLinks.innerHTML = "";
  }

  authLinks.innerHTML = `
    <a class="nav-link${currentPage === "login.html" ? " active" : ""}" href="login.html">${tr("nav.login", "Login")}</a>
    <a class="primary-button auth-button${currentPage === "signup.html" ? " active" : ""}" href="signup.html">${tr("nav.signup", "Sign Up")}</a>
  `;
}

window.renderAuthLinks = renderAuthLinks;

async function updateHomeHeroActions() {
  const heroActions = document.querySelector("#hero-auth-actions");
  if (!heroActions) {
    return;
  }

  try {
    const session = await getCurrentSession();
    if (session?.user && getAdminSession()) {
      heroActions.innerHTML = `
        <a class="primary-button" href="admin.html">Open Admin</a>
        <button id="hero-admin-logout" class="secondary-button" type="button">Logout</button>
      `;
      document.querySelector("#hero-admin-logout")?.addEventListener("click", async () => {
        await handleLogout();
      });
      return;
    }

    if (session?.user) {
      heroActions.innerHTML = `
        <a class="primary-button" href="enter-report.html">Enter Report</a>
        <a class="secondary-button" href="reports.html">View Reports</a>
      `;
      return;
    }
  } catch (error) {
    console.error("Failed to update hero actions:", error);
  }

  heroActions.innerHTML = `
    <a class="primary-button" href="login.html">Login</a>
    <a class="secondary-button" href="signup.html">Sign Up</a>
  `;
}

function revealAfterAuthGate() {
  document.documentElement.classList.remove("rf-auth-gating");
}

async function enforceProtectedPageAuth() {
  const currentPage = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  // Pages that require any signed-in Supabase session.
  const protectedPages = new Set([
    "enter-report.html",
    "reports.html",
    "drafts.html",
    "profile.html",
    "sop-library.html",
  ]);
  const adminPages = new Set(["admin.html", "analytics.html"]);
  const guestOnlyPages = new Set(["login.html", "signup.html", "forgot-password.html"]);
  const indexPages = new Set(["index.html", ""]);

  // The landing page must always render as signed-out. If a session exists
  // (e.g. user navigated here from an authed page), sign them out first so
  // the nav and hero actions show the guest UI.
  if (indexPages.has(currentPage)) {
    try {
      const session = await getCurrentSession();
      if (session?.user) {
        setAdminSession(false);
        if (supabaseClient) {
          try {
            await supabaseClient.auth.signOut();
          } catch (signOutError) {
            console.error("Sign out on index failed:", signOutError);
          }
        }
      }
    } catch (error) {
      console.error("Failed to check session on index:", error);
    }
    revealAfterAuthGate();
    return;
  }

  if (!protectedPages.has(currentPage) && !adminPages.has(currentPage) && !guestOnlyPages.has(currentPage)) {
    revealAfterAuthGate();
    return;
  }

  try {
    const session = await getCurrentSession();

    if (adminPages.has(currentPage)) {
      if (!session?.user) {
        window.location.replace("login.html");
        return;
      }
      // Re-verify admin claim against the database, not just the localStorage flag.
      const { data: profile } = supabaseClient
        ? await supabaseClient.from("profiles").select("is_admin").eq("id", session.user.id).maybeSingle()
        : { data: null };
      if (!profile?.is_admin) {
        setAdminSession(false);
        window.location.replace("reports.html");
        return;
      }
      setAdminSession(true);
      revealAfterAuthGate();
      return;
    }

    if (protectedPages.has(currentPage)) {
      if (!session?.user) {
        window.location.replace("login.html");
        return;
      }
      revealAfterAuthGate();
      return;
    }

    if (guestOnlyPages.has(currentPage)) {
      if (session?.user && getAdminSession()) {
        window.location.replace("admin.html");
        return;
      }
      if (session?.user) {
        window.location.replace("reports.html");
        return;
      }
      revealAfterAuthGate();
      return;
    }
  } catch (error) {
    console.error("Failed to enforce auth:", error);
    if (protectedPages.has(currentPage) || adminPages.has(currentPage)) {
      window.location.replace("login.html");
      return;
    }
    revealAfterAuthGate();
  }
}

async function handleLogout() {
  setAdminSession(false);
  if (supabaseClient) {
    try {
      await supabaseClient.auth.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }
  window.location.href = "login.html";
}

async function redirectAfterLogin(signInData, statusSelector) {
  if (signInData?.user?.id) {
    const { data: profile } = await supabaseClient.from("profiles").select("is_admin").eq("id", signInData.user.id).maybeSingle();
    if (profile?.is_admin) {
      setAdminSession(true);
      setStatusMessage(statusSelector, tr("msg.admin_login_ok", "Admin login successful."));
      window.location.href = "admin.html";
      return;
    }
  }
  setStatusMessage(statusSelector, tr("msg.login_ok", "Logged in successfully."));
  window.location.href = "reports.html";
}

function initLoginForm() {
  const form = document.querySelector("#login-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.querySelector("#login-email")?.value.trim() || "";
    const password = document.querySelector("#login-password")?.value || "";
    const submitButton = form.querySelector('button[type="submit"]');

    try {
      setStatusMessage("#login-status", tr("msg.logging_in", "Logging you in..."));
      submitButton.disabled = true;

      ensureSupabaseConfigured();

      const { data: signInData, error } = await supabaseClient.auth.signInWithPassword({ email, password });

      if (error) {
        throw error;
      }

      await redirectAfterLogin(signInData, "#login-status");
    } catch (error) {
      console.error("Login failed:", error);
      setStatusMessage("#login-status", error.message || tr("msg.login_fail", "Login failed."), true);
    } finally {
      submitButton.disabled = false;
    }
  });

  initGoogleSignIn();
}

async function generateGoogleNonce() {
  const random = new Uint8Array(32);
  crypto.getRandomValues(random);
  const rawNonce = Array.from(random, (b) => b.toString(16).padStart(2, "0")).join("");
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(rawNonce));
  const hashedNonce = Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, "0")).join("");
  return { rawNonce, hashedNonce };
}

function initGoogleSignIn() {
  const container = document.querySelector("#google-signin-container");
  if (!container) {
    return;
  }
  const clientId = (window.RF_CONFIG && window.RF_CONFIG.GOOGLE_LOGIN_CLIENT_ID) || "";
  if (!clientId) {
    return;
  }

  let pendingNonce = null;

  const handleCredential = async (response) => {
    try {
      setStatusMessage("#login-status", tr("msg.google_signing_in", "Signing you in with Google..."));
      ensureSupabaseConfigured();
      const { data: signInData, error } = await supabaseClient.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
        nonce: pendingNonce,
      });
      if (error) {
        throw error;
      }
      await redirectAfterLogin(signInData, "#login-status");
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setStatusMessage("#login-status", error.message || tr("msg.google_fail", "Google sign-in failed."), true);
    }
  };

  const start = async () => {
    if (!window.google?.accounts?.id) {
      window.setTimeout(start, 200);
      return;
    }
    try {
      const { rawNonce, hashedNonce } = await generateGoogleNonce();
      pendingNonce = rawNonce;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
        nonce: hashedNonce,
        ux_mode: "popup",
        auto_select: false,
      });
      window.google.accounts.id.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: container.clientWidth ? Math.min(container.clientWidth, 400) : 320,
      });
    } catch (error) {
      console.error("Google Identity Services init failed:", error);
    }
  };

  start();
}

function initSignupForm() {
  const form = document.querySelector("#signup-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const fullName = document.querySelector("#signup-name")?.value.trim() || "";
    const email = document.querySelector("#signup-email")?.value.trim() || "";
    const password = document.querySelector("#signup-password")?.value || "";
    const submitButton = form.querySelector('button[type="submit"]');

    try {
      ensureSupabaseConfigured();
      setStatusMessage("#signup-status", tr("msg.creating_account", "Creating your account..."));
      submitButton.disabled = true;

      const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${getAppOrigin()}/login.html`,
          data: {
            full_name: fullName || null
          }
        }
      });

      if (error) {
        throw error;
      }

      setStatusMessage("#signup-status", tr("msg.account_created", "Account created. Check your email to confirm your account if Supabase email confirmation is enabled."));
    } catch (error) {
      console.error("Signup failed:", error);
      setStatusMessage("#signup-status", error.message || tr("msg.signup_fail", "Signup failed."), true);
    } finally {
      submitButton.disabled = false;
    }
  });
}

function initForgotPasswordForm() {
  const form = document.querySelector("#forgot-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.querySelector("#forgot-email")?.value.trim() || "";
    const submitButton = form.querySelector('button[type="submit"]');

    try {
      ensureSupabaseConfigured();
      setStatusMessage("#forgot-status", tr("msg.sending_reset", "Sending reset link..."));
      submitButton.disabled = true;

      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${getAppOrigin()}/reset-password.html`,
      });

      if (error) {
        throw error;
      }

      setStatusMessage(
        "#forgot-status",
        tr(
          "msg.reset_sent",
          "If an account exists for that email, a reset link is on its way. Check your inbox (and spam folder)."
        )
      );
      form.reset();
    } catch (error) {
      console.error("Password reset request failed:", error);
      setStatusMessage("#forgot-status", error.message || tr("msg.reset_fail", "Could not send reset link."), true);
    } finally {
      submitButton.disabled = false;
    }
  });
}

async function initProfilePage() {
  const emailEl = document.querySelector("#profile-email");
  const nameInput = document.querySelector("#profile-name-input");
  if (!emailEl || !nameInput) {
    return;
  }

  const avatarEl = document.querySelector("#profile-avatar");
  const joinedEl = document.querySelector("#profile-joined");
  const totalEl = document.querySelector("#pstat-total");
  const pendingEl = document.querySelector("#pstat-pending");
  const resolvedEl = document.querySelector("#pstat-resolved");
  const saveNameBtn = document.querySelector("#save-name-btn");
  const savePasswordBtn = document.querySelector("#save-password-btn");
  const newPasswordInput = document.querySelector("#new-password");
  const confirmPasswordInput = document.querySelector("#confirm-password");

  try {
    ensureSupabaseConfigured();
    const session = await getCurrentSession();
    if (!session?.user) {
      window.location.replace("login.html");
      return;
    }

    const userId = session.user.id;
    const userEmail = session.user.email || "";

    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("full_name, email, created_at")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Failed to load profile:", profileError);
    }

    const fullName = profile?.full_name || session.user.user_metadata?.full_name || "";
    emailEl.textContent = userEmail || "Unknown";
    nameInput.value = fullName;
    if (avatarEl) {
      const seed = (fullName || userEmail || "?").trim().charAt(0).toUpperCase();
      avatarEl.textContent = seed || "?";
    }
    if (joinedEl) {
      const joined = profile?.created_at || session.user.created_at;
      joinedEl.textContent = joined ? `Joined ${formatDate(joined)}` : "";
    }

    try {
      const reports = await fetchReports();
      const total = reports.length;
      const pending = reports.filter((r) => getProcessingStatus(r) === "pending").length;
      const resolved = reports.filter((r) => r.admin_response || getProcessingStatus(r) === "resolved").length;
      if (totalEl) totalEl.textContent = String(total);
      if (pendingEl) pendingEl.textContent = String(pending);
      if (resolvedEl) resolvedEl.textContent = String(resolved);
    } catch (statsError) {
      console.warn("Failed to load profile stats:", statsError);
    }

    saveNameBtn?.addEventListener("click", async () => {
      const nextName = nameInput.value.trim();
      if (!nextName) {
        setStatusMessage("#name-status", tr("msg.enter_name", "Please enter a name."), true);
        return;
      }
      try {
        saveNameBtn.disabled = true;
        setStatusMessage("#name-status", tr("msg.saving", "Saving..."));

        const { error: updateError } = await supabaseClient
          .from("profiles")
          .update({ full_name: nextName, updated_at: new Date().toISOString() })
          .eq("id", userId);
        if (updateError) {
          throw updateError;
        }

        // Keep auth user_metadata in sync so other parts of the app see the new name.
        try {
          await supabaseClient.auth.updateUser({ data: { full_name: nextName } });
        } catch (metaError) {
          console.warn("Failed to sync user metadata:", metaError);
        }

        if (avatarEl) {
          avatarEl.textContent = nextName.charAt(0).toUpperCase();
        }
        setStatusMessage("#name-status", tr("msg.name_saved", "Name saved."));
      } catch (error) {
        console.error("Failed to save name:", error);
        setStatusMessage("#name-status", error.message || tr("msg.save_name_fail", "Could not save name."), true);
      } finally {
        saveNameBtn.disabled = false;
      }
    });

    savePasswordBtn?.addEventListener("click", async () => {
      const password = newPasswordInput?.value || "";
      const confirm = confirmPasswordInput?.value || "";
      if (password.length < 6) {
        setStatusMessage("#password-status", tr("msg.password_min", "Password must be at least 6 characters."), true);
        return;
      }
      if (password !== confirm) {
        setStatusMessage("#password-status", tr("msg.passwords_no_match", "Passwords do not match."), true);
        return;
      }
      try {
        savePasswordBtn.disabled = true;
        setStatusMessage("#password-status", tr("msg.updating", "Updating..."));
        const { error } = await supabaseClient.auth.updateUser({ password });
        if (error) {
          throw error;
        }
        if (newPasswordInput) newPasswordInput.value = "";
        if (confirmPasswordInput) confirmPasswordInput.value = "";
        setStatusMessage("#password-status", tr("msg.password_updated", "Password updated."));
      } catch (error) {
        console.error("Failed to update password:", error);
        setStatusMessage("#password-status", error.message || tr("msg.update_password_fail", "Could not update password."), true);
      } finally {
        savePasswordBtn.disabled = false;
      }
    });
  } catch (error) {
    console.error("Failed to initialize profile page:", error);
  }
}

const THEME_STORAGE_KEY = "rf-theme";

function getCurrentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

function initThemeToggle() {
  const topbar = document.querySelector(".topbar");
  if (!topbar) {
    return;
  }
  if (topbar.querySelector(".theme-toggle")) {
    return;
  }
  const topnav = topbar.querySelector(".topnav");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";
  button.setAttribute("aria-label", "Toggle dark mode");

  const refreshButton = () => {
    const theme = getCurrentTheme();
    button.textContent = theme === "dark" ? "☀️" : "🌙";
    button.title = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  };

  button.addEventListener("click", () => {
    const next = getCurrentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (error) {
      // ignore storage errors (private mode etc.)
    }
    refreshButton();
  });

  refreshButton();

  if (topnav) {
    topnav.insertBefore(button, topnav.firstChild);
  } else {
    topbar.appendChild(button);
  }
}

function initLanguageToggle() {
  const topbar = document.querySelector(".topbar");
  if (!topbar) {
    return;
  }
  if (topbar.querySelector(".lang-toggle")) {
    return;
  }
  const topnav = topbar.querySelector(".topnav");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "lang-toggle";

  const refreshButton = () => {
    const lang = window.RF_I18N?.current === "ms" ? "ms" : "en";
    button.textContent = lang === "ms" ? "MS" : "EN";
    const titleKey = lang === "ms" ? "lang.toggle_to_en" : "lang.toggle_to_ms";
    const fallback = lang === "ms" ? "Switch to English" : "Switch to Malay";
    button.title = tr(titleKey, fallback);
    button.setAttribute("aria-label", button.title);
    button.setAttribute("aria-pressed", lang === "ms" ? "true" : "false");
  };

  window.refreshLanguageToggle = refreshButton;

  button.addEventListener("click", () => {
    if (!window.RF_I18N) {
      return;
    }
    const next = window.RF_I18N.current === "ms" ? "en" : "ms";
    window.RF_I18N.setLang(next);
    // Reload so JS-rendered dynamic content (report cards, admin cards, drafts,
    // chat messages, etc.) re-renders in the newly selected language.
    window.location.reload();
  });

  refreshButton();

  if (topnav) {
    topnav.insertBefore(button, topnav.firstChild);
  } else {
    topbar.appendChild(button);
  }
}

function initResetPasswordForm() {
  const form = document.querySelector("#reset-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = document.querySelector("#reset-password")?.value || "";
    const confirm = document.querySelector("#reset-password-confirm")?.value || "";
    const submitButton = form.querySelector('button[type="submit"]');

    if (password !== confirm) {
      setStatusMessage("#reset-status", tr("msg.passwords_no_match", "Passwords do not match."), true);
      return;
    }

    try {
      ensureSupabaseConfigured();
      setStatusMessage("#reset-status", tr("msg.updating_password", "Updating your password..."));
      submitButton.disabled = true;

      const { error } = await supabaseClient.auth.updateUser({ password });
      if (error) {
        throw error;
      }

      setStatusMessage("#reset-status", tr("msg.password_updated_redirect", "Password updated. Redirecting to log in..."));
      try {
        await supabaseClient.auth.signOut();
      } catch (signOutError) {
        console.warn("Sign-out after reset failed:", signOutError);
      }
      window.setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);
    } catch (error) {
      console.error("Password update failed:", error);
      setStatusMessage(
        "#reset-status",
        error.message ||
          tr(
            "msg.reset_link_expired",
            "Could not update password. The reset link may have expired — request a new one."
          ),
        true
      );
    } finally {
      submitButton.disabled = false;
    }
  });
}

function getStoredActiveSource() {
  return window.localStorage.getItem(ACTIVE_SOURCE_KEY) || "manual";
}

function saveStoredActiveSource(sourceType) {
  window.localStorage.setItem(ACTIVE_SOURCE_KEY, sourceType);
}

function loadStoredPickerState() {
  try {
    const raw = window.localStorage.getItem(PICKER_STATE_KEY);
    if (!raw) {
      return;
    }

    const saved = JSON.parse(raw);
    pickerState.driveAccount = saved.driveAccount || null;
    pickerState.driveFile = saved.driveFile || null;
    pickerState.emailAccount = saved.emailAccount || null;
    pickerState.emailMessage = saved.emailMessage || null;
  } catch (error) {
    pickerState.driveAccount = null;
    pickerState.driveFile = null;
    pickerState.emailAccount = null;
    pickerState.emailMessage = null;
  }
}

function savePickerState() {
  window.localStorage.setItem(PICKER_STATE_KEY, JSON.stringify(pickerState));
}

function ensureSupabaseConfigured() {
  if (supabaseClient) {
    return true;
  }

  throw new Error("Supabase is not configured yet. Add your project URL and anon key in app.js.");
}

function getStoredView() {
  return window.localStorage.getItem(REPORTS_VIEW_KEY) || "card";
}

function saveStoredView(view) {
  window.localStorage.setItem(REPORTS_VIEW_KEY, view);
}

function createReportId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `report-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function showToast(message, isSuccess = true) {
  const existing = document.querySelector(".rf-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "rf-toast" + (isSuccess ? "" : " rf-toast-error");
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("rf-toast-visible"));
  setTimeout(() => {
    toast.classList.remove("rf-toast-visible");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function getDrafts() {
  try {
    return JSON.parse(window.localStorage.getItem(DRAFTS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveDraftToStore(draft) {
  const drafts = getDrafts();
  const idx = drafts.findIndex((d) => d.id === draft.id);
  if (idx >= 0) {
    drafts[idx] = draft;
  } else {
    drafts.unshift(draft);
  }
  window.localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

function deleteDraftFromStore(id) {
  const drafts = getDrafts().filter((d) => d.id !== id);
  window.localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  idbDeleteDraftFiles(id).catch(() => { /* best-effort */ });
}

function getDraftById(id) {
  return getDrafts().find((d) => d.id === id) || null;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const htmlMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    };

    return htmlMap[character];
  });
}

function looksLikeOcrNoise(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return false;
  if (trimmed.length < 4) return true;

  const lettersOnly = trimmed.replace(/[^A-Za-z0-9\s]/g, " ").trim();
  if (!lettersOnly) return true;

  const tokens = lettersOnly.split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;

  const shortTokens = tokens.filter((t) => t.length <= 2).length;
  if (tokens.length >= 3 && shortTokens / tokens.length >= 0.55) return true;

  const singletons = tokens.filter((t) => t.length === 1 && /[A-Za-z]/.test(t)).length;
  if (tokens.length >= 4 && singletons / tokens.length >= 0.3) return true;

  const totalLetters = (trimmed.match(/[A-Za-z]/g) || []).length;
  if (trimmed.length >= 12 && totalLetters / trimmed.length < 0.4) return true;

  return false;
}

function getUsableExtractedText(report) {
  const raw = report?.extracted_text;
  if (!raw || looksLikeOcrNoise(raw)) return "";
  return String(raw);
}

function cleanSummaryText(value) {
  if (!value) return "";
  return String(value)
    .replace(/[\u2028\u2029]/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u206A-\u206F\uFEFF]/g, "")
    .replace(/[\u2500-\u259F\u2600-\u26FF\u2700-\u27BF]/g, "")
    .replace(/\u2261/g, "")
    .replace(/[\x00-\x09\x0B-\x1F\x7F]/g, "")
    .replace(/[\u2022\u25A0\u25A1\u25AA\u25AB\u25CB\u25CE\u25CF\u25C6\u25C7]\s*/g, "\u2022 ")
    .replace(/([^\n])(\u2022 )/g, "$1\n$2")
    .replace(/([.!?:])\s+(\d{1,2}[.)]\s)/g, "$1\n$2")
    .replace(/^[ \t]+/gm, "")
    .replace(/ {2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+/, "")
    .trimEnd();
}

function setFormStatus(message, isError = false) {
  const statusNode = document.querySelector("#form-status");
  if (!statusNode) {
    return;
  }

  statusNode.textContent = message || "";
  statusNode.classList.toggle("error", Boolean(message) && isError);
  statusNode.classList.toggle("success", Boolean(message) && !isError);
}

function getSourceLabel(sourceType) {
  const labels = {
    manual: "Text",
    file: "File",
    drive: "Google Drive",
    email: "Email"
  };

  return labels[sourceType] || sourceType;
}

function getReportCreatedAt(report) {
  return report.created_at || report.createdAt;
}

function getReportPreview(report) {
  if (report.explanation) {
    return report.explanation;
  }

  if (report.description) {
    return report.description;
  }

  if (report.content) {
    return report.content.slice(0, 96);
  }

  if (report.file_name) {
    return report.file_name;
  }

  return "No preview available";
}

function getSourceExplanation(sourceType) {
  const noteInputs = {
    file: "#file-note",
    drive: "#drive-note",
    email: "#email-note"
  };

  const selector = noteInputs[sourceType];
  if (!selector) {
    return "";
  }

  return document.querySelector(selector)?.value.trim() || "";
}

function isImageReport(report) {
  return Boolean(report.mime_type && report.mime_type.startsWith("image/"));
}

function isPdfReport(report) {
  return report.mime_type === "application/pdf";
}

function isOfficePreviewableReport(report) {
  const officeMimeTypes = new Set([
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ]);

  return Boolean(report.file_url && report.mime_type && officeMimeTypes.has(report.mime_type));
}

function getOfficePreviewUrl(fileUrl) {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
}

function getDriveExportInfo(mimeType) {
  const exportMap = {
    "application/vnd.google-apps.document": {
      exportMimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      extension: "docx"
    },
    "application/vnd.google-apps.spreadsheet": {
      exportMimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      extension: "xlsx"
    },
    "application/vnd.google-apps.presentation": {
      exportMimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      extension: "pptx"
    },
    "application/vnd.google-apps.drawing": {
      exportMimeType: "image/png",
      extension: "png"
    }
  };

  return exportMap[mimeType] || null;
}

async function fetchDriveFileBlob(fileId, accessToken, mimeType) {
  const exportInfo = getDriveExportInfo(mimeType);
  const requestUrl = exportInfo
    ? `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportInfo.exportMimeType)}`
    : `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const response = await fetch(requestUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Drive file download failed with status ${response.status}`);
  }

  return {
    blob: await response.blob(),
    mimeType: exportInfo?.exportMimeType || mimeType || response.headers.get("content-type") || "application/octet-stream",
    extension: exportInfo?.extension || ""
  };
}

function ensureFileNameExtension(fileName, extension) {
  if (!extension) {
    return fileName;
  }

  return fileName.toLowerCase().endsWith(`.${extension.toLowerCase()}`) ? fileName : `${fileName}.${extension}`;
}

function createPreviewContent(report) {
  const adminResponseHtml = report.admin_response
    ? `<div class="preview-admin-response">
        <p class="preview-admin-response-label">Admin Response</p>
        <p class="preview-admin-response-text">${escapeHtml(report.admin_response)}</p>
      </div>`
    : "";

  if (report.file_url && isImageReport(report)) {
    const extractedText = getUsableExtractedText(report).trim();
    const hasContent = !!(report.content && String(report.content).trim());
    const emptyTextNote = !hasContent && !extractedText
      ? `<div class="preview-file-fallback preview-empty-note"><p>No output detected — no readable text was found in the image.</p></div>`
      : "";
    return `
      <div class="preview-media-frame">
        <img class="preview-image" src="${escapeHtml(report.file_url)}" alt="${escapeHtml(report.title)}">
      </div>
      ${hasContent ? `<div class="preview-copy-block"><pre class="preview-text">${escapeHtml(report.content)}</pre></div>` : ""}
      ${emptyTextNote}
      <a class="secondary-button preview-link" href="${escapeHtml(report.file_url)}" target="_blank" rel="noreferrer">Open full image</a>
      ${adminResponseHtml}
    `;
  }

  if (report.file_url && isPdfReport(report)) {
    return `
      <div class="preview-media-frame pdf-frame">
        <iframe class="preview-iframe" src="${escapeHtml(report.file_url)}" title="${escapeHtml(report.title)}"></iframe>
      </div>
      ${report.content ? `<div class="preview-copy-block"><pre class="preview-text">${escapeHtml(report.content)}</pre></div>` : ""}
      <a class="secondary-button preview-link" href="${escapeHtml(report.file_url)}" target="_blank" rel="noreferrer">Open PDF in new tab</a>
      ${adminResponseHtml}
    `;
  }

  if (report.file_url && isOfficePreviewableReport(report)) {
    return `
      <div class="preview-media-frame office-frame">
        <iframe class="preview-iframe" src="${escapeHtml(getOfficePreviewUrl(report.file_url))}" title="${escapeHtml(report.title)}"></iframe>
      </div>
      ${report.content ? `<div class="preview-copy-block"><pre class="preview-text">${escapeHtml(report.content)}</pre></div>` : ""}
      <a class="secondary-button preview-link" href="${escapeHtml(report.file_url)}" target="_blank" rel="noreferrer">Download file</a>
      ${adminResponseHtml}
    `;
  }

  if (report.file_url) {
    return `
      <div class="preview-file-fallback">
        <p>This file type cannot be embedded here yet.</p>
        <a class="primary-button preview-link" href="${escapeHtml(report.file_url)}" target="_blank" rel="noreferrer">Open file</a>
      </div>
      ${adminResponseHtml}
    `;
  }

  if (report.content) {
    return `
      <div class="preview-copy-block">
        <pre class="preview-text">${escapeHtml(report.content)}</pre>
      </div>
      ${adminResponseHtml}
    `;
  }

  return `
    <div class="preview-file-fallback">
      <p>No preview is available for this report.</p>
    </div>
    ${adminResponseHtml}
  `;
}

function openReportPreview(report) {
  const modal = document.querySelector("#report-preview-modal");
  const titleNode = document.querySelector("#preview-title");
  const typeNode = document.querySelector("#preview-type");
  const dateNode = document.querySelector("#preview-date");
  const bodyNode = document.querySelector("#preview-body");

  if (!modal || !titleNode || !typeNode || !dateNode || !bodyNode) {
    return;
  }

  titleNode.textContent = report.title || "Untitled report";
  typeNode.textContent = getSourceLabel(report.source_type || report.sourceType);
  dateNode.textContent = formatDate(getReportCreatedAt(report));
  bodyNode.innerHTML = createPreviewContent(report);
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");

  setupPreviewChat(report);
}

function setupPreviewChat(report) {
  const section = document.querySelector(".preview-chat-section");
  if (!section) return;

  const hasContent = !!(getUsableExtractedText(report) || report.content || report.description || report.explanation || report.title);
  section.dataset.chatEnabled = hasContent ? "true" : "false";

  const chatMessages = section.querySelector(".chat-messages");
  const chatForm = section.querySelector(".chat-input-row");
  const chatInput = section.querySelector(".chat-input");
  const chatSendBtn = section.querySelector(".chat-send-btn");
  const chatClearBtn = section.querySelector(".chat-clear-btn");
  const disabledNote = section.querySelector(".chat-disabled-note");

  chatInput.disabled = !hasContent;
  chatSendBtn.disabled = !hasContent;
  if (disabledNote) disabledNote.classList.toggle("hidden", hasContent);

  // Replace nodes to drop any prior listeners from a previous preview.
  const freshForm = chatForm.cloneNode(true);
  chatForm.parentNode.replaceChild(freshForm, chatForm);
  const freshClear = chatClearBtn.cloneNode(true);
  chatClearBtn.parentNode.replaceChild(freshClear, chatClearBtn);

  const form = section.querySelector(".chat-input-row");
  const input = section.querySelector(".chat-input");
  const sendBtn = section.querySelector(".chat-send-btn");
  const clearBtn = section.querySelector(".chat-clear-btn");

  const chatHistory = [];

  const renderEmptyState = () => {
    chatMessages.innerHTML = `
      <div class="chat-empty">
        <span class="chat-empty-icon" aria-hidden="true">&#128172;</span>
        <p>Ask anything about this report — names, dates, deadlines, or a specific phrase.</p>
        <div class="chat-suggestions">
          <button type="button" class="chat-suggestion">Summarize this in one line</button>
          <button type="button" class="chat-suggestion">What deadlines are mentioned?</button>
          <button type="button" class="chat-suggestion">Who is involved?</button>
        </div>
      </div>`;
  };
  renderEmptyState();

  const appendBubble = (role, text) => {
    const empty = chatMessages.querySelector(".chat-empty");
    if (empty) empty.remove();
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble chat-bubble-${role}`;
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return bubble;
  };

  const askQuestion = async (question) => {
    if (!question || !hasContent) return;
    input.value = "";
    input.style.height = "auto";
    appendBubble("user", question);
    input.disabled = true;
    sendBtn.disabled = true;
    const pending = appendBubble("ai", "Thinking...");
    pending.classList.add("chat-bubble-pending");
    try {
      const answer = await sendChatMessage(report, question, chatHistory);
      pending.classList.remove("chat-bubble-pending");
      pending.textContent = answer;
      chatHistory.push({ role: "user", text: question });
      chatHistory.push({ role: "assistant", text: answer });
      while (chatHistory.length > 12) chatHistory.shift();
    } catch (err) {
      pending.classList.remove("chat-bubble-pending");
      pending.classList.add("chat-bubble-error");
      pending.textContent = `Couldn't answer: ${err.message || "unknown error"}`;
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    askQuestion(input.value.trim());
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 140) + "px";
  });

  chatMessages.addEventListener("click", (e) => {
    const suggestion = e.target.closest(".chat-suggestion");
    if (suggestion) askQuestion(suggestion.textContent.trim());
  });

  clearBtn.addEventListener("click", () => {
    chatHistory.length = 0;
    renderEmptyState();
    input.focus();
  });
}

function closeReportPreview() {
  const modal = document.querySelector("#report-preview-modal");
  const bodyNode = document.querySelector("#preview-body");

  if (!modal) {
    return;
  }

  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");

  if (bodyNode) {
    bodyNode.innerHTML = "";
  }
}

function getPublicFileUrl(path) {
  ensureSupabaseConfigured();
  const { data } = supabaseClient.storage.from(SUPABASE_REPORTS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function uploadReportFile(file) {
  ensureSupabaseConfigured();
  const filePath = `${new Date().toISOString().slice(0, 10)}/${createReportId()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error } = await supabaseClient.storage
    .from(SUPABASE_REPORTS_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream"
    });

  if (error) {
    throw error;
  }

  return {
    filePath,
    fileUrl: getPublicFileUrl(filePath)
  };
}

async function insertReports(reportRows) {
  ensureSupabaseConfigured();
  const currentUserId = await getCurrentUserId();
  const rowsWithUserId = reportRows.map((reportRow) => ({
    ...reportRow,
    user_id: reportRow.user_id || currentUserId
  }));
  const { data, error } = await supabaseClient
    .from("reports")
    .insert(rowsWithUserId)
    .select();

  if (error) {
    throw error;
  }

  return data || [];
}

async function fetchReports(options = {}) {
  ensureSupabaseConfigured();
  const includeAll = Boolean(options.includeAll);
  const currentUserId = await getCurrentUserId();
  let query = supabaseClient
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (!includeAll && currentUserId) {
    query = query.eq("user_id", currentUserId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

function getProcessingStatus(report) {
  return report.processing_status || (report.extracted_text || report.detailed_summary ? "processed" : "pending");
}

function getUserStatusLabel(report) {
  if (report.admin_response) return tr("status.replied", "Replied");
  const status = getProcessingStatus(report);
  const keyMap = {
    pending: ["common.pending", "Pending"],
    extracted: ["status.in_review", "In Review"],
    processed: ["status.reviewed", "Reviewed"],
    under_review: ["admin.status_review", "Under Review"],
    resolved: ["common.resolved", "Resolved"],
  };
  const entry = keyMap[status];
  return entry ? tr(entry[0], entry[1]) : status;
}

function getUserStatusClass(report) {
  if (report.admin_response) return "replied";
  return getProcessingStatus(report);
}

function parseTags(raw) {
  if (!raw) return [];
  return String(raw).split(",").map((t) => t.trim()).filter(Boolean);
}

function renderTagBadges(tags) {
  if (!tags || !tags.length) return "";
  return `<div class="tag-badges">${tags.map((t) => `<span class="tag-badge">${escapeHtml(t)}</span>`).join("")}</div>`;
}

function generateLocalSummary(report) {
  const usableExtracted = getUsableExtractedText(report);
  if (!report.title && !report.description && !report.explanation && !usableExtracted) return null;
  const rawText = usableExtracted.trim();
  const topic = report.title || report.description || "this content";

  let points = rawText.split("\n").map((s) => s.trim()).filter(Boolean);
  if (points.length <= 1 && rawText) {
    points = rawText.split(/(?<=[.!?])\s+(?=[A-Z0-9•●])/).map((s) => s.trim()).filter(Boolean);
  }
  points = points.filter((p) => p.length >= 4).slice(0, 8);

  return JSON.stringify({
    v: AI_SUMMARY_VERSION,
    title: report.title || "Untitled",
    summary_steps: `This is a document about ${topic}.`.trim(),
    key_points: points.length
      ? points.map((p) => `• ${p.replace(/^[•●•●○*\-]\s*/, "")}`).join("\n")
      : "No key points extracted.",
    sop: [
      report.title && `Title: ${report.title}`,
      report.description && `Description:\n${report.description.trim()}`,
      report.explanation && `Explanation:\n${report.explanation.trim()}`,
      usableExtracted && `Extracted Content:\n${usableExtracted.trim()}`
    ].filter(Boolean).join("\n\n")
  });
}

function truncateForAI(text, maxChars) {
  if (!text) return text;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n…[truncated to fit token budget]";
}

async function generateGeminiSummary(report) {
  const usableExtracted = getUsableExtractedText(report);
  const parts = [
    report.title && `Title: ${report.title}`,
    report.description && `Description: ${truncateForAI(report.description, 4000)}`,
    report.explanation && `Explanation: ${truncateForAI(report.explanation, 4000)}`,
    usableExtracted && `Extracted Text: ${truncateForAI(usableExtracted, 8000)}`
  ].filter(Boolean).join("\n\n");

  if (!parts) return null;

  const prompt = `You are a strict information extraction engine. Extract ONLY important factual information from the CONTENT below and organize it into the four fields described. Return ONLY a JSON object with exactly these four fields — no extra text, no markdown fences.

STRICT EXTRACTION RULES (apply to every field):
- DO NOT summarize, rewrite, paraphrase, or explain.
- DO NOT repeat words, phrases, or bullets.
- DO NOT add, guess, or infer information that is not explicitly present.
- ONLY extract what is literally stated in the text.
- Ignore broken sentences, OCR noise, and formatting artifacts.
- Remove duplicate or repeated content.
- Keep every extracted point short and precise — one line each.

FORMATTING RULES (apply to every field):
- Use \\n for line breaks inside strings. Do NOT use unicode line separators, tabs, or table glyphs.
- Use "• " (bullet + space) as the ONLY bullet character. Never use "●", "*", "-", or numbered markers as bullets.
- Never run multiple bullets or headings together on one line — each bullet and each heading must be on its own line.
- No box-drawing, table-cell characters, or markdown symbols like # or **.

{
  "title": "One line. The document type, title, or subject line as stated or clearly labeled in the text (e.g. 'Resume — Jane Doe', 'Assignment 3: Sorting Algorithms', 'Meeting Notes — Sprint Planning'). If the text has no explicit title, use a minimal factual label describing the document type only. No trailing punctuation, no line breaks.",
  "summary_steps": "One short sentence (under 25 words) stating ONLY the document type and its primary subject as evident from the text. No interpretation, no purpose guessing. Examples: 'This is a resume for a software engineer role.' / 'This is a set of lecture notes on operating systems.' / 'This is a meeting note from a project planning session.' Flowing prose — no bullets, no newlines.",
  "key_points": "Read the text and logically group its content into a small number of key points. OUTPUT FORMAT: ONLY bullet points — no intro, no outro, no headings, no paragraphs. Between 3 and 6 bullets total. Each bullet:\\n- starts with '• ' (bullet + space)\\n- is on its own line, separated from the next by \\n\\n- captures ONE coherent idea or theme (related facts may be grouped together when they belong to the same idea)\\n- is a concise single sentence, ideally 8 to 25 words\\n- stays grounded in the text — no invented facts, no added interpretation\\n\\nHARD RULES:\\n- NEVER output a single long bullet that summarizes the entire document. That is FORBIDDEN.\\n- NEVER output a multi-sentence bullet or a paragraph disguised as a bullet.\\n- If the text has more than 6 distinct ideas, MERGE related ones into themed bullets (e.g. group all 'Recommendations' together, all 'Issues reported' together).\\n- Skip filler, greetings, boilerplate, duplicates.\\n\\nThink of the result as the reader's quick-scan takeaways — just enough bullets to capture every important idea, but grouped so no bullet is trivial or repetitive.\\n\\nExample — narrative report ('The customer submitted a report about delays and system errors. Functionality meets expectations but inconsistencies affect experience during peak hours. Support responses were helpful but not always timely. Recommendations include improving stability, optimizing performance under load, and enhancing support responsiveness.'):\\n'• Customer reported delays in response time and occasional system errors\\n• Overall functionality meets expectations but inconsistencies worsen during peak hours\\n• Support responses were helpful but not always timely\\n• Recommendations: improve system stability, optimize performance under load, enhance support responsiveness'\\n\\nExample — meeting note:\\n'• Project: Malaysia Tourist Attraction Map built on Leaflet and OpenStreetMap\\n• Attendees: Muntasir, Mohammed Jamal, Saqr, Jana, Yiman — meeting on 23 April 2026\\n• Saqr to integrate the map and Jana to improve UI layout, both by 29/4/2026\\n• Yiman unfamiliar with map API — to research tutorials and documentation\\n• Team has an existing prototype and is adding save/favorite and search/filter features'",
  "sop": "A structured extraction organized under section headings. Use ONLY the sections below that actually exist in the text — omit sections with no data. Each section heading on its own line followed by '• ' bullets beneath it, with \\n\\n between sections. Do not include empty sections. Available sections (include only if present in text):\\n- Document Type / Title\\n- Name / Author\\n- Contact Information\\n- Education\\n- Skills\\n- Tools / Technologies\\n- Projects / Work Experience\\n- Key Dates / Timeline\\n- Important Concepts / Topics\\n- Requirements / Objectives\\n- Other Relevant Information\\nFormat example: 'Skills\\n• Python\\n• SQL\\n• Git\\n\\nEducation\\n• BSc Computer Science, University X, 2024'. Document handling: if the text is a RESUME, focus on personal, education, skills, tools, projects. If it is an ASSIGNMENT, extract objectives, requirements, deadlines, key tasks. If it is LECTURE NOTES, extract core concepts and key ideas — avoid repetition."
}

Content to analyze:
${parts}`;

  const modelChain = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite"];
  const text = await callBackendAi(prompt, modelChain);

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.title || parsed.summary_steps || parsed.key_points || parsed.sop) {
        parsed.v = AI_SUMMARY_VERSION;
        return JSON.stringify(parsed);
      }
    }
  } catch (e) {}
  return text;
}

async function sendChatMessage(report, question, history) {
  const rawText = (getUsableExtractedText(report) || report.content || "").trim();
  if (!rawText) {
    throw new Error("This report has no extracted content yet — ask again once extraction finishes.");
  }
  const extractedText = truncateForAI(rawText, 8000);

  const historyBlock = history && history.length
    ? "\n\nPRIOR CONVERSATION (most recent last):\n" + history.slice(-6).map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${truncateForAI(m.text, 500)}`).join("\n")
    : "";

  const prompt = `You are an assistant answering questions about ONE specific document.

ANSWER RULES:
- Base every answer ONLY on the DOCUMENT below. Do not use outside knowledge.
- If the answer is not present in the DOCUMENT, reply exactly: "The document doesn't mention that."
- Keep answers short and direct (1 to 3 sentences unless the question clearly requires more detail).
- Do not invent names, dates, numbers, or quotes.
- Do not summarize the whole document unless the user explicitly asks for a summary.
- Be factual and neutral.

DOCUMENT:
${extractedText}${historyBlock}

CURRENT QUESTION: ${question}

Answer:`;

  const modelChain = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite"];
  const text = await callBackendAi(prompt, modelChain);
  return text.trim();
}

function parseSummaryJson(text) {
  if (!text) return null;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const obj = JSON.parse(jsonMatch[0]);
      if (obj.v !== AI_SUMMARY_VERSION) return null;
      if (obj.title || obj.summary_steps || obj.key_points || obj.sop) return obj;
    }
  } catch (e) {}
  return null;
}

function renderSummaryBody(summaryText, isLoading = false) {
  if (isLoading) return `<p class="summary-loading">Generating AI analysis...</p>`;
  if (!summaryText) return `<p class="summary-empty">Not enough content to generate analysis.</p>`;

  const parsed = parseSummaryJson(summaryText);
  if (parsed) {
    const block = (label, text) => {
      const cleaned = cleanSummaryText(text);
      if (!cleaned || looksLikeOcrNoise(cleaned)) return "";
      return `<div class="ai-output-block">
        <p class="ai-output-label">${label}</p>
        <pre class="ai-output-pre summary-text-preview">${escapeHtml(cleaned)}</pre>
        <button class="read-more-btn" type="button">Read more</button>
      </div>`;
    };
    const blocks = [
      block("Article Title", parsed.title),
      block("Summary", parsed.summary_steps),
      block("Key Points", parsed.key_points),
      block("SOP — Clean Procedure", parsed.sop)
    ].filter(Boolean);
    if (!blocks.length) {
      return `<p class="summary-empty">No output detected — the source had no readable content to analyze.</p>`;
    }
    return `<div class="ai-outputs">${blocks.join("")}</div>`;
  }

  if (looksLikeOcrNoise(summaryText)) {
    return `<p class="summary-empty">No output detected — the source had no readable content to analyze.</p>`;
  }

  return `<pre class="summary-text-preview">${escapeHtml(summaryText)}</pre>${summaryText.length > 300 ? `<button class="read-more-btn" type="button">Read more</button>` : ""}`;
}

async function fetchUserProfile(userId) {
  if (!userId || !supabaseClient) return null;
  const { data } = await supabaseClient.from("profiles").select("full_name, email").eq("id", userId).maybeSingle();
  return data || null;
}

async function saveSummaryToDb(reportId, summary) {
  if (!supabaseClient) return;
  await supabaseClient.from("reports").update({
    detailed_summary: summary,
    processing_status: "processed",
    processed_at: new Date().toISOString()
  }).eq("id", reportId);
}

const TRIAGE_CATEGORIES = ["delay", "damage", "lost", "fraud", "customs", "address", "other"];

const TRIAGE_CATEGORY_LABEL = {
  delay: "Delay",
  damage: "Damage",
  lost: "Lost / Missing",
  fraud: "Fraud / Theft",
  customs: "Customs",
  address: "Address Issue",
  other: "Other"
};

const TRIAGE_SEVERITY_LABEL = {
  1: "Info",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Critical"
};

// Free-tier Gemini caps at ~15-20 requests/min. Serialize triage so admin
// cards don't blast the quota in parallel and 429.
const TRIAGE_MIN_GAP_MS = 3500;
let triageQueue = Promise.resolve();
let triageLastRun = 0;

function enqueueTriage(report) {
  const job = triageQueue.then(async () => {
    const sinceLast = Date.now() - triageLastRun;
    if (sinceLast < TRIAGE_MIN_GAP_MS) {
      await new Promise((r) => setTimeout(r, TRIAGE_MIN_GAP_MS - sinceLast));
    }
    triageLastRun = Date.now();
    return generateTriage(report);
  });
  // Keep the queue alive even if a job rejects.
  triageQueue = job.catch(() => {});
  return job;
}

async function generateTriage(report) {
  const usableExtracted = getUsableExtractedText(report);
  const parts = [
    report.title && `Title: ${report.title}`,
    report.description && `Description: ${truncateForAI(report.description, 1500)}`,
    report.explanation && `Explanation: ${truncateForAI(report.explanation, 1500)}`,
    usableExtracted && `Extracted Text: ${truncateForAI(usableExtracted, 2500)}`
  ].filter(Boolean).join("\n\n");

  if (!parts) return null;

  const prompt = `You are a logistics triage classifier for DHL. Read the REPORT below and return ONLY a JSON object — no markdown, no commentary.

Schema (return EXACTLY these three keys):
{
  "category": one of ["delay","damage","lost","fraud","customs","address","other"],
  "severity": integer 1 to 5 (1 = informational, 2 = low, 3 = medium, 4 = high, 5 = critical/urgent),
  "reason": one short sentence (max 18 words) explaining why this category and severity were chosen, grounded in the report
}

CATEGORY GUIDE:
- delay: late, missed window, stuck in transit, slow processing
- damage: package broken, contents damaged, leaked, crushed, water damage
- lost: missing parcel, undelivered, vanished, no trace
- fraud: theft, stolen package, false claim, signature forged, suspicious behavior
- customs: customs hold, import/export documents, duty/tax issues
- address: wrong address, undeliverable, recipient unknown, return to sender
- other: anything that does not clearly fit the above

SEVERITY GUIDE (decide by business impact, not tone):
- 5: critical/urgent — high-value loss, fraud, repeated systemic failure, regulatory risk, customer threatening legal action
- 4: high — significant damage or loss, major delay on time-sensitive shipment, customer very upset
- 3: medium — typical complaint, single delivery failure, repairable issue
- 2: low — minor inconvenience, small delay, cosmetic damage
- 1: info — general feedback, status update, no action required

REPORT:
${parts}`;

  const modelChain = ["gemini-2.5-flash-lite", "gemini-2.0-flash-lite", "gemini-2.5-flash"];
  const text = await callBackendAi(prompt, modelChain);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  let parsed;
  try { parsed = JSON.parse(jsonMatch[0]); } catch { return null; }

  const category = TRIAGE_CATEGORIES.includes(parsed.category) ? parsed.category : "other";
  let severity = Number(parsed.severity);
  if (!Number.isFinite(severity)) severity = 3;
  severity = Math.max(1, Math.min(5, Math.round(severity)));
  const reason = typeof parsed.reason === "string" ? parsed.reason.trim().slice(0, 240) : "";

  return { category, severity, reason };
}

async function saveTriageToDb(reportId, triage) {
  if (!supabaseClient || !triage) return;
  const { error } = await supabaseClient.from("reports").update({
    category: triage.category,
    severity: triage.severity,
    triage_reason: triage.reason,
    triaged_at: new Date().toISOString()
  }).eq("id", reportId);
  if (error) {
    console.error("[Triage] DB update failed:", error.message, error);
    if (/column .* does not exist/i.test(error.message || "")) {
      console.error("[Triage] >>> The triage columns are missing. Run sql/add_triage_columns.sql in your Supabase SQL editor. <<<");
    }
    throw error;
  }
}

function getReportSeverity(report) {
  const s = Number(report?.severity);
  return Number.isFinite(s) && s >= 1 && s <= 5 ? s : null;
}

function getReportCategory(report) {
  const c = report?.category;
  return TRIAGE_CATEGORIES.includes(c) ? c : null;
}

function renderTriageChips(report) {
  const category = getReportCategory(report);
  const severity = getReportSeverity(report);
  if (!category && !severity) return "";
  const catChip = category
    ? `<span class="triage-chip category cat-${escapeHtml(category)}" title="${escapeHtml(report.triage_reason || "")}">${escapeHtml(TRIAGE_CATEGORY_LABEL[category] || category)}</span>`
    : "";
  const sevChip = severity
    ? `<span class="triage-chip severity sev-${severity}" title="${escapeHtml(report.triage_reason || "")}">S${severity} · ${escapeHtml(TRIAGE_SEVERITY_LABEL[severity])}</span>`
    : "";
  return `<div class="triage-chips">${catChip}${sevChip}</div>`;
}

function cosineSim(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

function computeSimilarReports(target, allReports, threshold = 0.82, limit = 5) {
  if (!target?.embedding || !Array.isArray(allReports)) return [];
  return allReports
    .filter((r) => r && String(r.id) !== String(target.id) && Array.isArray(r.embedding))
    .map((r) => ({ report: r, similarity: cosineSim(target.embedding, r.embedding) }))
    .filter((m) => m.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

function renderSimilarReportsBadge(matches) {
  if (!matches.length) return "";
  const sameCount = matches.filter((m) => m.similarity >= SAME_REPORT_THRESHOLD).length;
  const top = Math.round(matches[0].similarity * 100);
  if (sameCount > 0) {
    return `<button type="button" class="similar-badge same-badge" data-similar-count="${matches.length}" title="${sameCount} identical report${sameCount>1?"s":""} (top match ${top}%)" style="background:rgba(220,38,38,0.12);border-color:rgba(220,38,38,0.4);color:#dc2626;">🔁 Same as ${sameCount}</button>`;
  }
  return `<button type="button" class="similar-badge" data-similar-count="${matches.length}" title="${matches.length} similar report${matches.length>1?"s":""} (top match ${top}%)">🔗 ${matches.length} similar</button>`;
}

function renderSimilarReportsPanel(matches) {
  if (!matches.length) return "";
  const items = matches.map(({ report: m, similarity }) => {
    const pct = Math.round(similarity * 100);
    const isSame = similarity >= SAME_REPORT_THRESHOLD;
    const status = m.processing_status || "pending";
    const matchLabel = isSame
      ? `<span class="similar-similarity" style="background:#dc2626;color:#fff;font-weight:800;letter-spacing:0.06em;">SAME REPORT</span>`
      : `<span class="similar-similarity">${pct}% match</span>`;
    const itemStyle = isSame ? "border:2px solid #dc2626;background:#fef2f2;" : "";
    return `
      <li class="similar-item" style="${itemStyle}">
        <div class="similar-item-bar" style="--match: ${pct}%${isSame ? ";background:#dc2626;" : ""}"></div>
        <div class="similar-item-main">
          <div class="similar-item-title">${escapeHtml(m.title || "Untitled")}</div>
          <div class="similar-item-foot">
            ${matchLabel}
            <span class="similar-date">${escapeHtml(formatDate(getReportCreatedAt(m)))}</span>
            <span class="similar-status ${escapeHtml(status)}">${escapeHtml(status)}</span>
          </div>
        </div>
      </li>
    `;
  }).join("");
  return `
    <section class="admin-section similar-reports-section" hidden>
      <h3>🔗 Similar reports detected</h3>
      <p class="similar-reports-sub">Reports from the last 30 days that look like this one (cosine similarity ≥ 82%). Useful for spotting repeat incidents or duplicate submissions.</p>
      <ul class="similar-list">${items}</ul>
    </section>
  `;
}

async function buildAdminReportCard(report, allReports = []) {
  const card = document.createElement("article");
  card.className = "admin-report-card";
  card.dataset.reportId = String(report.id);
  const rawInput = report.content || report.file_name || "No raw input captured yet.";
  const usableExtracted = getUsableExtractedText(report);
  const extractedTextIsNoise = !!report.extracted_text && !usableExtracted;
  const extractedText = usableExtracted
    || report.content
    || (extractedTextIsNoise
      ? "No output detected — the extracted text appears to be noise (no readable content found in the file)."
      : "Pending UiPath extraction.");

  const profile = await fetchUserProfile(report.user_id);
  const userEmail = profile?.email || "Unknown";
  const userName = profile?.full_name || "Unknown";

  const hasContent = report.title || report.description || report.explanation || usableExtracted;
  const needsGeneration = !report.detailed_summary || !parseSummaryJson(report.detailed_summary) || (usableExtracted && report.processing_status !== "processed");
  const similarMatches = computeSimilarReports(report, allReports);

  card.innerHTML = `
    <button class="admin-card-toggle" type="button" aria-expanded="false">
      <div class="admin-card-toggle-left">
        <div>
          <p class="eyebrow">Submitted ${escapeHtml(formatDate(getReportCreatedAt(report)))}</p>
          <h2>${escapeHtml(report.title || "Untitled report")}</h2>
        </div>
        <div class="admin-card-toggle-meta">
          <span>${escapeHtml(getSourceLabel(report.source_type || report.sourceType))}</span>
          <span class="admin-toggle-user">${escapeHtml(userName)} &bull; ${escapeHtml(userEmail)}</span>
        </div>
      </div>
      <div class="admin-card-toggle-right">
        <div class="admin-triage-slot">${renderTriageChips(report)}${renderSimilarReportsBadge(similarMatches)}</div>
        <div class="admin-status-chip ${escapeHtml(getProcessingStatus(report))}">${escapeHtml(getProcessingStatus(report))}</div>
        <span class="admin-card-chevron">&#8964;</span>
      </div>
    </button>
    <div class="admin-card-body" hidden>
      <div class="admin-meta-row">
        <span>${escapeHtml(getSourceLabel(report.source_type || report.sourceType))}</span>
        <span>${escapeHtml(report.file_name || "No filename")}</span>
        <span>${escapeHtml(report.mime_type || "No MIME type")}</span>
      </div>
      <div class="admin-user-row">
        <span class="admin-user-label">Name:</span>
        <span class="admin-user-value">${escapeHtml(userName)}</span>
        <span class="admin-user-label">Email:</span>
        <span class="admin-user-value">${escapeHtml(userEmail)}</span>
      </div>
      <div class="admin-sections">
        <section class="admin-section">
          <h3>User Explanation</h3>
          <p>${escapeHtml(report.explanation || report.description || "No explanation provided.")}</p>
        </section>
        <section class="admin-section">
          <h3>Raw Input</h3>
          <pre class="extracted-text-preview">${escapeHtml(rawInput)}</pre>
          ${rawInput.length > 300 ? `<button class="read-more-btn" type="button">Read more</button>` : ""}
        </section>
        <section class="admin-section">
          <div class="summary-section-head">
            <h3>Extracted Text</h3>
            <button class="download-extracted-btn" type="button">Download PDF</button>
          </div>
          <pre class="extracted-text-preview">${escapeHtml(extractedText)}</pre>
          ${extractedText.length > 300 ? `<button class="read-more-btn" type="button">Read more</button>` : ""}
        </section>
        ${renderSimilarReportsPanel(similarMatches)}
        <section class="admin-section admin-section-summary">
          <div class="summary-section-head">
            <h3>AI Analysis</h3>
            <div class="summary-actions">
              <button class="regenerate-article-btn" type="button">Regenerate</button>
              <button class="download-pdf-btn" type="button">Download PDF</button>
            </div>
          </div>
          <div class="summary-body">
            ${renderSummaryBody(needsGeneration && hasContent ? null : report.detailed_summary, needsGeneration && hasContent)}
          </div>
        </section>
        <section class="admin-section report-chat-section" data-chat-enabled="${hasContent ? "true" : "false"}">
          <div class="summary-section-head">
            <h3>Ask about this report</h3>
            <button class="chat-clear-btn" type="button" title="Clear conversation">Clear</button>
          </div>
          <div class="chat-messages" role="log" aria-live="polite">
            <div class="chat-empty">
              <span class="chat-empty-icon" aria-hidden="true">&#128172;</span>
              <p>Ask anything about this report — names, dates, deadlines, or a specific phrase.</p>
              <div class="chat-suggestions">
                <button type="button" class="chat-suggestion">Summarize this in one line</button>
                <button type="button" class="chat-suggestion">What deadlines are mentioned?</button>
                <button type="button" class="chat-suggestion">Who is involved?</button>
              </div>
            </div>
          </div>
          <form class="chat-input-row" autocomplete="off">
            <textarea class="chat-input" placeholder="Ask a question about this report..." rows="1" ${hasContent ? "" : "disabled"}></textarea>
            <button class="chat-send-btn primary-button" type="submit" ${hasContent ? "" : "disabled"} aria-label="Send">
              <span class="chat-send-label">Send</span>
            </button>
          </form>
          ${hasContent ? "" : `<p class="chat-disabled-note">Chat activates once the report has extracted content.</p>`}
        </section>
      </div>
      <div class="admin-response-section">
        <div class="admin-response-existing ${report.admin_response ? "" : "hidden"}">
          <h3 class="admin-response-existing-title">Admin Response</h3>
          <p class="admin-response-text">${escapeHtml(report.admin_response || "")}</p>
        </div>
        <button class="respond-btn secondary-button" type="button">Respond to User</button>
        <div class="respond-form hidden">
          <textarea class="respond-textarea" placeholder="Write your response to the user..."></textarea>
          <div class="respond-form-actions">
            <button class="respond-submit-btn primary-button" type="button">Send Response</button>
            <button class="respond-cancel-btn secondary-button" type="button">Cancel</button>
          </div>
          <p class="respond-status"></p>
        </div>
        <div class="admin-status-actions">
          <span style="font-size:0.83rem;font-weight:700;color:var(--muted);align-self:center">Set status:</span>
          <button class="status-action-btn review" type="button" data-set-status="under_review">Under Review</button>
          <button class="status-action-btn resolve" type="button" data-set-status="resolved">Resolved</button>
          <button class="status-action-btn reopen" type="button" data-set-status="pending">Reopen</button>
        </div>
      </div>
    </div>
  `;

  const toggleBtn = card.querySelector(".admin-card-toggle");
  const cardBody = card.querySelector(".admin-card-body");
  const chevron = card.querySelector(".admin-card-chevron");
  const similarSection = card.querySelector(".similar-reports-section");
  const openCard = () => {
    cardBody.removeAttribute("hidden");
    toggleBtn.setAttribute("aria-expanded", "true");
    chevron.style.transform = "rotate(180deg)";
  };
  toggleBtn?.addEventListener("click", (e) => {
    const inner = e.target.closest("button");
    if (inner && inner.classList.contains("similar-badge")) {
      e.preventDefault();
      e.stopPropagation();
      openCard();
      if (similarSection) {
        similarSection.removeAttribute("hidden");
        similarSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    if (inner !== toggleBtn) return;
    const open = cardBody.hasAttribute("hidden");
    if (open) {
      openCard();
    } else {
      cardBody.setAttribute("hidden", "");
      toggleBtn.setAttribute("aria-expanded", "false");
      chevron.style.transform = "";
    }
  });

  const chatSection = card.querySelector(".report-chat-section");
  if (chatSection && chatSection.dataset.chatEnabled === "true") {
    const chatMessages = chatSection.querySelector(".chat-messages");
    const chatForm = chatSection.querySelector(".chat-input-row");
    const chatInput = chatSection.querySelector(".chat-input");
    const chatSendBtn = chatSection.querySelector(".chat-send-btn");
    const chatClearBtn = chatSection.querySelector(".chat-clear-btn");
    const chatHistory = [];

    const renderEmptyState = () => {
      chatMessages.innerHTML = `
        <div class="chat-empty">
          <span class="chat-empty-icon" aria-hidden="true">&#128172;</span>
          <p>Ask anything about this report — names, dates, deadlines, or a specific phrase.</p>
          <div class="chat-suggestions">
            <button type="button" class="chat-suggestion">Summarize this in one line</button>
            <button type="button" class="chat-suggestion">What deadlines are mentioned?</button>
            <button type="button" class="chat-suggestion">Who is involved?</button>
          </div>
        </div>`;
    };

    const appendBubble = (role, text) => {
      const empty = chatMessages.querySelector(".chat-empty");
      if (empty) empty.remove();
      const bubble = document.createElement("div");
      bubble.className = `chat-bubble chat-bubble-${role}`;
      bubble.textContent = text;
      chatMessages.appendChild(bubble);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return bubble;
    };

    const askQuestion = async (question) => {
      if (!question) return;
      chatInput.value = "";
      chatInput.style.height = "auto";
      appendBubble("user", question);
      chatInput.disabled = true;
      chatSendBtn.disabled = true;
      const pending = appendBubble("ai", "Thinking...");
      pending.classList.add("chat-bubble-pending");
      try {
        const answer = await sendChatMessage(report, question, chatHistory);
        pending.classList.remove("chat-bubble-pending");
        pending.textContent = answer;
        chatHistory.push({ role: "user", text: question });
        chatHistory.push({ role: "assistant", text: answer });
        while (chatHistory.length > 12) chatHistory.shift();
      } catch (err) {
        console.error("[Report Chat] Error:", err);
        pending.classList.remove("chat-bubble-pending");
        pending.classList.add("chat-bubble-error");
        pending.textContent = `Couldn't answer: ${err.message || "unknown error"}`;
      } finally {
        chatInput.disabled = false;
        chatSendBtn.disabled = false;
        chatInput.focus();
      }
    };

    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      askQuestion(chatInput.value.trim());
    });

    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        chatForm.requestSubmit();
      }
    });

    chatInput.addEventListener("input", () => {
      chatInput.style.height = "auto";
      chatInput.style.height = Math.min(chatInput.scrollHeight, 140) + "px";
    });

    chatMessages.addEventListener("click", (e) => {
      const suggestion = e.target.closest(".chat-suggestion");
      if (suggestion) askQuestion(suggestion.textContent.trim());
    });

    chatClearBtn.addEventListener("click", () => {
      chatHistory.length = 0;
      renderEmptyState();
      chatInput.focus();
    });
  }

  if (needsGeneration && hasContent) {
    const summaryBody = card.querySelector(".summary-body");
    try {
      const summary = await generateGeminiSummary(report);
      const final = summary || generateLocalSummary(report);
      if (final) {
        await saveSummaryToDb(report.id, final);
        summaryBody.innerHTML = renderSummaryBody(final);
      }
    } catch (error) {
      console.error("[AI Analysis] Gemini call failed — falling back to local summary. Reason:", error);
      const local = generateLocalSummary(report);
      const errNote = `<p class="summary-error" style="color:#b54708;font-size:0.85rem;margin:0 0 8px">AI generation failed (${escapeHtml(error.message || "unknown error")}) — showing a basic local summary instead.</p>`;
      if (local) {
        await saveSummaryToDb(report.id, local);
        summaryBody.innerHTML = errNote + renderSummaryBody(local);
      } else {
        summaryBody.innerHTML = errNote + `<p class="summary-error">Not enough content to generate analysis.</p>`;
      }
    }
  }

  if (hasContent && !report.triaged_at) {
    const slot = card.querySelector(".admin-triage-slot");
    if (slot) slot.innerHTML = `<span class="triage-chip triage-loading">Queued…</span>`;
    enqueueTriage(report)
      .then(async (triage) => {
        if (!triage) {
          if (slot) slot.innerHTML = `<span class="triage-chip triage-error" title="AI returned no triage data">No triage</span>`;
          return;
        }
        try {
          await saveTriageToDb(report.id, triage);
        } catch (saveErr) {
          if (slot) slot.innerHTML = `<span class="triage-chip triage-error" title="${escapeHtml(saveErr.message || "save failed")}">Save failed</span>`;
          return;
        }
        report.category = triage.category;
        report.severity = triage.severity;
        report.triage_reason = triage.reason;
        report.triaged_at = new Date().toISOString();
        if (slot) slot.innerHTML = renderTriageChips(report);
        card.dataset.category = triage.category;
        card.dataset.severity = String(triage.severity);
        document.dispatchEvent(new CustomEvent("rf:triage-updated"));
      })
      .catch((err) => {
        console.error("[Triage] generation failed:", err);
        if (slot) slot.innerHTML = `<span class="triage-chip triage-error" title="${escapeHtml(err.message || "AI call failed")}">Triage failed</span>`;
      });
  } else if (report.category) {
    card.dataset.category = report.category;
  }
  if (report.severity) card.dataset.severity = String(report.severity);

  return card;
}

function renderAdminStats(reports) {
  const statsRow = document.querySelector("#admin-stats-row");
  if (!statsRow) return;
  statsRow.classList.remove("hidden");
  const total = reports.length;
  const pending = reports.filter((r) => ["pending", "extracted"].includes(getProcessingStatus(r))).length;
  const processed = reports.filter((r) => getProcessingStatus(r) === "processed").length;
  const resolved = reports.filter((r) => getProcessingStatus(r) === "resolved").length;
  const critical = reports.filter((r) => {
    const s = getReportSeverity(r);
    return s !== null && s >= 4 && getProcessingStatus(r) !== "resolved";
  }).length;
  document.querySelector("#stat-total").textContent = total;
  document.querySelector("#stat-pending").textContent = pending;
  document.querySelector("#stat-processed").textContent = processed;
  document.querySelector("#stat-resolved").textContent = resolved;
  const critEl = document.querySelector("#stat-critical");
  if (critEl) critEl.textContent = critical;
}

function applyAdminFilters(allCards, reports) {
  const search = document.querySelector("#admin-search");
  const statusFilter = document.querySelector("#admin-status-filter");
  const categoryFilter = document.querySelector("#admin-category-filter");
  const severityFilter = document.querySelector("#admin-severity-filter");
  if (!search && !statusFilter && !categoryFilter && !severityFilter) return;

  function doFilter() {
    const q = (search?.value || "").toLowerCase().trim();
    const status = statusFilter?.value || "";
    const category = categoryFilter?.value || "";
    const severity = severityFilter?.value || "";
    allCards.forEach((card) => {
      const reportId = card.dataset.reportId;
      const report = reports.find((r) => String(r.id) === reportId);
      if (!report) return;
      const matchesStatus = !status || getProcessingStatus(report) === status;
      const matchesCategory = !category || getReportCategory(report) === category;
      const matchesSeverity = !severity || String(getReportSeverity(report)) === severity;
      const reportText = [report.title, report.description, report.explanation].join(" ").toLowerCase();
      const cardUserText = card.querySelector(".admin-user-row")?.textContent?.toLowerCase() || "";
      const matchesQ = !q || reportText.includes(q) || cardUserText.includes(q);
      card.style.display = matchesStatus && matchesCategory && matchesSeverity && matchesQ ? "" : "none";
    });
  }

  search?.addEventListener("input", doFilter);
  statusFilter?.addEventListener("change", doFilter);
  categoryFilter?.addEventListener("change", doFilter);
  severityFilter?.addEventListener("change", doFilter);
  document.addEventListener("rf:triage-updated", () => {
    renderAdminStats(reports);
    doFilter();
  });
}

async function initAdminPage() {
  const adminGrid = document.querySelector("#admin-reports");
  const adminEmpty = document.querySelector("#admin-empty-state");
  if (!adminGrid || !adminEmpty) {
    return;
  }

  const secWarn = document.querySelector("#admin-security-warning");
  if (secWarn && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    secWarn.classList.remove("hidden");
    secWarn.querySelector(".security-warning-dismiss")?.addEventListener("click", () => secWarn.classList.add("hidden"));
  }

  try {
    ensureSupabaseConfigured();
    const reports = await fetchReports({ includeAll: true });
    adminGrid.innerHTML = "";

    renderAdminStats(reports);

    if (!reports.length) {
      adminEmpty.classList.remove("hidden");
      adminGrid.classList.add("hidden");
      return;
    }

    adminEmpty.classList.add("hidden");
    adminGrid.classList.remove("hidden");
    const cards = [];
    for (const report of reports) {
      const card = await buildAdminReportCard(report, reports);
      adminGrid.appendChild(card);
      cards.push(card);
    }

    applyAdminFilters(cards, reports);

    document.querySelector("#regenerate-all-btn")?.addEventListener("click", async () => {
      const btn = document.querySelector("#regenerate-all-btn");
      if (!btn) return;
      btn.disabled = true;
      btn.textContent = "Clearing...";
      try {
        ensureSupabaseConfigured();
        await supabaseClient.from("reports").update({ detailed_summary: null }).neq("id", 0);
        btn.textContent = "Reloading...";
        window.location.reload();
      } catch (err) {
        btn.textContent = "Regenerate All";
        btn.disabled = false;
        alert("Failed: " + err.message);
      }
    });

    document.querySelector("#backfill-embeddings-btn")?.addEventListener("click", async () => {
      const btn = document.querySelector("#backfill-embeddings-btn");
      if (!btn) return;
      const originalLabel = btn.textContent;
      btn.disabled = true;

      try {
        if (!BACKEND_URL) throw new Error("BACKEND_URL not configured");
        const { data: sessionData } = await supabaseClient.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (!token) throw new Error("Please sign in.");

        let totalProcessed = 0;
        let totalSkipped = 0;
        let totalFailed = 0;
        let lastFailures = [];

        for (let pass = 0; pass < 20; pass++) {
          btn.textContent = `Embedding… (${totalProcessed} done)`;
          const response = await fetch(`${BACKEND_URL}/admin/backfill-embeddings`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          });
          if (!response.ok) {
            const err = await response.text();
            throw new Error(`Backfill failed (${response.status}): ${err.slice(0, 200)}`);
          }
          const result = await response.json();
          totalProcessed += result.processed || 0;
          totalSkipped += result.skipped || 0;
          totalFailed += result.failed || 0;
          if (Array.isArray(result.failures) && result.failures.length) lastFailures = result.failures;
          console.log("[backfill] batch result:", result);
          if ((result.remaining ?? 0) === 0 || (result.processed === 0 && result.skipped === 0)) break;
        }

        btn.textContent = totalProcessed > 0 ? `Done — ${totalProcessed} embedded` : "Failed — see alert";
        const failureDetails = lastFailures.length
          ? `\n\nFirst failure reason:\n${lastFailures[0].error}`
          : "";
        alert(`Backfill result:\n• ${totalProcessed} reports embedded\n• ${totalSkipped} skipped (empty content)\n• ${totalFailed} failed${failureDetails}${totalProcessed > 0 ? "\n\nReloading…" : ""}`);
        if (totalProcessed > 0) window.location.reload();
      } catch (err) {
        btn.textContent = originalLabel;
        btn.disabled = false;
        alert("Backfill failed: " + err.message);
      }
    });

    adminGrid.addEventListener("click", async (event) => {
      const respondBtn = event.target.closest(".respond-btn");
      if (respondBtn) {
        const section = respondBtn.closest(".admin-response-section");
        respondBtn.classList.add("hidden");
        section.querySelector(".respond-form").classList.remove("hidden");
        section.querySelector(".respond-textarea").focus();
        return;
      }

      const cancelBtn = event.target.closest(".respond-cancel-btn");
      if (cancelBtn) {
        const section = cancelBtn.closest(".admin-response-section");
        section.querySelector(".respond-form").classList.add("hidden");
        section.querySelector(".respond-btn").classList.remove("hidden");
        return;
      }

      const submitBtn = event.target.closest(".respond-submit-btn");
      if (submitBtn) {
        const card = submitBtn.closest(".admin-report-card");
        const reportId = card.dataset.reportId;
        const section = submitBtn.closest(".admin-response-section");
        const textarea = section.querySelector(".respond-textarea");
        const statusEl = section.querySelector(".respond-status");
        const text = textarea.value.trim();
        if (!text) {
          statusEl.textContent = "Please write a response before submitting.";
          return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
        statusEl.textContent = "";
        try {
          ensureSupabaseConfigured();
          await supabaseClient.from("reports").update({ admin_response: text }).eq("id", reportId);
          const existing = section.querySelector(".admin-response-existing");
          existing.querySelector(".admin-response-text").textContent = text;
          existing.classList.remove("hidden");
          section.querySelector(".respond-form").classList.add("hidden");
          section.querySelector(".respond-btn").classList.remove("hidden");
          textarea.value = "";
        } catch (err) {
          statusEl.textContent = err.message || "Failed to send response.";
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send Response";
        }
        return;
      }

      const readBtn = event.target.closest(".read-more-btn");
      if (readBtn) {
        const pre = readBtn.previousElementSibling;
        const expanded = pre.classList.toggle("expanded");
        readBtn.textContent = expanded ? "Read less" : "Read more";
        return;
      }

      const generateReportBtn = event.target.closest(".generate-report-btn");
      if (generateReportBtn) {
        const card = generateReportBtn.closest(".admin-report-card");
        const title = card.querySelector("h2")?.textContent || "Untitled Report";
        const date = card.querySelector(".eyebrow")?.textContent || "";
        const userName = card.querySelector(".admin-user-row .admin-user-value")?.textContent || "";
        const userEmail = card.querySelectorAll(".admin-user-row .admin-user-value")[1]?.textContent || "";
        const userExplanation = card.querySelector(".admin-section p")?.textContent || "";
        const rawInput = card.querySelector(".admin-section pre")?.textContent || "";
        const extractedText = card.querySelector(".extracted-text-preview")?.textContent || "";
        const article = card.querySelector(".summary-body pre")?.textContent || "";

        const win = window.open("", "_blank");
        win.document.write(`
          <!DOCTYPE html><html><head><meta charset="UTF-8">
          <title>Report - ${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 48px; color: #1a1a2e; max-width: 800px; margin: auto; }
            h1 { font-size: 2rem; margin-bottom: 6px; }
            .meta { color: #555; font-size: 0.9rem; margin-bottom: 32px; border-bottom: 1px solid #ddd; padding-bottom: 12px; }
            h2 { font-size: 1.1rem; color: #0f5483; margin-top: 28px; margin-bottom: 8px; border-left: 4px solid #0f5483; padding-left: 10px; }
            p, pre { font-size: 0.95rem; line-height: 1.7; background: #f4f8fc; padding: 14px; border-radius: 6px; white-space: pre-wrap; word-break: break-word; }
            .article-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; border-radius: 6px; white-space: pre-wrap; word-break: break-word; line-height: 1.7; }
            @media print { body { padding: 20px; } }
          </style></head><body>
          <h1>${title}</h1>
          <div class="meta">
            <strong>${date}</strong> &nbsp;|&nbsp;
            <strong>Name:</strong> ${userName} &nbsp;|&nbsp;
            <strong>Email:</strong> ${userEmail}
          </div>
          <h2>User Explanation</h2>
          <p>${userExplanation}</p>
          <h2>Raw Input</h2>
          <pre>${rawInput}</pre>
          <h2>Extracted Text</h2>
          <pre>${extractedText}</pre>
          <h2>AI Generated Article</h2>
          <div class="article-box">${article}</div>
          <script>window.onload=()=>{window.print();}<\/script>
          </body></html>
        `);
        win.document.close();
        return;
      }

      const extractedPdfBtn = event.target.closest(".download-extracted-btn");
      if (extractedPdfBtn) {
        const card = extractedPdfBtn.closest(".admin-report-card");
        const title = card.querySelector("h2")?.textContent || "report";
        const extractedText = card.querySelector(".extracted-text-preview")?.textContent || "No extracted text.";
        const userName = card.querySelector(".admin-user-row .admin-user-value")?.textContent || "";
        const userEmail = card.querySelectorAll(".admin-user-row .admin-user-value")[1]?.textContent || "";
        const date = card.querySelector(".eyebrow")?.textContent || "";

        const win = window.open("", "_blank");
        win.document.write(`
          <!DOCTYPE html><html><head><meta charset="UTF-8">
          <title>Extracted Text - ${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a2e; max-width: 700px; margin: auto; }
            h1 { font-size: 1.6rem; margin-bottom: 4px; }
            .meta { color: #555; font-size: 0.9rem; margin-bottom: 24px; }
            h2 { font-size: 1rem; margin-bottom: 6px; color: #0f5483; }
            pre { background: #f4f8fc; padding: 14px; border-radius: 6px; white-space: pre-wrap; word-break: break-word; }
          </style></head><body>
          <h1>${title}</h1>
          <p class="meta">${date} &nbsp;|&nbsp; ${userName} &nbsp;|&nbsp; ${userEmail}</p>
          <h2>Extracted Text</h2>
          <pre>${extractedText}</pre>
          <script>window.onload=()=>{window.print();}<\/script>
          </body></html>
        `);
        win.document.close();
        return;
      }

      const statusBtn = event.target.closest("[data-set-status]");
      if (statusBtn) {
        const card = statusBtn.closest(".admin-report-card");
        const reportId = card?.dataset.reportId;
        const newStatus = statusBtn.dataset.setStatus;
        if (!reportId || !newStatus) return;
        statusBtn.disabled = true;
        try {
          ensureSupabaseConfigured();
          await supabaseClient.from("reports").update({ processing_status: newStatus }).eq("id", reportId);
          const chip = card.querySelector(".admin-status-chip");
          if (chip) {
            chip.className = `admin-status-chip ${newStatus}`;
            chip.textContent = newStatus.replace("_", " ");
          }
          renderAdminStats(reports.map((r) => String(r.id) === reportId ? { ...r, processing_status: newStatus } : r));
        } catch (err) {
          alert("Failed to update status: " + err.message);
        } finally {
          statusBtn.disabled = false;
        }
        return;
      }

      const regenBtn = event.target.closest(".regenerate-article-btn");
      if (regenBtn) {
        const summaryBody = regenBtn.closest(".admin-section").querySelector(".summary-body");
        const reportId = regenBtn.closest(".admin-report-card").dataset.reportId;
        const report = reports.find((r) => String(r.id) === reportId);
        if (!report) return;
        regenBtn.disabled = true;
        regenBtn.textContent = "Generating...";
        summaryBody.innerHTML = `<p class="summary-loading">Generating AI analysis...</p>`;
        let geminiError = null;
        try {
          let article = null;
          try {
            article = await generateGeminiSummary(report);
          } catch (gErr) {
            geminiError = gErr;
            console.error("[AI Analysis] Regenerate: Gemini call failed:", gErr);
          }
          if (!article) {
            article = generateLocalSummary(report);
          }
          if (article) {
            await saveSummaryToDb(report.id, article);
            report.detailed_summary = article;
            const errNote = geminiError
              ? `<p class="summary-error" style="color:#b54708;font-size:0.85rem;margin:0 0 8px">AI generation failed (${escapeHtml(geminiError.message || "unknown error")}) — showing a basic local summary instead.</p>`
              : "";
            summaryBody.innerHTML = errNote + renderSummaryBody(article);
          }
        } catch (err) {
          summaryBody.innerHTML = `<p class="summary-error">${escapeHtml(err.message)}</p>`;
        }
        regenBtn.disabled = false;
        regenBtn.textContent = "Regenerate";
        return;
      }

      const pdfBtn = event.target.closest(".download-pdf-btn");
      if (pdfBtn) {
        const card = pdfBtn.closest(".admin-report-card");
        const reportId = card.dataset.reportId;
        const report = reports.find((r) => String(r.id) === reportId);
        const title = card.querySelector("h2")?.textContent || "report";
        const userName = card.querySelector(".admin-user-row .admin-user-value")?.textContent || "";
        const userEmail = card.querySelectorAll(".admin-user-row .admin-user-value")[1]?.textContent || "";
        const date = card.querySelector(".eyebrow")?.textContent || "";
        const parsed = report ? parseSummaryJson(report.detailed_summary) : null;

        const sectionHtml = parsed
          ? `<h2>Article Title</h2><p>${escapeHtml(cleanSummaryText(parsed.title))}</p>
             <h2>Summary — Simple Steps</h2><pre>${escapeHtml(cleanSummaryText(parsed.summary_steps))}</pre>
             <h2>Key Points</h2><pre>${escapeHtml(cleanSummaryText(parsed.key_points))}</pre>
             <h2>SOP — Clean Procedure</h2><pre>${escapeHtml(cleanSummaryText(parsed.sop))}</pre>`
          : `<h2>AI Analysis</h2><pre>${escapeHtml(card.querySelector(".summary-body pre")?.textContent || "No analysis available.")}</pre>`;

        const win = window.open("", "_blank");
        win.document.write(`
          <!DOCTYPE html><html><head><meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a2e; max-width: 700px; margin: auto; }
            h1 { font-size: 1.6rem; margin-bottom: 4px; }
            .meta { color: #555; font-size: 0.9rem; margin-bottom: 24px; }
            h2 { font-size: 1rem; margin-bottom: 6px; color: #0f5483; border-left: 3px solid #0f5483; padding-left: 8px; margin-top: 24px; }
            p, pre { background: #f4f8fc; padding: 14px; border-radius: 6px; white-space: pre-wrap; word-break: break-word; margin: 0; }
          </style></head><body>
          <h1>${title}</h1>
          <p class="meta">${date} &nbsp;|&nbsp; ${userName} &nbsp;|&nbsp; ${userEmail}</p>
          ${sectionHtml}
          <script>window.onload=()=>{window.print();}<\/script>
          </body></html>
        `);
        win.document.close();
        return;
      }
    });
  } catch (error) {
    console.error("Failed to load admin reports:", error);
    adminEmpty.classList.remove("hidden");
    adminGrid.classList.add("hidden");
    const title = adminEmpty.querySelector("h2");
    const copy = adminEmpty.querySelector("p");
    if (title) {
      title.textContent = "Admin reports could not be loaded";
    }
    if (copy) {
      copy.textContent = error.message || "Check your Supabase connection and table columns.";
    }
  }
}

async function deleteReport(reportId) {
  ensureSupabaseConfigured();

  const { data: report, error: fetchError } = await supabaseClient
    .from("reports")
    .select("id, file_url")
    .eq("id", reportId)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (report?.file_url) {
    try {
      const filePath = new URL(report.file_url).pathname.split(`/${SUPABASE_REPORTS_BUCKET}/`)[1];
      if (filePath) {
        await supabaseClient.storage.from(SUPABASE_REPORTS_BUCKET).remove([decodeURIComponent(filePath)]);
      }
    } catch (error) {
      console.warn("Failed to remove storage file:", error);
    }
  }

  const { error } = await supabaseClient.from("reports").delete().eq("id", reportId);
  if (error) {
    throw error;
  }
}

async function fetchJson(url, accessToken) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

function showSelectionError(type, message) {
  const target = document.querySelector(type === "drive" ? "#drive-selection" : "#email-selection");
  if (!target) {
    return;
  }

  target.classList.remove("empty");
  target.classList.add("error");
  target.textContent = message;
}

function clearSelectionError(type) {
  const target = document.querySelector(type === "drive" ? "#drive-selection" : "#email-selection");
  if (!target) {
    return;
  }

  target.classList.remove("error");
}

function setActiveSourcePanel(sourceType) {
  const options = document.querySelectorAll(".source-option");
  const panels = document.querySelectorAll(".source-panel");

  if (!options.length) {
    return;
  }

  options.forEach((item) => item.classList.remove("active"));
  panels.forEach((panel) => panel.classList.add("hidden"));

  const activeButton = document.querySelector(`.source-option[data-source-target="${sourceType}-panel"]`);
  const activePanel = document.querySelector(`#${sourceType}-panel`);

  activeButton?.classList.add("active");
  activePanel?.classList.remove("hidden");
  saveStoredActiveSource(sourceType);
}

function getGoogleToken(scope, type, options = {}) {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error("Google Identity Services failed to load."));
      return;
    }

    const combinedScope = `${GOOGLE_IDENTITY_SCOPES} ${scope}`.trim();
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: combinedScope,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }

        googleTokens[type] = response.access_token;
        resolve(response.access_token);
      }
    });

    const prompt = typeof options.prompt === "string" ? options.prompt : "consent select_account";
    tokenClient.requestAccessToken({ prompt });
  });
}

async function getGoogleProfile(accessToken) {
  return fetchJson("https://www.googleapis.com/oauth2/v3/userinfo", accessToken);
}

async function listDriveFiles(accessToken) {
  const data = await fetchJson(
    "https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,modifiedTime)&orderBy=modifiedTime desc&q=trashed=false",
    accessToken
  );

  return data.files || [];
}

function loadGooglePicker() {
  return new Promise((resolve, reject) => {
    if (!window.gapi?.load) {
      reject(new Error("Google API library (gapi) failed to load."));
      return;
    }

    window.gapi.load("picker", { callback: resolve, onerror: () => reject(new Error("Failed to load Google Picker.")) });
  });
}

async function openDrivePicker(accessToken) {
  if (!GOOGLE_API_KEY) {
    throw new Error("Missing GOOGLE_API_KEY. Set it in config.local.js (gitignored) to use the native Drive picker UI.");
  }

  await loadGooglePicker();

  if (!window.google?.picker) {
    throw new Error("Google Picker failed to initialize.");
  }

  return new Promise((resolve, reject) => {
    const picker = window.google.picker;

    const allFilesView = new picker.DocsView(picker.ViewId.DOCS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);

    const pdfView = new picker.DocsView(picker.ViewId.PDFS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);

    const documentsView = new picker.DocsView(picker.ViewId.DOCUMENTS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);

    const spreadsheetsView = new picker.DocsView(picker.ViewId.SPREADSHEETS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);

    const imagesView = new picker.DocsView(picker.ViewId.DOCS_IMAGES)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);

    const sharedWithMeView = new picker.DocsView(picker.ViewId.DOCS)
      .setOwnedByMe(false)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);

    const recentView = new picker.View(picker.ViewId.RECENTLY_PICKED);

    const folderNavView = new picker.DocsView(picker.ViewId.FOLDERS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);

    const pickerInstance = new picker.PickerBuilder()
      .setDeveloperKey(GOOGLE_API_KEY)
      .setOAuthToken(accessToken)
      .setAppId(GOOGLE_APP_ID || undefined)
      .addView(allFilesView)
      .addView(pdfView)
      .addView(documentsView)
      .addView(spreadsheetsView)
      .addView(imagesView)
      .addView(folderNavView)
      .addView(sharedWithMeView)
      .addView(recentView)
      .setCallback((data) => {
        if (data.action === picker.Action.CANCEL) {
          reject(new Error("Picker cancelled."));
          return;
        }

        if (data.action !== picker.Action.PICKED) {
          return;
        }

        const doc = data.docs?.[0];
        if (!doc) {
          reject(new Error("No file selected."));
          return;
        }

        resolve({
          id: doc.id,
          name: doc.name || doc.title || "Untitled file",
          meta: doc.mimeType || doc.type || "Google Drive file",
          url: doc.url
        });
      })
      .build();

    pickerInstance.setVisible(true);
  });
}

async function listGmailMessages(accessToken) {
  const page = await listGmailMessagePage({ accessToken, pageToken: "", query: "" });
  return page.items;
}

function normalizeHeaderName(name) {
  return String(name || "").toLowerCase().trim();
}

function getHeaderValue(headers, headerName) {
  const target = normalizeHeaderName(headerName);
  const match = (headers || []).find((header) => normalizeHeaderName(header.name) === target);
  return match?.value || "";
}

function extractAttachmentsFromParts(parts, attachments = []) {
  (parts || []).forEach((part) => {
    if (!part) {
      return;
    }

    if (part.filename && part.body?.attachmentId) {
      attachments.push({
        filename: part.filename,
        mimeType: part.mimeType || "",
        size: Number(part.body.size || 0)
      });
    }

    if (Array.isArray(part.parts) && part.parts.length) {
      extractAttachmentsFromParts(part.parts, attachments);
    }
  });

  return attachments;
}

async function fetchGmailMessageDetail(accessToken, messageId) {
  return fetchJson(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, accessToken);
}

function formatAttachmentSummary(attachments) {
  if (!attachments?.length) {
    return "No attachments";
  }

  const names = attachments.map((a) => a.filename).filter(Boolean);
  if (!names.length) {
    return `${attachments.length} attachment${attachments.length > 1 ? "s" : ""}`;
  }

  return `${attachments.length} attachment${attachments.length > 1 ? "s" : ""}: ${names.join(", ")}`;
}

function parseEmailListMeta(detail) {
  const headers = detail.payload?.headers || [];
  const subject = getHeaderValue(headers, "Subject") || "Untitled email";
  const from = getHeaderValue(headers, "From") || "Unknown sender";
  const date = getHeaderValue(headers, "Date") || "Unknown date";
  const to = getHeaderValue(headers, "To") || "";
  const snippet = detail.snippet || "";
  const internalDate = detail.internalDate ? Number(detail.internalDate) : 0;
  return { subject, from, date, to, snippet, internalDate };
}

function decodeBase64Url(value) {
  if (!value) {
    return "";
  }

  const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  try {
    return decodeURIComponent(
      Array.from(atob(padded))
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
  } catch (error) {
    try {
      return atob(padded);
    } catch (fallbackError) {
      return "";
    }
  }
}

function stripHtml(html) {
  if (!html) {
    return "";
  }
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findBodyPart(payload, mimeType) {
  if (!payload) {
    return null;
  }

  if (payload.mimeType === mimeType && payload.body?.data) {
    return payload;
  }

  const parts = payload.parts || [];
  for (const part of parts) {
    const found = findBodyPart(part, mimeType);
    if (found) {
      return found;
    }
  }

  return null;
}

function extractEmailBodyText(detail) {
  const payload = detail?.payload;
  if (!payload) {
    return "";
  }

  const plain = findBodyPart(payload, "text/plain");
  if (plain?.body?.data) {
    return decodeBase64Url(plain.body.data).trim();
  }

  const html = findBodyPart(payload, "text/html");
  if (html?.body?.data) {
    return stripHtml(decodeBase64Url(html.body.data));
  }

  // Fallback: sometimes body is directly on payload
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data).trim();
  }

  return "";
}

async function listGmailMessagePage({ accessToken, pageToken, query }) {
  const params = new URLSearchParams();
  params.set("maxResults", "20");
  if (pageToken) {
    params.set("pageToken", pageToken);
  }
  if (query) {
    params.set("q", query);
  }

  const data = await fetchJson(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`, accessToken);
  const messages = data.messages || [];

  const items = await Promise.all(
    messages.map(async (message) => {
      const detail = await fetchJson(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
        accessToken
      );

      const { subject, from, date, snippet, internalDate } = parseEmailListMeta(detail);

      return {
        id: message.id,
        subject,
        from,
        date,
        snippet,
        internalDate
      };
    })
  );

  return { items, nextPageToken: data.nextPageToken || "" };
}

function formatEmailListDate(item) {
  if (item?.internalDate) {
    const dt = new Date(item.internalDate);
    return dt.toLocaleString(undefined, { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  return item?.date || "";
}

function openGmailPickerModal({ accessToken, profile, onPick }) {
  const overlay = document.querySelector("#picker-modal");
  const titleNode = document.querySelector("#modal-title");
  const eyebrowNode = document.querySelector("#modal-eyebrow");
  const listNode = document.querySelector("#modal-list");
  const featuredButton = document.querySelector("#modal-featured");
  const featuredTitleNode = document.querySelector("#modal-featured-title");
  const featuredCopyNode = document.querySelector("#modal-featured-copy");

  if (!overlay || !titleNode || !eyebrowNode || !listNode || !featuredButton || !featuredTitleNode || !featuredCopyNode) {
    return;
  }

  eyebrowNode.textContent = "Gmail";
  titleNode.textContent = `Select an email from ${profile.email}`;
  featuredTitleNode.textContent = "";
  featuredCopyNode.textContent = "";
  featuredButton.classList.add("hidden");
  featuredButton.style.display = "none";

  listNode.classList.add("list");
  listNode.innerHTML = "";

  const toolbar = document.createElement("div");
  toolbar.className = "modal-toolbar";

  const filterBar = document.createElement("div");
  filterBar.className = "modal-filter-chips";

  const FILTERS = [
    { id: "all", label: "All", q: "" },
    { id: "inbox", label: "Inbox", q: "in:inbox" },
    { id: "sent", label: "Sent", q: "in:sent" },
    { id: "drafts", label: "Drafts", q: "in:drafts" },
    { id: "starred", label: "Starred", q: "is:starred" },
    { id: "important", label: "Important", q: "is:important" },
    { id: "unread", label: "Unread", q: "is:unread" },
    { id: "attachments", label: "Has attachment", q: "has:attachment" }
  ];

  const search = document.createElement("input");
  search.className = "modal-search";
  search.type = "search";
  search.placeholder = "Search Gmail (subject, from, keywords)…";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.textContent = "Prev";
  prevBtn.disabled = true;

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.textContent = "Next";
  nextBtn.disabled = true;

  toolbar.appendChild(search);

  const results = document.createElement("div");
  results.className = "email-list";

  const footer = document.createElement("div");
  footer.className = "modal-footer";

  const pager = document.createElement("div");
  pager.className = "pager";
  pager.appendChild(prevBtn);
  pager.appendChild(nextBtn);
  footer.appendChild(pager);

  // Build modal body: filter chips, toolbar (search), results, pager
  listNode.appendChild(filterBar);
  listNode.appendChild(toolbar);
  listNode.appendChild(results);
  listNode.appendChild(footer);

  const state = {
    searchText: "",
    filter: FILTERS[0],
    currentPageToken: "",
    nextPageToken: "",
    pageStack: []
  };

  const composeQuery = () => [state.filter.q, state.searchText].filter(Boolean).join(" ").trim();

  const renderRows = (items) => {
    results.innerHTML = "";

    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.className = "email-list-row";
      btn.type = "button";
      const rightDate = formatEmailListDate(item);
      const subtitle = item.snippet ? item.snippet : (item.from || "Unknown sender");
      btn.innerHTML = `
        <div class="email-icon">M</div>
        <div class="email-main">
          <div class="email-title">${item.subject}</div>
          <div class="email-subtitle">${subtitle}</div>
        </div>
        <div class="email-right">${rightDate}</div>
      `;
      btn.addEventListener("click", () => onPick(item));
      results.appendChild(btn);
    });
  };

  const loadPage = async () => {
    const page = await listGmailMessagePage({
      accessToken,
      pageToken: state.currentPageToken,
      query: composeQuery()
    });

    state.nextPageToken = page.nextPageToken;
    renderRows(page.items);
    nextBtn.disabled = !state.nextPageToken;
    prevBtn.disabled = state.pageStack.length === 0;
  };

  const renderChips = () => {
    filterBar.innerHTML = "";
    FILTERS.forEach((filter) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "filter-chip" + (state.filter.id === filter.id ? " active" : "");
      chip.textContent = filter.label;
      chip.addEventListener("click", async () => {
        if (state.filter.id === filter.id) {
          return;
        }
        state.filter = filter;
        state.currentPageToken = "";
        state.nextPageToken = "";
        state.pageStack = [];
        renderChips();
        await loadPage();
      });
      filterBar.appendChild(chip);
    });
  };

  renderChips();

  const debounce = (fn, ms) => {
    let t = null;
    return (...args) => {
      if (t) {
        window.clearTimeout(t);
      }
      t = window.setTimeout(() => fn(...args), ms);
    };
  };

  search.addEventListener(
    "input",
    debounce(async () => {
      state.searchText = search.value.trim();
      state.currentPageToken = "";
      state.nextPageToken = "";
      state.pageStack = [];
      await loadPage();
    }, 350)
  );

  nextBtn.addEventListener("click", async () => {
    if (!state.nextPageToken) {
      return;
    }
    state.pageStack.push(state.currentPageToken);
    state.currentPageToken = state.nextPageToken;
    await loadPage();
  });

  prevBtn.addEventListener("click", async () => {
    const prev = state.pageStack.pop();
    if (typeof prev !== "string") {
      return;
    }
    state.currentPageToken = prev;
    await loadPage();
  });

  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");

  // initial load
  loadPage().catch((error) => {
    console.error("Gmail picker load failed:", error);
  });
}

function getActiveSourceType() {
  const activeButton = document.querySelector(".source-option.active");
  return activeButton ? activeButton.dataset.sourceTarget.replace("-panel", "") : "manual";
}

function getReportBodyForSource(sourceType) {
  if (sourceType === "manual") {
    return document.querySelector("#report-text")?.value.trim() || "";
  }

  if (sourceType === "file") {
    const fileInput = document.querySelector("#report-file");
    const files = Array.from(fileInput?.files || []);
    return files.map((file) => file.name).join(", ");
  }

  if (sourceType === "drive") {
    if (!pickerState.driveAccount || !pickerState.driveFile) {
      return "";
    }

    return `Google Drive account: ${pickerState.driveAccount.email}\nSelected file: ${pickerState.driveFile.name}\nLocation: ${pickerState.driveFile.meta}`;
  }

  if (sourceType === "email") {
    if (!pickerState.emailAccount || !pickerState.emailMessage) {
      return "";
    }

    return [
      `Gmail account: ${pickerState.emailAccount.email}`,
      `Subject: ${pickerState.emailMessage.subject}`,
      `From: ${pickerState.emailMessage.from}`,
      `To: ${pickerState.emailMessage.to || "—"}`,
      `Date: ${pickerState.emailMessage.date}`,
      `Attachments: ${pickerState.emailMessage.attachments?.length ? pickerState.emailMessage.attachments.map((a) => a.filename).join(", ") : "None"}`,
      "",
      "Body:",
      pickerState.emailMessage.bodyText || pickerState.emailMessage.snippet || ""
    ].join("\n");
  }

  return "";
}

function openModal({ eyebrow, title, featuredTitle, featuredCopy, featuredAction, items, onSelect }) {
  const overlay = document.querySelector("#picker-modal");
  const titleNode = document.querySelector("#modal-title");
  const eyebrowNode = document.querySelector("#modal-eyebrow");
  const listNode = document.querySelector("#modal-list");
  const featuredButton = document.querySelector("#modal-featured");
  const featuredTitleNode = document.querySelector("#modal-featured-title");
  const featuredCopyNode = document.querySelector("#modal-featured-copy");

  if (!overlay || !titleNode || !eyebrowNode || !listNode || !featuredButton || !featuredTitleNode || !featuredCopyNode) {
    return;
  }

  eyebrowNode.textContent = eyebrow;
  titleNode.textContent = title;
  featuredTitleNode.textContent = featuredTitle || "Choose an item";
  featuredCopyNode.textContent = featuredCopy || "Pick an option below";
  listNode.innerHTML = "";
  featuredButton.onclick = null;
  featuredButton.style.display = "";

  if (featuredAction) {
    featuredButton.classList.remove("hidden");
    featuredButton.onclick = featuredAction;
  } else {
    featuredButton.classList.add("hidden");
  }

  items.forEach((item) => {
    const button = document.createElement("button");
    button.className = "modal-option";
    button.type = "button";
    button.innerHTML = `
      <span class="modal-option-title">${item.title}</span>
      <span class="modal-option-meta">${item.meta}</span>
    `;
    button.addEventListener("click", () => {
      onSelect(item);
      closeModal();
    });
    listNode.appendChild(button);
  });

  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");
}

function closeModal() {
  const overlay = document.querySelector("#picker-modal");
  if (!overlay) {
    return;
  }

  overlay.classList.add("hidden");
  overlay.setAttribute("aria-hidden", "true");
}

function renderIntegrationSelections() {
  const driveSelection = document.querySelector("#drive-selection");
  const emailSelection = document.querySelector("#email-selection");
  const clearDriveButton = document.querySelector("#clear-drive-selection");
  const clearEmailButton = document.querySelector("#clear-email-selection");

  if (driveSelection) {
    if (pickerState.driveAccount && pickerState.driveFile) {
      driveSelection.classList.remove("error");
      driveSelection.classList.remove("empty");
      driveSelection.innerHTML = `<strong>${pickerState.driveAccount.name}</strong> (${pickerState.driveAccount.email})<br>${pickerState.driveFile.name}<br>${pickerState.driveFile.meta}`;
    } else if (pickerState.driveAccount) {
      driveSelection.classList.remove("error");
      driveSelection.classList.remove("empty");
      driveSelection.innerHTML = `<strong>${pickerState.driveAccount.name}</strong> (${pickerState.driveAccount.email})<br>No Drive file selected yet.`;
    } else {
      driveSelection.classList.remove("error");
      driveSelection.classList.add("empty");
      driveSelection.textContent = "No Google Drive account or file selected yet.";
    }
  }

  if (emailSelection) {
    if (pickerState.emailAccount && pickerState.emailMessage) {
      emailSelection.classList.remove("error");
      emailSelection.classList.remove("empty");
      const attachments = pickerState.emailMessage.attachments?.length
        ? `<br><strong>Attachments:</strong> ${pickerState.emailMessage.attachments.map((a) => a.filename).join(", ")}`
        : "<br><strong>Attachments:</strong> None";
      emailSelection.innerHTML =
        `<strong>${pickerState.emailAccount.name}</strong> (${pickerState.emailAccount.email})` +
        `<br><strong>Subject:</strong> ${pickerState.emailMessage.subject}` +
        `<br><strong>From:</strong> ${pickerState.emailMessage.from}` +
        `<br><strong>To:</strong> ${pickerState.emailMessage.to || "—"}` +
        `<br><strong>Date:</strong> ${pickerState.emailMessage.date}` +
        attachments +
        `<br><strong>Body:</strong> ${(pickerState.emailMessage.bodyText || pickerState.emailMessage.snippet || "—").slice(0, 500)}${(pickerState.emailMessage.bodyText || "").length > 500 ? "…" : ""}`;
    } else if (pickerState.emailAccount) {
      emailSelection.classList.remove("error");
      emailSelection.classList.remove("empty");
      emailSelection.innerHTML = `<strong>${pickerState.emailAccount.name}</strong> (${pickerState.emailAccount.email})<br>No Gmail message selected yet.`;
    } else {
      emailSelection.classList.remove("error");
      emailSelection.classList.add("empty");
      emailSelection.textContent = "No email account or message selected yet.";
    }
  }

  if (clearDriveButton) {
    clearDriveButton.classList.toggle("hidden", !pickerState.driveFile);
  }

  if (clearEmailButton) {
    clearEmailButton.classList.toggle("hidden", !pickerState.emailMessage);
  }

  savePickerState();
}

function initSourcePicker() {
  const options = document.querySelectorAll(".source-option");
  const fileInput = document.querySelector("#report-file");
  const fileSelection = document.querySelector("#file-selection");
  const clearFileButton = document.querySelector("#clear-file-selection");

  if (!options.length) {
    return;
  }

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const sourceType = option.dataset.sourceTarget.replace("-panel", "");
      setActiveSourcePanel(sourceType);
    });
  });

  setActiveSourcePanel(getStoredActiveSource());

  if (fileInput && fileSelection) {
    fileInput.addEventListener("change", () => {
      const names = Array.from(fileInput.files || []).map((file) => file.name);
      fileSelection.textContent = names.length
        ? `${names.length} file${names.length > 1 ? "s" : ""} selected: ${names.join(", ")}`
        : "No files selected yet.";

      if (clearFileButton) {
        clearFileButton.classList.toggle("hidden", names.length === 0);
      }
    });
  }

  if (clearFileButton && fileInput && fileSelection) {
    clearFileButton.addEventListener("click", () => {
      fileInput.value = "";
      fileSelection.textContent = "No files selected yet.";
      clearFileButton.classList.add("hidden");
    });
  }
}

function initIntegrationPickers() {
  const pickDriveFile = document.querySelector("#pick-drive-file");
  const pickEmailMessage = document.querySelector("#pick-email-message");
  const clearDriveButton = document.querySelector("#clear-drive-selection");
  const clearEmailButton = document.querySelector("#clear-email-selection");
  const closeModalButton = document.querySelector("#close-modal");
  const modalOverlay = document.querySelector("#picker-modal");

  if (pickDriveFile) {
    pickDriveFile.addEventListener("click", async () => {
      try {
        clearSelectionError("drive");
        pickDriveFile.disabled = true;
        const token = await getGoogleToken(GOOGLE_DRIVE_SCOPE, "drive");
        const profile = await getGoogleProfile(token);

        pickerState.driveAccount = {
          name: profile.name,
          email: profile.email
        };
        saveStoredActiveSource("drive");

        // Use the official Google Drive Picker (matches your screenshot).
        pickerState.driveFile = null;
        renderIntegrationSelections();

        if (!GOOGLE_API_KEY) {
          throw new Error(
            "Missing GOOGLE_API_KEY. Create an API key (Google Cloud Console -> APIs & Services -> Credentials), enable the Google Picker API, then add it to config.local.js (gitignored)."
          );
        }

        const picked = await openDrivePicker(token);
        pickerState.driveFile = {
          id: picked.id,
          name: picked.name,
          meta: picked.meta,
          mimeType: picked.meta,
          url: picked.url || null
        };
        saveStoredActiveSource("drive");
        renderIntegrationSelections();
      } catch (error) {
        console.error("Drive picker error:", error);
        const message = error instanceof Error ? error.message : String(error);
        showSelectionError(
          "drive",
          `Google Drive connection failed. ${message ? `Details: ${message}` : "Check your authorized JavaScript origins and make sure the Drive API is enabled."}`
        );
      } finally {
        pickDriveFile.disabled = false;
      }
    });
  }

  if (pickEmailMessage) {
    pickEmailMessage.addEventListener("click", async () => {
      try {
        clearSelectionError("email");
        pickEmailMessage.disabled = true;
        // Force Google account chooser before listing messages (Drive picker does this implicitly).
        const token = await getGoogleToken(GOOGLE_GMAIL_SCOPE, "gmail", { prompt: "select_account consent" });
        const profile = await getGoogleProfile(token);

        pickerState.emailAccount = {
          name: profile.name,
          email: profile.email
        };
        pickerState.emailMessage = null;
        saveStoredActiveSource("email");
        renderIntegrationSelections();

        openGmailPickerModal({
          accessToken: token,
          profile,
          onPick: async (pickedMeta) => {
            try {
              const detail = await fetchGmailMessageDetail(token, pickedMeta.id);
              const headers = detail.payload?.headers || [];
              const attachments = extractAttachmentsFromParts(detail.payload?.parts || []);
              const subject = getHeaderValue(headers, "Subject") || pickedMeta.subject || "Untitled email";
              const from = getHeaderValue(headers, "From") || pickedMeta.from || "Unknown sender";
              const to = getHeaderValue(headers, "To") || "";
              const date = getHeaderValue(headers, "Date") || pickedMeta.date || "Unknown date";
              const bodyText = extractEmailBodyText(detail);
              const snippet = detail.snippet || pickedMeta.snippet || "";

              pickerState.emailMessage = {
                id: pickedMeta.id,
                subject,
                from,
                to,
                date,
                attachments,
                bodyText,
                snippet,
                meta: `${formatAttachmentSummary(attachments)}`
              };
              saveStoredActiveSource("email");
              renderIntegrationSelections();
              closeModal();
            } catch (error) {
              console.error("Failed to load email detail:", error);
              const message = error instanceof Error ? error.message : String(error);
              showSelectionError("email", `Failed to load email details. Details: ${message}`);
              closeModal();
            }
          }
        });
      } catch (error) {
        console.error("Gmail picker error:", error);
        const message = error instanceof Error ? error.message : String(error);
        showSelectionError(
          "email",
          `Gmail connection failed. ${message ? `Details: ${message}` : "Check your authorized JavaScript origins and make sure the Gmail API is enabled."}`
        );
      } finally {
        pickEmailMessage.disabled = false;
      }
    });
  }

  if (clearDriveButton) {
    clearDriveButton.addEventListener("click", () => {
      pickerState.driveFile = null;
      renderIntegrationSelections();
    });
  }

  if (clearEmailButton) {
    clearEmailButton.addEventListener("click", () => {
      pickerState.emailMessage = null;
      renderIntegrationSelections();
    });
  }

  closeModalButton?.addEventListener("click", closeModal);
  modalOverlay?.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      closeModal();
    }
  });

  renderIntegrationSelections();
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function getCardTheme(index) {
  const themes = [
    { className: "lavender", icon: "📘" },
    { className: "sky", icon: "🚀" },
    { className: "cream", icon: "⚙️" },
    { className: "sky", icon: "📝" }
  ];

  return themes[index % themes.length];
}

function buildReportCard(report, index, hasNewReply) {
  const theme = getCardTheme(index);
  const tags = parseTags(report.tags);
  const card = document.createElement("article");
  card.className = `report-card ${theme.className}`;
  card.dataset.reportId = report.id;
  card.innerHTML = `
    <div class="card-top">
      <span class="emoji">${theme.icon}</span>
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
        <span class="user-status-chip ${getUserStatusClass(report)}">${getUserStatusLabel(report)}</span>
        ${hasNewReply ? '<span class="reply-badge">+1 reply</span>' : ""}
      </div>
    </div>
    <h2>${escapeHtml(report.title)}</h2>
    <p>${formatDate(getReportCreatedAt(report))} • ${escapeHtml(getSourceLabel(report.source_type || report.sourceType))}</p>
    ${renderTagBadges(tags)}
    <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">
      <button class="secondary-button preview-button" type="button" data-report-id="${report.id}">Preview</button>
      <button class="delete-button" type="button" data-report-id="${report.id}" aria-label="Delete report">Delete</button>
    </div>
  `;
  return card;
}

function buildReportListRow(report, index, hasNewReply) {
  const theme = getCardTheme(index);
  const tags = parseTags(report.tags);
  const row = document.createElement("article");
  row.className = "reports-list-row";
  row.dataset.reportId = report.id;
  row.innerHTML = `
    <div class="list-title">
      <span class="emoji">${theme.icon}</span>
      <div>
        <span class="list-title-text">${escapeHtml(report.title)}</span>
        ${renderTagBadges(tags)}
      </div>
    </div>
    <div class="list-cell">${escapeHtml(getSourceLabel(report.source_type || report.sourceType))}</div>
    <div class="list-cell">${formatDate(getReportCreatedAt(report))}</div>
    <div class="list-cell"><span class="user-status-chip ${getUserStatusClass(report)}">${getUserStatusLabel(report)}</span></div>
    <div class="list-cell preview-cell">
      <span class="preview-snippet">${escapeHtml(getReportPreview(report))}</span>
      <button class="preview-inline-button" type="button" data-report-id="${report.id}">Open</button>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      ${hasNewReply ? '<span class="reply-badge">+1</span>' : ""}
      <button class="delete-button" type="button" data-report-id="${report.id}" aria-label="Delete report">Del</button>
    </div>
  `;
  return row;
}

function initPreviewModal() {
  const closeButton = document.querySelector("#close-preview-modal");
  const modal = document.querySelector("#report-preview-modal");

  closeButton?.addEventListener("click", closeReportPreview);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeReportPreview();
    }
  });
}

function setReportsView(view) {
  const reportsGrid = document.querySelector("#reports-grid");
  const reportsList = document.querySelector("#reports-list");
  const cardButton = document.querySelector("#card-view-button");
  const listButton = document.querySelector("#list-view-button");

  if (!reportsGrid || !reportsList || !cardButton || !listButton) {
    return;
  }

  const showCards = view === "card";
  reportsGrid.classList.toggle("hidden", !showCards);
  reportsList.classList.toggle("hidden", showCards);
  cardButton.classList.toggle("active", showCards);
  listButton.classList.toggle("active", !showCards);
  saveStoredView(view);
}

function initViewToggle() {
  const cardButton = document.querySelector("#card-view-button");
  const listButton = document.querySelector("#list-view-button");

  if (!cardButton || !listButton) {
    return;
  }

  cardButton.addEventListener("click", () => {
    setReportsView("card");
  });

  listButton.addEventListener("click", () => {
    setReportsView("list");
  });
}

async function submitReportData(sourceType, titleText, tagsRaw, sourceExplanation) {
  const fileInput = document.querySelector("#report-file");
  const descriptionInput = document.querySelector("#report-text");
  const reportText = getReportBodyForSource(sourceType);

  const duplicateCheckText = [titleText, sourceExplanation, reportText].filter(Boolean).join("\n\n");
  const dupResult = await findSimilarReports(duplicateCheckText);
  const embedding = dupResult?.embedding || null;
  const embeddingModel = dupResult?.model || null;
  if (dupResult && Array.isArray(dupResult.matches) && dupResult.matches.length > 0) {
    const decision = await showDuplicateWarningModal({ matches: dupResult.matches });
    if (decision !== "submit") {
      const err = new Error("Submission cancelled — please review the similar reports.");
      err.cancelled = true;
      throw err;
    }
  }

  if (sourceType === "file") {
    const files = Array.from(fileInput?.files || []);
    if (!files.length) {
      throw new Error("Please select a file to upload.");
    }
    const rows = [];
    for (const file of files) {
      const uploaded = await uploadReportFile(file);
      rows.push({
        title: files.length > 1 ? `${titleText} - ${file.name}` : titleText,
        description: sourceExplanation || `Uploaded file: ${file.name}`,
        explanation: sourceExplanation || null,
        source_type: "file",
        content: null,
        file_url: uploaded.fileUrl,
        file_name: file.name,
        mime_type: file.type || null,
        extracted_text: null,
        detailed_summary: null,
        processing_status: "pending",
        processed_at: null,
        tags: tagsRaw || null,
        embedding,
        embedding_model: embeddingModel
      });
    }
    await insertReports(rows);
  } else if (sourceType === "drive") {
    if (!pickerState.driveFile?.id) {
      throw new Error("Please choose a Google Drive file before submitting.");
    }
    // The picked file is persisted in localStorage, but the Google access token
    // is in-memory only and expires after ~1h. If we lost the token, ask Google
    // for a fresh one silently rather than forcing the user to re-pick the file.
    let driveToken = googleTokens.drive;
    if (!driveToken) {
      driveToken = await getGoogleToken(GOOGLE_DRIVE_SCOPE, "drive", { prompt: "" });
    }
    let driveDownload;
    try {
      driveDownload = await fetchDriveFileBlob(
        pickerState.driveFile.id,
        driveToken,
        pickerState.driveFile.mimeType || ""
      );
    } catch (err) {
      // Token may have expired between acquisition and use, or scope was revoked.
      // Try once more with a freshly requested token before giving up.
      const message = err instanceof Error ? err.message : String(err);
      if (/401|403|unauthor|invalid_token/i.test(message)) {
        driveToken = await getGoogleToken(GOOGLE_DRIVE_SCOPE, "drive", { prompt: "" });
        driveDownload = await fetchDriveFileBlob(
          pickerState.driveFile.id,
          driveToken,
          pickerState.driveFile.mimeType || ""
        );
      } else {
        throw err;
      }
    }
    const finalFileName = ensureFileNameExtension(pickerState.driveFile.name || "drive-file", driveDownload.extension);
    const driveFile = new File([driveDownload.blob], finalFileName, { type: driveDownload.mimeType });
    const uploaded = await uploadReportFile(driveFile);
    await insertReports([{
      title: titleText === "Untitled report" ? finalFileName : titleText,
      description: sourceExplanation || `Imported from Google Drive: ${finalFileName}`,
      explanation: sourceExplanation || null,
      source_type: "drive",
      content: [
        `Google Drive account: ${pickerState.driveAccount?.email || ""}`,
        `Selected file: ${finalFileName}`,
        `Original type: ${pickerState.driveFile.mimeType || pickerState.driveFile.meta || "Google Drive file"}`,
        sourceExplanation ? `Explanation: ${sourceExplanation}` : ""
      ].join("\n"),
      file_url: uploaded.fileUrl,
      file_name: finalFileName,
      mime_type: driveDownload.mimeType,
      extracted_text: null,
      detailed_summary: null,
      processing_status: "pending",
      processed_at: null,
      tags: tagsRaw || null,
      embedding,
      embedding_model: embeddingModel
    }]);
  } else {
    const description = sourceType === "manual"
      ? (descriptionInput?.value.trim().slice(0, 140) || null)
      : (sourceExplanation || `Imported from ${getSourceLabel(sourceType)}`);
    await insertReports([{
      title: titleText,
      description,
      explanation: sourceType === "manual" ? null : (sourceExplanation || null),
      source_type: sourceType,
      content: sourceExplanation && sourceType === "email"
        ? `${reportText}\n\nExplanation:\n${sourceExplanation}`
        : reportText,
      file_url: null,
      file_name: null,
      mime_type: null,
      extracted_text: sourceType === "manual" || sourceType === "email" ? reportText : null,
      detailed_summary: null,
      processing_status: sourceType === "manual" || sourceType === "email" ? "extracted" : "pending",
      processed_at: null,
      tags: tagsRaw || null,
      embedding,
      embedding_model: embeddingModel
    }]);
  }
}

function initReportForm() {
  const form = document.querySelector("#report-form");
  if (!form) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const editDraftId = urlParams.get("draft");
  let editingDraft = null;

  if (editDraftId) {
    editingDraft = getDraftById(editDraftId);
    if (editingDraft) {
      const titleEl = document.querySelector("#report-title");
      const tagsEl = document.querySelector("#report-tags");
      if (titleEl) titleEl.value = editingDraft.title || "";
      if (tagsEl) tagsEl.value = editingDraft.tags || "";
      setActiveSourcePanel(editingDraft.sourceType || "manual");
      if (editingDraft.sourceType === "manual") {
        const textEl = document.querySelector("#report-text");
        if (textEl) textEl.value = editingDraft.content || "";
      } else {
        const noteEl = document.querySelector(`#${editingDraft.sourceType}-note`);
        if (noteEl) noteEl.value = editingDraft.explanation || "";
        if (editingDraft.sourceType === "file" && editingDraft.content) {
          const fileSelection = document.querySelector("#file-selection");
          const fileInput = document.querySelector("#report-file");
          const clearFileButton = document.querySelector("#clear-file-selection");
          if (fileSelection) {
            fileSelection.textContent = `Saved file: ${editingDraft.content} (select a new file to replace it)`;
          }
          // Try to restore the actual bytes from IndexedDB so the user doesn't
          // need to re-pick before submitting.
          idbGetDraftFiles(editingDraft.id).then((restored) => {
            if (!restored.length || !fileInput) return;
            try {
              const dt = new DataTransfer();
              for (const f of restored) {
                const fileObj = f instanceof File
                  ? f
                  : new File([f], editingDraft.content || "draft-file", { type: f.type || "" });
                dt.items.add(fileObj);
              }
              fileInput.files = dt.files;
              const names = Array.from(fileInput.files).map((f) => f.name);
              if (fileSelection) {
                fileSelection.textContent = `${names.length} file${names.length > 1 ? "s" : ""} restored from draft: ${names.join(", ")}`;
              }
              if (clearFileButton) clearFileButton.classList.remove("hidden");
            } catch (err) {
              console.warn("Could not restore draft file into input:", err);
            }
          }).catch(() => { /* keep the text-only fallback */ });
        }
      }

      const formActions = form.querySelector(".form-actions");
      if (formActions) {
        const submitReportBtn = document.createElement("button");
        submitReportBtn.type = "button";
        submitReportBtn.className = "secondary-button";
        submitReportBtn.textContent = "Submit Report";
        const goToDraftsLink = formActions.querySelector("a");
        formActions.insertBefore(submitReportBtn, goToDraftsLink || null);

        submitReportBtn.addEventListener("click", async () => {
          const sourceType = getActiveSourceType();
          const titleText = document.querySelector("#report-title")?.value.trim() || "Untitled report";
          const tagsRaw = document.querySelector("#report-tags")?.value.trim() || "";
          const sourceExplanation = getSourceExplanation(sourceType);

          const fileInput = document.querySelector("#report-file");
          const newFiles = sourceType === "file" ? Array.from(fileInput?.files || []) : [];
          const hasDraftFile = sourceType === "file" && newFiles.length === 0 && editingDraft?.content;

          if (hasDraftFile) {
            setFormStatus(`This draft had a file attached ("${editingDraft.content}"). Please re-select the file to upload it before submitting.`, true);
            return;
          }

          const reportText = getReportBodyForSource(sourceType);

          if (!reportText) {
            setFormStatus("Please add report content before submitting.", true);
            return;
          }

          try {
            ensureSupabaseConfigured();
            setFormStatus("");
            submitReportBtn.disabled = true;
            submitReportBtn.textContent = "Submitting…";

            await submitReportData(sourceType, titleText, tagsRaw, sourceExplanation);

            deleteDraftFromStore(editingDraft.id);
            saveStoredView("list");
            window.location.href = "reports.html";
          } catch (error) {
            console.error("Failed to submit report:", error);
            setFormStatus(error.message || "Failed to submit report.", true);
            submitReportBtn.disabled = false;
            submitReportBtn.textContent = "Submit Report";
          }
        });

        if (urlParams.get("autoSubmit") === "1") {
          // Triggered by the Submit button on the drafts page. Wait a tick so
          // async draft restoration (file from IndexedDB, source panel state)
          // can settle before we fire the click.
          const fireAutoSubmit = () => submitReportBtn.click();
          if (editingDraft?.sourceType === "file" && editingDraft?.content) {
            setTimeout(fireAutoSubmit, 600);
          } else {
            setTimeout(fireAutoSubmit, 0);
          }
        }
      }
    }
  }

  const saveDraftBtn = document.querySelector("#save-draft-btn");
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", rfSaveDraft);
  }

  const generateSummaryBtn = document.querySelector("#generate-summary-btn");
  const summaryBody = document.querySelector("#ai-summary-body");
  if (generateSummaryBtn && summaryBody) {
    generateSummaryBtn.addEventListener("click", async () => {
      const sourceType = getActiveSourceType();
      const titleText = document.querySelector("#report-title")?.value.trim() || "";
      const sourceExplanation = getSourceExplanation(sourceType);
      const reportText = getReportBodyForSource(sourceType);
      const combined = [titleText, sourceExplanation, reportText].filter(Boolean).join("\n\n");

      if (combined.trim().length < 30) {
        summaryBody.innerHTML = `<p class="helper-text ai-summary-error">Add a bit more content first (at least one sentence).</p>`;
        return;
      }

      generateSummaryBtn.disabled = true;
      generateSummaryBtn.textContent = "Generating…";
      summaryBody.innerHTML = `<p class="helper-text ai-summary-loading">Generating summary…</p>`;

      try {
        const prompt = `Summarize the following report in exactly 2 short sentences (max 50 words total). Be concise and factual. Do not include any preamble, headings, or markdown — just the two sentences.\n\nREPORT:\n${combined.slice(0, 4000)}`;
        const summary = await callBackendAi(prompt);
        summaryBody.innerHTML = `<p class="ai-summary-text">${escapeHtml(summary.trim())}</p>`;
        generateSummaryBtn.textContent = "✨ Regenerate";
      } catch (err) {
        summaryBody.innerHTML = `<p class="helper-text ai-summary-error">${escapeHtml(err.message || "Failed to generate summary.")}</p>`;
        generateSummaryBtn.textContent = "✨ Generate summary";
      } finally {
        generateSummaryBtn.disabled = false;
      }
    });
  }

  if (document.querySelector("#draft-history-list")) {
    renderDraftHistory();
  }
}

const REPORTS_PAGE_SIZE = 8;

function applyReportsFilter(reports, query, typeFilter, sort) {
  let filtered = reports;
  if (typeFilter) {
    filtered = filtered.filter((r) => (r.source_type || r.sourceType) === typeFilter);
  }
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter((r) => {
      const inTitle = (r.title || "").toLowerCase().includes(q);
      const inTags = (r.tags || "").toLowerCase().includes(q);
      const inDesc = (r.description || "").toLowerCase().includes(q);
      return inTitle || inTags || inDesc;
    });
  }
  if (sort === "oldest") {
    filtered = [...filtered].sort((a, b) => new Date(getReportCreatedAt(a)) - new Date(getReportCreatedAt(b)));
  }
  return filtered;
}

function renderPagination(paginationEl, total, currentPage, perPage, onChange) {
  paginationEl.innerHTML = "";
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return;

  const prev = document.createElement("button");
  prev.className = "page-btn";
  prev.textContent = "←";
  prev.disabled = currentPage === 1;
  prev.addEventListener("click", () => onChange(currentPage - 1));
  paginationEl.appendChild(prev);

  for (let p = 1; p <= totalPages; p++) {
    const btn = document.createElement("button");
    btn.className = `page-btn${p === currentPage ? " active" : ""}`;
    btn.textContent = String(p);
    btn.addEventListener("click", () => onChange(p));
    paginationEl.appendChild(btn);
  }

  const next = document.createElement("button");
  next.className = "page-btn";
  next.textContent = "→";
  next.disabled = currentPage === totalPages;
  next.addEventListener("click", () => onChange(currentPage + 1));
  paginationEl.appendChild(next);
}

function initNotificationBanner(reports) {
  const banner = document.querySelector("#reply-notification");
  if (!banner) return;

  const seenKey = "reportflow-seen-replies";
  const seenIds = new Set(JSON.parse(window.localStorage.getItem(seenKey) || "[]"));
  const hasNew = reports.some((r) => r.admin_response && !seenIds.has(String(r.id)));

  if (hasNew) {
    banner.classList.remove("hidden");
    banner.querySelector(".notification-dismiss")?.addEventListener("click", () => {
      const allIds = reports.filter((r) => r.admin_response).map((r) => String(r.id));
      window.localStorage.setItem(seenKey, JSON.stringify(allIds));
      banner.classList.add("hidden");
    });
  }
}

function initEditModal(reportMap) {
  const modal = document.querySelector("#edit-report-modal");
  const titleInput = document.querySelector("#edit-title");
  const explanationInput = document.querySelector("#edit-explanation");
  const tagsInput = document.querySelector("#edit-tags");
  const saveBtn = document.querySelector("#save-edit-btn");
  const cancelBtn = document.querySelector("#cancel-edit-btn");
  const closeBtn = document.querySelector("#close-edit-modal");
  const statusEl = document.querySelector("#edit-status");
  if (!modal) return;

  let activeReportId = null;

  function openEdit(reportId) {
    const report = reportMap.get(String(reportId));
    if (!report) return;
    activeReportId = String(reportId);
    titleInput.value = report.title || "";
    explanationInput.value = report.explanation || report.description || "";
    tagsInput.value = report.tags || "";
    statusEl.textContent = "";
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    titleInput.focus();
  }

  function closeEdit() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    activeReportId = null;
  }

  saveBtn?.addEventListener("click", async () => {
    if (!activeReportId) return;
    const newTitle = titleInput.value.trim();
    const newExplanation = explanationInput.value.trim();
    const newTags = tagsInput.value.trim();
    if (!newTitle) { statusEl.textContent = "Title cannot be empty."; statusEl.classList.add("error"); return; }
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving…";
    statusEl.textContent = "";
    statusEl.classList.remove("error");
    try {
      ensureSupabaseConfigured();
      await supabaseClient.from("reports").update({
        title: newTitle,
        explanation: newExplanation || null,
        description: newExplanation || null,
        tags: newTags || null
      }).eq("id", activeReportId);
      closeEdit();
      await initReportsPage();
    } catch (err) {
      statusEl.textContent = err.message || "Failed to save.";
      statusEl.classList.add("error");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save changes";
    }
  });

  cancelBtn?.addEventListener("click", closeEdit);
  closeBtn?.addEventListener("click", closeEdit);
  modal?.addEventListener("click", (e) => { if (e.target === modal) closeEdit(); });

  return openEdit;
}

async function initReportsPage() {
  const reportsGrid = document.querySelector("#reports-grid");
  const reportsList = document.querySelector("#reports-list");
  const emptyState = document.querySelector("#empty-state");
  const paginationEl = document.querySelector("#pagination");
  const searchInput = document.querySelector("#reports-search");
  const typeFilter = document.querySelector("#reports-type-filter");
  const sortSelect = document.querySelector("#reports-sort");
  const filterCount = document.querySelector("#filter-count");
  if (!reportsGrid || !reportsList || !emptyState) return;

  let allReports = [];
  let currentPage = 1;

  function renderPage(filtered) {
    reportsGrid.innerHTML = "";
    reportsList.innerHTML = "";
    const start = (currentPage - 1) * REPORTS_PAGE_SIZE;
    const pageReports = filtered.slice(start, start + REPORTS_PAGE_SIZE);

    if (filterCount) filterCount.textContent = filtered.length === allReports.length ? `${allReports.length} reports` : `${filtered.length} of ${allReports.length}`;

    if (!filtered.length) {
      emptyState.classList.remove("hidden");
      reportsGrid.classList.add("hidden");
      reportsList.classList.add("hidden");
      if (paginationEl) paginationEl.innerHTML = "";
      return;
    }

    emptyState.classList.add("hidden");
    reportsList.innerHTML = `
      <div class="reports-list-header">
        <div>Title</div>
        <div>Type</div>
        <div>Created</div>
        <div>Status</div>
        <div>Preview</div>
        <div></div>
      </div>
    `;

    const reportMap = new Map(allReports.map((r) => [String(r.id), r]));
    const seenIds = new Set(JSON.parse(window.localStorage.getItem("reportflow-seen-replies") || "[]"));

    pageReports.forEach((report, index) => {
      const hasNewReply = Boolean(report.admin_response) && !seenIds.has(String(report.id));
      reportsGrid.appendChild(buildReportCard(report, start + index, hasNewReply));
      reportsList.appendChild(buildReportListRow(report, start + index, hasNewReply));
    });

    document.querySelectorAll("[data-report-id].preview-button, [data-report-id].preview-inline-button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const report = reportMap.get(String(btn.dataset.reportId));
        if (report) {
          openReportPreview(report);
          if (report.admin_response) {
            const seenKey = "reportflow-seen-replies";
            const seen = new Set(JSON.parse(window.localStorage.getItem(seenKey) || "[]"));
            seen.add(String(report.id));
            window.localStorage.setItem(seenKey, JSON.stringify([...seen]));
            // remove badge from card and list row immediately
            document.querySelectorAll(`[data-report-id="${report.id}"] .reply-badge, [data-report-id="${report.id}"].reply-badge`).forEach((b) => b.remove());
            document.querySelectorAll(`[data-report-id="${report.id}"]`).forEach((el) => {
              el.closest(".report-card, .reports-list-row")?.querySelectorAll(".reply-badge").forEach((b) => b.remove());
            });
          }
        }
      });
    });

    document.querySelectorAll(".delete-button[data-report-id]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm(tr("reports.confirm_delete", "Delete this report? This cannot be undone."))) return;
        try {
          await deleteReport(btn.dataset.reportId);
          await initReportsPage();
        } catch (error) {
          console.error("Failed to delete report:", error);
        }
      });
    });

    if (paginationEl) renderPagination(paginationEl, filtered.length, currentPage, REPORTS_PAGE_SIZE, (p) => { currentPage = p; renderPage(filtered); window.scrollTo({ top: 0, behavior: "smooth" }); });
    setReportsView(getStoredView());
  }

  function applyFilters() {
    currentPage = 1;
    const q = searchInput?.value.trim() || "";
    const type = typeFilter?.value || "";
    const sort = sortSelect?.value || "newest";
    renderPage(applyReportsFilter(allReports, q, type, sort));
  }

  try {
    ensureSupabaseConfigured();
    allReports = await fetchReports();
    initNotificationBanner(allReports);
    renderPage(allReports);

    searchInput?.addEventListener("input", applyFilters);
    typeFilter?.addEventListener("change", applyFilters);
    sortSelect?.addEventListener("change", applyFilters);
  } catch (error) {
    console.error("Failed to load reports:", error);
    emptyState.classList.remove("hidden");
    reportsGrid.classList.add("hidden");
    reportsList.classList.add("hidden");
    const emptyTitle = emptyState.querySelector("h2");
    const emptyCopy = emptyState.querySelector(".empty-copy");
    if (emptyTitle) emptyTitle.textContent = "Supabase is not connected";
    if (emptyCopy) emptyCopy.textContent = error.message || "Add your Supabase settings in app.js to load reports.";
  }
}

function initDraftsPage() {
  const draftsGrid = document.querySelector("#drafts-grid");
  const draftsEmpty = document.querySelector("#drafts-empty-state");
  if (!draftsGrid || !draftsEmpty) {
    return;
  }

  function formatDraftDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return iso || "";
    }
  }

  function renderDrafts() {
    let drafts = [];
    try {
      const raw = window.localStorage.getItem(DRAFTS_KEY);
      drafts = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(drafts)) drafts = [];
    } catch (e) {
      drafts = [];
    }
    draftsGrid.innerHTML = "";

    if (!drafts.length) {
      draftsEmpty.classList.remove("hidden");
      draftsGrid.classList.add("hidden");
      return;
    }

    draftsEmpty.classList.add("hidden");
    draftsGrid.classList.remove("hidden");

    drafts.forEach((draft) => {
      const card = document.createElement("article");
      card.className = "draft-card";
      card.dataset.draftId = draft.id;
      const preview = draft.content || draft.explanation || "No preview available";
      const tagsHtml = draft.tags
        ? `<div class="tag-badges">${parseTags(draft.tags).map((t) => `<span class="tag-badge">${escapeHtml(t)}</span>`).join("")}</div>`
        : "";

      card.innerHTML = `
        <div class="draft-card-head">
          <div class="draft-card-title-group">
            <p class="eyebrow">Saved ${escapeHtml(formatDraftDate(draft.savedAt))}</p>
            <h2 class="draft-title">${escapeHtml(draft.title || "Untitled draft")}</h2>
          </div>
          <span class="draft-source-chip">${escapeHtml(getSourceLabel(draft.sourceType || "manual"))}</span>
        </div>
        ${tagsHtml}
        <p class="draft-preview">${escapeHtml(preview.slice(0, 180))}${preview.length > 180 ? "…" : ""}</p>
        <div class="draft-actions">
          <a class="primary-button draft-btn" href="enter-report.html?draft=${encodeURIComponent(draft.id)}">Edit</a>
          <a class="secondary-button draft-btn draft-submit-btn" href="enter-report.html?draft=${encodeURIComponent(draft.id)}&autoSubmit=1">Submit</a>
          <button class="delete-button draft-delete-btn" type="button">Delete</button>
        </div>
      `;
      draftsGrid.appendChild(card);
    });
  }

  draftsGrid.addEventListener("click", (event) => {
    const deleteBtn = event.target.closest(".draft-delete-btn");
    if (!deleteBtn) {
      return;
    }
    const card = deleteBtn.closest(".draft-card");
    const draftId = card?.dataset.draftId;
    if (draftId && window.confirm(tr("drafts.confirm_delete", "Delete this draft? This cannot be undone."))) {
      deleteDraftFromStore(draftId);
      renderDrafts();
    }
  });

  renderDrafts();
}

async function initAnalyticsPage() {
  const grid = document.querySelector(".analytics-charts-grid");
  if (!grid) return;
  if (typeof Chart === "undefined") {
    console.warn("[Analytics] Chart.js not loaded.");
    return;
  }

  let reports = [];
  try {
    const session = await getCurrentSession();
    if (!session) return;
    const { data: profile } = supabaseClient
      ? await supabaseClient.from("profiles").select("is_admin").eq("id", session.user.id).maybeSingle()
      : { data: null };
    reports = await fetchReports({ includeAll: !!profile?.is_admin });
  } catch (e) {
    console.error("[Analytics] Failed to load reports:", e);
    return;
  }

  renderAnalyticsStats(reports);
  renderTimelineChart(reports);
  renderStatusChart(reports);
  renderSourceChart(reports);
  renderCategoryChart(reports);
  renderSeverityChart(reports);
  renderTagsChart(reports);
}

function renderAnalyticsStats(reports) {
  const total = reports.length;
  const pending = reports.filter((r) => ["pending", "extracted"].includes(getProcessingStatus(r))).length;
  const processed = reports.filter((r) => getProcessingStatus(r) === "processed").length;
  const resolved = reports.filter((r) => getProcessingStatus(r) === "resolved").length;
  const critical = reports.filter((r) => {
    const s = getReportSeverity(r);
    return s !== null && s >= 4 && getProcessingStatus(r) !== "resolved";
  }).length;

  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText("stat-total", total);
  setText("stat-pending", pending);
  setText("stat-processed", processed);
  setText("stat-resolved", resolved);
  setText("stat-critical", critical);

  const resolvedReports = reports.filter((r) => r.processed_at && getProcessingStatus(r) === "resolved");
  if (resolvedReports.length === 0) {
    setText("stat-avg-resolution", "—");
  } else {
    const avgMs = resolvedReports.reduce((sum, r) => {
      const start = new Date(getReportCreatedAt(r)).getTime();
      const end = new Date(r.processed_at).getTime();
      return sum + Math.max(0, end - start);
    }, 0) / resolvedReports.length;
    setText("stat-avg-resolution", formatDuration(avgMs));
  }
}

function formatDuration(ms) {
  const hours = ms / 3_600_000;
  if (hours < 1) return `${Math.max(1, Math.round(ms / 60_000))}m`;
  if (hours < 48) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

function renderTimelineChart(reports) {
  const canvas = document.getElementById("chart-timeline");
  if (!canvas) return;
  const days = 14;
  const labels = [];
  const counts = new Array(days).fill(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(d.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
  }
  reports.forEach((r) => {
    const created = new Date(getReportCreatedAt(r));
    if (Number.isNaN(created.getTime())) return;
    const d = new Date(created);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - d) / 86_400_000);
    const idx = days - 1 - diffDays;
    if (idx >= 0 && idx < days) counts[idx]++;
  });
  new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Reports",
        data: counts,
        borderColor: "#d40511",
        backgroundColor: "rgba(212, 5, 17, 0.12)",
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: "#d40511"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } }
      }
    }
  });
}

function renderDonut(canvasId, legendId, labelMap, colorMap, valueMap) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const labels = Object.keys(valueMap);
  const data = labels.map((k) => valueMap[k]);
  const colors = labels.map((k) => colorMap[k] || "#94a3b8");
  const niceLabels = labels.map((k) => labelMap[k] || k);
  new Chart(canvas, {
    type: "doughnut",
    data: { labels: niceLabels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: { legend: { display: false } }
    }
  });
  const legend = document.getElementById(legendId);
  if (legend) {
    legend.innerHTML = niceLabels.map((label, i) => `
      <span class="chart-legend-item">
        <span class="chart-legend-swatch" style="background:${colors[i]}"></span>
        <span class="chart-legend-label">${escapeHtml(label)}</span>
        <span class="chart-legend-value">${data[i]}</span>
      </span>
    `).join("");
  }
}

function renderStatusChart(reports) {
  const counts = { pending: 0, extracted: 0, processed: 0, under_review: 0, resolved: 0 };
  reports.forEach((r) => { const s = getProcessingStatus(r); if (counts[s] !== undefined) counts[s]++; });
  const filtered = Object.fromEntries(Object.entries(counts).filter(([, v]) => v > 0));
  renderDonut("chart-status", "chart-status-legend",
    { pending: "Pending", extracted: "Extracted", processed: "Processed", under_review: "Under Review", resolved: "Resolved" },
    { pending: "#f59e0b", extracted: "#3b82f6", processed: "#10b981", under_review: "#8b5cf6", resolved: "#22c55e" },
    filtered
  );
}

function renderSourceChart(reports) {
  const counts = {};
  reports.forEach((r) => {
    const s = r.source_type || r.sourceType || "manual";
    counts[s] = (counts[s] || 0) + 1;
  });
  renderDonut("chart-source", "chart-source-legend",
    { manual: "Text", file: "File", drive: "Google Drive", email: "Email" },
    { manual: "#0ea5e9", file: "#f97316", drive: "#22c55e", email: "#a855f7" },
    counts
  );
}

function renderCategoryChart(reports) {
  const canvas = document.getElementById("chart-category");
  if (!canvas) return;
  const counts = {};
  TRIAGE_CATEGORIES.forEach((c) => { counts[c] = 0; });
  reports.forEach((r) => { const c = getReportCategory(r); if (c) counts[c]++; });
  const labels = TRIAGE_CATEGORIES.map((c) => TRIAGE_CATEGORY_LABEL[c]);
  const data = TRIAGE_CATEGORIES.map((c) => counts[c]);
  const colorMap = {
    delay: "#d97706", damage: "#ea580c", lost: "#9333ea",
    fraud: "#dc2626", customs: "#2563eb", address: "#16a34a", other: "#6b7280"
  };
  const colors = TRIAGE_CATEGORIES.map((c) => colorMap[c]);
  new Chart(canvas, {
    type: "bar",
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, borderRadius: 6 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

function renderSeverityChart(reports) {
  const canvas = document.getElementById("chart-severity");
  if (!canvas) return;
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reports.forEach((r) => { const s = getReportSeverity(r); if (s) counts[s]++; });
  const labels = ["S1 Info", "S2 Low", "S3 Medium", "S4 High", "S5 Critical"];
  const data = [1, 2, 3, 4, 5].map((s) => counts[s]);
  const colors = ["#94a3b8", "#22c55e", "#eab308", "#f97316", "#dc2626"];
  new Chart(canvas, {
    type: "bar",
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, borderRadius: 6 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

function renderTagsChart(reports) {
  const canvas = document.getElementById("chart-tags");
  const empty = document.getElementById("chart-tags-empty");
  if (!canvas) return;
  const counts = {};
  reports.forEach((r) => {
    const raw = r.tags || "";
    raw.split(",").map((t) => t.trim()).filter(Boolean).forEach((tag) => {
      const key = tag.toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (sorted.length === 0) {
    canvas.style.display = "none";
    if (empty) empty.classList.remove("hidden");
    return;
  }
  new Chart(canvas, {
    type: "bar",
    data: {
      labels: sorted.map(([t]) => t),
      datasets: [{
        data: sorted.map(([, n]) => n),
        backgroundColor: "#ffcc00",
        borderColor: "#d40511",
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

loadStoredPickerState();
(async () => {
  await enforceProtectedPageAuth();
  renderAuthLinks();
  updateHomeHeroActions();
})();
initSourcePicker();
initIntegrationPickers();
initReportForm();
initThemeToggle();
initLanguageToggle();
initProfilePage();
initLoginForm();
initSignupForm();
initForgotPasswordForm();
initResetPasswordForm();
initViewToggle();
initPreviewModal();
initReportsPage();
initAdminPage();
initDraftsPage();
initAnalyticsPage();
