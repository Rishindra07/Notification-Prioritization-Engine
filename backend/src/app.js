const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const notificationRoutes = require("./routes/notification.routes");
const ruleRoutes = require("./routes/rule.routes");
const settingsRoutes = require("./routes/settings.routes");
const healthRoutes = require("./routes/health.routes");
const { authMiddleware } = require("./middleware/auth.middleware");


const app = express();
const getAllowedOrigins = () => {
  const explicitOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : null;

  return new Set([...explicitOrigins, ...(vercelUrl ? [vercelUrl] : [])]);
};

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests from non-browser clients and same-origin server calls.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has("*") || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      // Optional fallback to support Vercel preview deployments.
      if (/^https:\/\/notification-prioritization-engine-[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({ name: "notification-prioritization-engine", status: "ok" });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", authMiddleware(), notificationRoutes);
app.use("/api/rules", authMiddleware(["admin"]), ruleRoutes);
app.use("/api/settings", authMiddleware(["admin"]), settingsRoutes);

module.exports = app;
