import { Router, Request, Response } from "express";
import { redisClient } from "../config/redis";

const router = Router();

// Demo: Set key-value in Redis
router.post("/set", async (req: Request, res: Response): Promise<void> => {
  try {
    const { key, value, ttlInSeconds } = req.body;

    if (!key || value === undefined) {
      res.status(400).json({ error: "key and value are required" });
      return;
    }

    if (!redisClient.isOpen) {
      res.status(503).json({ error: "Redis is not connected. Start Redis via docker compose up -d" });
      return;
    }

    const valString = typeof value === "object" ? JSON.stringify(value) : String(value);

    if (ttlInSeconds && Number(ttlInSeconds) > 0) {
      await redisClient.set(key, valString, { EX: Number(ttlInSeconds) });
    } else {
      await redisClient.set(key, valString);
    }

    res.json({ message: "Key stored in Redis successfully", key, ttl: ttlInSeconds || null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Demo: Get value from Redis
router.get("/get/:key", async (req: Request, res: Response): Promise<void> => {
  try {
    const key = String(req.params.key);

    if (!redisClient.isOpen) {
      res.status(503).json({ error: "Redis is not connected. Start Redis via docker compose up -d" });
      return;
    }

    const value = await redisClient.get(key);
    if (value === null) {
      res.status(404).json({ error: `Key '${key}' not found in Redis` });
      return;
    }

    let parsedValue = value;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      // String value
    }

    res.json({ key, value: parsedValue });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Demo: Delete key from Redis
router.delete("/delete/:key", async (req: Request, res: Response): Promise<void> => {
  try {
    const key = String(req.params.key);

    if (!redisClient.isOpen) {
      res.status(503).json({ error: "Redis is not connected. Start Redis via docker compose up -d" });
      return;
    }

    const deletedCount = await redisClient.del(key);
    res.json({ message: `Key '${key}' deleted`, deletedCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
