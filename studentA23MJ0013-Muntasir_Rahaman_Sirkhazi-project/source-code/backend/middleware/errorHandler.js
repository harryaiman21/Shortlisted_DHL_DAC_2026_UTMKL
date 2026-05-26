const env = require("../config/env");

function notFound(_req, res, _next) {
  res.status(404).json({ error: "Not found" });
}

function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  // Log server-side; never leak stack to client in production.
  if (status >= 500) console.error("[error]", err);
  const body = { error: err.publicMessage || err.message || "Server error" };
  if (env.NODE_ENV !== "production" && status >= 500) body.stack = err.stack;
  res.status(status).json(body);
}

module.exports = { notFound, errorHandler };
