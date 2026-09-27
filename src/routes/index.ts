import { Router } from "express";
import authRoutes from "./auth.routes";
import cacheRoutes from "./cache.routes";
import cryptoRoutes from "./crypto.routes";
import championBuildRoutes from "../modules/champion-build/routes/champion-build.routes";
import playerRoutes from "./player.routes";
import tierListRoutes from "./tierlist.routes";
import proPlayerRoutes from "./pro-player.routes";
import postRoutes from "./post.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.use("/auth", authRoutes);
router.use("/cache", cacheRoutes);
router.use("/crypto", cryptoRoutes);
router.use("/champions", championBuildRoutes);
router.use("/player", playerRoutes);
router.use("/champions", tierListRoutes);
router.use("/pro-players", proPlayerRoutes);
router.use("/posts", postRoutes);

export default router;

