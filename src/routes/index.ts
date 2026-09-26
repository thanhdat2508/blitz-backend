import { Router } from "express";
import authRoutes from "./auth.routes";
import cacheRoutes from "./cache.routes";
import cryptoRoutes from "./crypto.routes";
import championBuildRoutes from "../modules/champion-build/routes/champion-build.routes";

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

export default router;

