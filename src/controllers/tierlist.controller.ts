import { Request, Response } from "express";
import { tierListService, TierListService } from "../services/tierlist.service";
import {
  RankTier,
  RoleType,
  SortOrder,
  TierListQueryParams,
  TierListSortBy,
} from "../types/tierlist.types";

const VALID_ROLES = new Set<RoleType>(["all", "top", "jungle", "mid", "ad", "sp"]);
const VALID_RANKS = new Set<RankTier>([
  "all",
  "iron",
  "bronze",
  "silver",
  "gold",
  "platinum",
  "emerald",
  "diamond",
  "master",
  "grandmaster",
  "challenger",
]);
const VALID_SORT_BY = new Set<TierListSortBy>([
  "winRate",
  "rank",
  "pickRate",
  "banRate",
  "matches",
  "patchWrChange",
]);

export class TierListController {
  constructor(private readonly service: TierListService = tierListService) {}

  // GET /api/champions/tier-list
  getTierList = async (req: Request, res: Response): Promise<void> => {
    try {
      const rawRole = (req.query.role as string)?.toLowerCase();
      let rawRank = (req.query.rank as string)?.toLowerCase();
      if (rawRank === "grand_master") {
        rawRank = "grandmaster";
      }
      const rawSortBy = req.query.sortBy as string;
      const rawOrder = (req.query.order as string)?.toLowerCase();
      const rawSearch = req.query.search as string | undefined;

      // 1. Boundary Validation: Fallback to safe defaults if inputs are outside whitelist
      const role: RoleType = VALID_ROLES.has(rawRole as RoleType)
        ? (rawRole as RoleType)
        : "all";

      const rank: RankTier = VALID_RANKS.has(rawRank as RankTier)
        ? (rawRank as RankTier)
        : "emerald";

      const sortBy: TierListSortBy = VALID_SORT_BY.has(rawSortBy as TierListSortBy)
        ? (rawSortBy as TierListSortBy)
        : "winRate";

      const order: SortOrder = rawOrder === "asc" ? "asc" : "desc";

      // 2. Sanitize search term (truncate to max 50 chars, strip illegal characters to prevent ReDoS)
      let search: string | undefined = undefined;
      if (rawSearch && typeof rawSearch === "string") {
        search = rawSearch
          .slice(0, 50)
          .replace(/[^a-zA-Z0-9\s'.-]/g, "")
          .trim();
      }

      const params: TierListQueryParams = {
        role,
        rank,
        sortBy,
        order,
        search,
      };

      // 3. Delegate to service layer
      const response = await this.service.getTierList(params);

      res.status(200).json(response);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Internal server error";
      console.error("[TierListController Error]:", error);
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  };
}

export const tierListController = new TierListController();
