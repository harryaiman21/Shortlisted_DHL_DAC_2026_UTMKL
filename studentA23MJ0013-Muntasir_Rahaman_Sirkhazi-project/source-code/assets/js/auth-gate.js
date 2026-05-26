// Synchronous, head-loaded auth gate. Hides the body of any auth-restricted
// page BEFORE its content paints, so a user typing a protected URL directly
// never sees the page even briefly. app.js's enforceProtectedPageAuth() does
// the real check (with the database) and either reveals the page or redirects.
//
// This is a UX gate, not the security boundary. Real protection is enforced
// server-side by Supabase RLS and by the backend's JWT/admin checks.
//
// Also applies the saved theme preference here so it lands before first paint
// (avoids a light-to-dark flash on reload).
(function () {
  var page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  var gatedPages = [
    "admin.html",
    "analytics.html",
    "drafts.html",
    "enter-report.html",
    "forgot-password.html",
    "login.html",
    "profile.html",
    "reports.html",
    "signup.html",
    "sop-library.html",
  ];
  if (gatedPages.indexOf(page) !== -1) {
    document.documentElement.classList.add("rf-auth-gating");
  }

  try {
    var saved = window.localStorage.getItem("rf-theme");
    if (saved === "dark" || saved === "light") {
      document.documentElement.setAttribute("data-theme", saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  } catch (e) {}
})();
