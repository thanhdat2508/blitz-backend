import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import apiRoutes from "./routes";

export const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root endpoint
  app.get("/", (_req: Request, res: Response) => {
    res.json({
      name: "group-backend API",
      version: "1.0.0",
      description: "Express.js 5 + PostgreSQL + Prisma + Redis + bcrypt + crypto",
      endpoints: {
        health: "GET /api/health",
        auth: {
          register: "POST /api/auth/register",
          login: "POST /api/auth/login",
          users: "GET /api/auth/users",
        },
        cache: {
          set: "POST /api/cache/set",
          get: "GET /api/cache/get/:key",
          delete: "DELETE /api/cache/delete/:key",
        },
        crypto: {
          generate: "GET /api/crypto/generate",
          hash: "POST /api/crypto/hash",
          encrypt: "POST /api/crypto/encrypt",
          decrypt: "POST /api/crypto/decrypt",
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
