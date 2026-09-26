import { Router } from "express";
import { tierListController } from "../controllers/tierlist.controller";

const router = Router();

// GET /api/champions/tier-list?rank=...&role=...&search=...&sortBy=...&order=...
router.get("/tier-list", tierListController.getTierList);

export default router;
