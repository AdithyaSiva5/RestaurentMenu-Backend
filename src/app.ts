// src/app.ts
import express from "express";
import {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express-serve-static-core";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import config from "./config/env";
import authRoutes from "./routes/auth.routes";
import waitingListRoutes from "./routes/waitingList.routes";
import { errorHandler } from "./middleware/errorHandler";
import {
  advancedRateLimiter,
  deviceFingerprint,
  requestLogger,
  securityHeaders,
} from "./middleware/security.middleware";

const app = express();

// Basic middleware
app.use(helmet());
app.use(
  cors({
    origin: true, // This will automatically accept the origin that sent the request
    credentials: true, // Important for authentication
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(compression());
app.use(
  express.json({
    limit: "10kb",
    strict: true,
    verify: (req: Request, res: Response, buffer: Buffer) => {
      try {
        JSON.parse(buffer.toString());
      } catch (e) {
        res.status(400).json({
          success: false,
          message: "Invalid JSON format",
        });
        throw new Error("Invalid JSON");
      }
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Security middleware
app.use(securityHeaders);
app.use(deviceFingerprint);
app.use(requestLogger);
app.use(advancedRateLimiter);

// Logging
if (config.server.env !== "test") {
  app.use(morgan("combined"));
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/waiting-list", waitingListRoutes);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("API is running 😊");
});

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

// Error handling
app.use(errorHandler as ErrorRequestHandler);

export default app;
