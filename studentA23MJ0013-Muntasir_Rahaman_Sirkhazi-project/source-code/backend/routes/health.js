const express = require("express");
const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "reportflow-backend",
    time: new Date().toISOString(),
  });
});

module.exports = router;
