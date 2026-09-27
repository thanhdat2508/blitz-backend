import { Request, Response } from "express";
import { playerService, PlayerService } from "../services/player.service";
import { RiotApiError } from "../types/riot.types";

export class PlayerController {
  constructor(private readonly service: PlayerService = playerService) {}

  // GET /api/player?gameName=:gameName&tagLine=:tagLine&region=:region
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const gameName = req.query.gameName as string;
      const tagLine = req.query.tagLine as string;
      const region = (req.query.region as string) || "vn2";
      const forceRefresh =
        req.query.refresh === "true" || req.query.forceRefresh === "true";

      // 1. Boundary Validation: Ensure mandatory parameters are provided
      if (!gameName || !tagLine) {
        res.status(400).json({
          success: false,
          error:
            "Please provide both 'gameName' and 'tagLine' query parameters",
        });
        return;
      }

      // 2. Delegate to service layer
      const data = await this.service.getPlayerProfile(
        gameName,
        tagLine,
        region,
        forceRefresh,
      );

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  // POST /api/player/refresh - Body: { gameName: string, tagLine: string, region: string }
  refreshProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { gameName, tagLine, region = "vn2" } = req.body;

      if (!gameName || !tagLine) {
        res.status(400).json({
          success: false,
          error: "'gameName' and 'tagLine' are required in the request body",
        });
        return;
      }

      // Force refresh = true bypasses Redis cache and pulls fresh data from Riot API
      const data = await this.service.getPlayerProfile(
        gameName,
        tagLine,
        region,
        true,
      );

      res.status(200).json({
        success: true,
        message: "Player profile refreshed successfully from Riot Games",
        data,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  // Centralized HTTP error handler mapping domain errors to HTTP response status
  private handleError(res: Response, error: any): void {
    if (error instanceof RiotApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        retryAfter: error.retryAfterSeconds,
      });
      return;
    }

    console.error("[PlayerController Error]:", error);
    res.status(500).json({
      success: false,
      error:
        error.message ??
        "Internal server error while processing player profile",
    });
  }
}

export const playerController = new PlayerController();
