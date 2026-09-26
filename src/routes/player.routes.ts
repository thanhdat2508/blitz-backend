import { Router } from "express";
import { playerController } from "../controllers/player.controller";

const router = Router();

// GET /api/player?gameName=...&tagLine=...&region=...
router.get("/", playerController.getProfile);

// POST /api/player/refresh
router.post("/refresh", playerController.refreshProfile);

export default router;
