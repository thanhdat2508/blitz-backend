import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import apiRoutes from "./routes";

export const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
        champions: {
          build: "GET /api/champions/:champion/build/:role?tier=EMERALD+&region=WORLD&patch=14.24",
        },
        player: {
          getProfile: "GET /api/player?gameName=:gameName&tagLine=:tagLine&region=:region",
          refreshProfile: "POST /api/player/refresh",
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
