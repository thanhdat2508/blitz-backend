export type Role = "top" | "jungle" | "mid" | "adc" | "support";

export type Tier =
  | "ALL"
  | "IRON"
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "EMERALD+"
  | "DIAMOND+"
  | "MASTER+";

export type TierRank = "S+" | "S" | "A" | "B" | "C" | "D";
export type TrendDirection = "up" | "down" | "neutral";

export interface RolePlayRate {
  role: Role;
  pickRate: number;
  isPrimary: boolean;
}

export interface ChampionOverview {
  id: number;
  key: string;
  name: string;
  title: string;
  avatarUrl: string;
  splashUrl: string;
  role: Role;
  availableRoles: RolePlayRate[];
  tier: Tier;
  region: string;
  patch: string;
  tierRank: TierRank;
  winRate: number;
  pickRate: number;
  banRate: number;
  gamesPlayed: number;
}

export interface PreviousPatchStats {
  patch: string;
  winRate: number;
  winRateDiff: number;
  trend: TrendDirection;
  gamesPlayed: number;
}

export interface DamageBreakdown {
  physical: number;
  magic: number;
  trueDamage: number;
}

export interface StatShards {
  offense: number;
  flex: number;
  defense: number;
}

export interface RuneSetup {
  primaryStyleId: number;
  primaryStyleName: string;
  keystoneId: number;
  selectedPerkIds: number[];
  subStyleId: number;
  subStyleName: string;
  subPerkIds: number[];
  statShards: StatShards;
  winRate: number;
  pickRate: number;
}

export interface ItemSet {
  itemIds: number[];
  winRate: number;
  pickRate: number;
  gamesPlayed: number;
}

export interface SpellPair {
  spell1Id: number;
  spell2Id: number;
  winRate: number;
  pickRate: number;
}

export interface AbilityDetail {
  key: "P" | "Q" | "W" | "E" | "R";
  name: string;
  description: string;
  iconUrl: string;
}

export interface ChampionAbilities {
  passive: AbilityDetail;
  q: AbilityDetail;
  w: AbilityDetail;
  e: AbilityDetail;
  r: AbilityDetail;
}

export interface SkillPriority {
  maxOrder: string[];
  progression: string[];
  winRate: number;
  pickRate: number;
}

export interface MatchupEntry {
  championId: number;
  name: string;
  key: string;
  avatarUrl: string;
  winRate: number;
  gamesPlayed: number;
}

export interface SimilarChampion {
  championId: number;
  name: string;
  key: string;
  avatarUrl: string;
}

export interface ChampionInsights {
  general: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface ChampionBuildPayload {
  overview: ChampionOverview;
  previousPatch: PreviousPatchStats;
  damageBreakdown: DamageBreakdown;
  spells: SpellPair[];
  runes: {
    mostPopular: RuneSetup;
    highestWinRate: RuneSetup;
  };
  skills: SkillPriority;
  abilities: ChampionAbilities;
  items: {
    starting: ItemSet[];
    early: ItemSet[];
    core: ItemSet[];
    completed: ItemSet[];
    buildOrder: number[];
    boots: ItemSet[];
    situational: ItemSet[];
    trinkets: ItemSet[];
  };
  matchups: {
    bestAgainst: MatchupEntry[];
    worstAgainst: MatchupEntry[];
    strongAgainst?: MatchupEntry[];
    weakAgainst?: MatchupEntry[];
  };
  similarChampions: SimilarChampion[];
  insights: ChampionInsights;
}
