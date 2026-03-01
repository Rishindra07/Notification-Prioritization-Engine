const express = require("express");

const authRoutes = require("./routes/auth.routes");
const notificationRoutes = require("./routes/notification.routes");
const ruleRoutes = require("./routes/rule.routes");
const settingsRoutes = require("./routes/settings.routes");
const healthRoutes = require("./routes/health.routes");
const { authMiddleware } = require("./middleware/auth.middleware");

const app = express();

app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  return next();
});

app.get("/", (req, res) => {
  res.json({ name: "notification-prioritization-engine", status: "ok" });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", authMiddleware(), notificationRoutes);
app.use("/api/rules", authMiddleware(["admin"]), ruleRoutes);
app.use("/api/settings", authMiddleware(["admin"]), settingsRoutes);

module.exports = app;
