import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { authMiddleware } from "./api/middlewares/auth.js";
import { errorMiddleware, notFoundMiddleware } from "./api/middlewares/error.js";
import alertsRoutes from "./api/routes/alerts.routes.js";
import authRoutes from "./api/routes/auth.routes.js";
import cloudsRoutes from "./api/routes/clouds.routes.js";
import healthRoutes from "./api/routes/health.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// Public routes
app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api", authMiddleware);
app.use("/api/alerts", alertsRoutes);
app.use("/api/clouds", cloudsRoutes);

// 404 + error handlers
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const server = app.listen(env.PORT, () => {
  logger.info(`Backend listening on http://localhost:${env.PORT}`);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down...");
  server.close(() => process.exit(0));
});