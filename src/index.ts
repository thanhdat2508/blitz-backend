import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app";
import { connectRedis, redisClient } from "./config/redis";
import prisma from "./config/database";

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  const app = createApp();

  // Connect to Redis in the background
  await connectRedis();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📚 Health check at http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      console.log("HTTP server closed.");

      try {
        if (redisClient.isOpen) {
          await redisClient.quit();
          console.log("Redis client disconnected.");
        }
      } catch (err) {
        console.error("Error closing Redis client:", err);
      }

      try {
        await prisma.$disconnect();
        console.log("Prisma client disconnected.");
      } catch (err) {
        console.error("Error closing Prisma client:", err);
      }

      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
