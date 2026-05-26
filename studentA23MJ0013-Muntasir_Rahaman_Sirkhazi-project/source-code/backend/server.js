const env = require("./config/env");
const express = require("express");
const cors = require("cors");

const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = env.FRONTEND_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins }));
app.use(express.json({ limit: "5mb" }));

app.use("/health", require("./routes/health"));
app.use("/ai", require("./routes/ai"));
app.use("/admin", require("./routes/admin"));
app.use("/uipath", require("./routes/uipath"));
app.use("/webhooks", require("./routes/webhooks"));

app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`reportflow-backend listening on :${env.PORT} (allowed origins: ${allowedOrigins.join(", ")})`);
});
