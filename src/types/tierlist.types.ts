export type RoleType = "all" | "top" | "jungle" | "mid" | "ad" | "sp";

export type ChampionRole = Exclude<RoleType, "all">;

export type RankTier =
  | "all"
  | "iron"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "emerald"
  | "diamond"
  | "master"
  | "grandmaster"
  | "challenger";

export type TierGrade = "S" | "A" | "B" | "C" | "D";

export type TierListSortBy =
  | "winRate"
  | "rank"
  | "pickRate"
  | "banRate"
  | "matches"
  | "patchWrChange";

export type SortOrder = "asc" | "desc";

export interface TierListQueryParams {
  rank?: RankTier;
  role?: RoleType;
  tier?: TierGrade | "all";
  search?: string;
  sortBy?: TierListSortBy;
  order?: SortOrder;
  page?: number;
  limit?: number;
}

export interface ChampionTierItem {
  rank: number;
  championId: string;
  name: string;
  role: ChampionRole;
  tier: TierGrade;
  winRate: number;
  patchWrChange: number;
  banRate: number;
  pickRate: number;
  matches: number;
  avatarUrl: string;
}

export interface TierListResponse {
  success: boolean;
  patch: string;
  rank: RankTier;
  role: RoleType;
  tier?: string;
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  tierCounts?: Record<string, number>;
  data: ChampionTierItem[];
}
