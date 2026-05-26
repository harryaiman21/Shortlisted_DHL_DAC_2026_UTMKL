// Copy this file to config.local.js (which is gitignored) and fill in the
// values you do not want in source control.
//
// In every HTML page, load it AFTER config.js, e.g.:
//   <script src="assets/js/config.js"></script>
//   <script src="assets/js/config.local.js"></script>
//   <script src="assets/js/app.js"></script>

window.RF_CONFIG = Object.assign(window.RF_CONFIG || {}, {
  // Drive Picker API key (Google Cloud Console -> Credentials -> API key).
  // Restrict it to your domains in the Cloud Console before using.
  GOOGLE_API_KEY: "",

  // Override backend URL for staging / production deploys.
  // BACKEND_URL: "https://your-backend.onrender.com",
});
