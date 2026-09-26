import { Router } from "express";
import { championBuildController } from "../controllers/champion-build.controller";

const router = Router();

router.get("/:champion/build", championBuildController.getBuild);
router.get("/:champion/build/:role", championBuildController.getBuild);

export default router;
