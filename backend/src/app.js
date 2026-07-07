const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const pinoHttp = require("pino-http");
const logger = require("./utils/logger");

const adminRoutes = require("./routes/admin.routes");
const authRoutes = require("./routes/auth.routes");
const authOtpRoutes = require("./routes/auth-otp.routes");
const healthRoutes = require("./routes/health.routes");
const systemRoutes = require("./routes/system.routes");
const companyRoutes = require("./routes/company.routes");
const adminUserRoutes = require("./routes/admin-user.routes");
const appVersionRoutes = require("./routes/app-version.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const settingsRoutes = require("./routes/settings.routes");
const auditRoutes = require("./routes/audit.routes");
const notificationRoutes = require("./routes/notification.routes");
const reportRoutes = require("./routes/report.routes");
const systemHealthRoutes = require("./routes/system-health.routes");
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");
const { globalLimiter } = require("./middleware/rate-limiter");

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: !allowedOrigins.includes("*"),
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(globalLimiter);

// Sentry request handler must be the first middleware on the app
Sentry.setupExpressErrorHandler(app);

app.use(pinoHttp({ logger }));

app.use("/health", healthRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/auth-otp", authOtpRoutes);
app.use("/api/v1/admin-users", adminUserRoutes);
app.use("/api/v1/system", systemRoutes);
app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/app", appVersionRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/audit-logs", auditRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/system/health", systemHealthRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Reward app API is running",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
