import { Router } from "express";
import { searchController } from "../controllers/search.controller";

const router = Router();

// GET /api/search?q=...&region=...&limit=...
router.get("/", searchController.search);

export default router;
