import { Request, Response, NextFunction } from "express";
import { ChampionBuildValidator } from "../dto/get-champion-build.dto";
import { championBuildService, ChampionBuildService } from "../services/champion-build.service";

export class ChampionBuildController {
  constructor(private readonly service: ChampionBuildService = championBuildService) {}

  public getBuild = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = ChampionBuildValidator.validate(req.params, req.query);

      const data = await this.service.getChampionBuild(
        validated.champion,
        validated.role,
        validated.tier,
        validated.region,
        validated.patch
      );

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const championBuildController = new ChampionBuildController();
