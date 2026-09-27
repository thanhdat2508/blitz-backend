import { Request, Response } from "express";
import { proPlayerService, ProPlayerService } from "../services/pro-player.service";

export class ProPlayerController {
  constructor(private readonly service: ProPlayerService = proPlayerService) {}

  // GET /api/pro-players
  getHighlights = async (_req: Request, res: Response): Promise<void> => {
    try {
      const players = await this.service.getHighlights();
      res.status(200).json({
        success: true,
        count: players.length,
        data: players,
      });
    } catch (error: any) {
      console.error("[ProPlayerController Error]:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to retrieve pro players",
      });
    }
  };

  // GET /api/pro-players/:slug
  getBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
      const slug = req.params.slug as string;
      const player = await this.service.getPlayerBySlug(slug);

      if (!player) {
        res.status(404).json({
          success: false,
          error: `Player with slug '${slug}' not found`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: player,
      });
    } catch (error: any) {
      console.error("[ProPlayerController Error]:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to retrieve player",
      });
    }
  };
}

export const proPlayerController = new ProPlayerController();
