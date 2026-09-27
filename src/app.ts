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
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
          users: "GET /api/auth/users",
        },
        cache: {
          set: "POST /api/cache/set",
          get: "GET /api/cache/get/:key",
          delete: "DELETE /api/cache/delete/:key",
        },
        champions: {
          build: "GET /api/champions/:champion/build/:role?tier=EMERALD+&region=WORLD&patch=14.24",
        },
        player: {
          getProfile: "GET /api/player?gameName=:gameName&tagLine=:tagLine&region=:region",
          refreshProfile: "POST /api/player/refresh",
        },
        posts: {
          create: "POST /api/posts (or /api/posts/create)",
          list: "GET /api/posts?page=1&limit=10&status=PUBLISHED&tag=...&search=...",
          me: "GET /api/posts/me",
          detail: "GET /api/posts/:slug",
          related: "GET /api/posts/:slug/related?limit=3",
          update: "PATCH /api/posts/:id",
          archive: "DELETE /api/posts/:id",
          restore: "POST /api/posts/:id/restore",
        },
      },
    });
  });

  app.use("/api", apiRoutes);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Route not found" });
  });

  app.use((err: Error & { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    if (statusCode >= 500) {
      console.error("Unhandled error:", err);
    }

    res.status(statusCode).json({
      success: false,
      error: err.name || "Error",
      message: err.message,
    });
  });

  return app;
};

export default createApp;