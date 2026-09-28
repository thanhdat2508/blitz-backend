import { Request, Response } from "express";
import { searchService, SearchService } from "../services/search.service";

export class SearchController {
  constructor(private readonly service: SearchService = searchService) {}

  /**
   * GET /api/search?q=...&region=...&limit=...
   */
  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const rawQuery = (req.query.q as string) || (req.query.keyword as string) || "";
      const region = (req.query.region as string) || "vn2";
      const rawLimit = Number(req.query.limit) || 6;

      // Sanitize limit (between 1 and 20)
      const limit = Math.max(1, Math.min(20, rawLimit));

      // Sanitize query to prevent ReDoS or query injection
      const sanitizedQuery = rawQuery.replace(/[\x00-\x1F\x7F]/g, "").trim().slice(0, 100);

      if (!sanitizedQuery) {
        res.status(200).json({
          success: true,
          data: {
            query: "",
            region,
            totalMatches: 0,
            champions: [],
            proPlayers: [],
            posts: [],
          },
        });
        return;
      }

      const results = await this.service.search(sanitizedQuery, region, limit);

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error: any) {
      console.error("[SearchController] Error in global search:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error occurred while searching",
      });
    }
  };
}

export const searchController = new SearchController();
