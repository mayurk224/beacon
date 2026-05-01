import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "../routes/auth.routes.js";
import { setupLogger } from "../utils/logger.js";
import config from "../config/config.js";

const app = express();

// HTTP Request Logger
setupLogger(app);

// Security Headers
app.use(helmet());

// Cookie Parser
app.use(cookieParser());

// Middleware to parse JSON bodies
app.use(express.json({ limit: "10kb" })); // Limit body size to prevent DoS

// Middleware to handle URL-encoded data
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(
  cors({
    origin: "http://localhost:5173", // Your React app URL
    credentials: true, // CRITICAL: Allows cookies to be sent
  }),
);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is awake" });
});

// Import and use the auth routes
app.use("/api/auth", authRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: config.NODE_ENV === "development" ? err : {},
  });
});

export default app;
