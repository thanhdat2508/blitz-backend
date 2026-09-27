import { Router } from "express";
import { proPlayerController } from "../controllers/pro-player.controller";

const router = Router();

// GET /api/pro-players - Danh sách 3 thành viên demo pro-player kèm ván đấu gần nhất
router.get("/", proPlayerController.getHighlights);

// GET /api/pro-players/:slug - Chi tiết 1 người chơi theo slug
router.get("/:slug", proPlayerController.getBySlug);

export default router;
