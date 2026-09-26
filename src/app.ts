import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "./routes";

export const createApp = (): Application => {
  const app = express();

  // Middleware
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  app.use(
    cors({
      origin: [frontendUrl, "http://localhost:3000", "http://localhost:5173"],
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root endpoint
  app.get("/", (_req: Request, res: Response) => {
    res.json({
      name: "blitz-backend API",
      version: "1.0.0",
      description: "Express.js 5 + PostgreSQL + Prisma + Redis + JWT + OAuth (Google & Riot)",
      endpoints: {
        health: "GET /api/health",
        auth: {
          register: "POST /api/auth/register",
          verify: "POST /api/auth/verify",
          resendOtp: "POST /api/auth/resend-otp (or /resend/otp-register)",
          login: "POST /api/auth/login",
          validate: "POST /api/auth/validate",
          resetPassword: "POST /api/auth/reset-password",
          resetPasswordVerify: "POST /api/auth/reset-password/verify",
          resendResetOtp: "POST /api/auth/resend/otp-reset-password",
          updatePassword: "POST /api/auth/update-password",
          google: "GET /api/auth/google",
          riot: "GET /api/auth/riot",
          refresh: "POST /api/auth/refresh",
          logout: "POST /api/auth/logout (supports isLogoutAll, sessionId)",
          me: "GET /api/auth/me",
        },
        player: {
          getProfile: "GET /api/player?gameName=:gameName&tagLine=:tagLine&region=:region",
          refreshProfile: "POST /api/player/refresh",
        },
      },
    });
  });

  // Mount API router
  app.use("/api", apiRoutes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Route not found" });
  });

  // Global Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  });

  return app;
};

export default createApp;