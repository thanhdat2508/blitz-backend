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
  id: string;
  key: string;
  name: string;
  title: string;
  primaryClass?: string;
  tags?: string[];
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

export type StatShardRowType = "offense" | "flex" | "defense";

export interface StatShardOption {
  id: number;
  code: string;
  name: string;
  description: string;
  iconUrl: string;
  isSelected: boolean;
}

export interface StatShardRow {
  row: number;
  type: StatShardRowType;
  selectedId: number;
  options: StatShardOption[];
}

export interface StatShards {
  offense: number;
  flex: number;
  defense: number;
  slots: [number, number, number];
  rows: StatShardRow[];
}

export interface RuneStyleOption {
  id: number;
  name: string;
  iconUrl: string;
  isSelected: boolean;
}

export interface RuneSetup {
  primaryStyleId: number;
  primaryStyleName: string;
  primaryStyles: RuneStyleOption[];
  keystoneId: number;
  selectedPerkIds: number[];
  subStyleId: number;
  subStyleName: string;
  subStyles: RuneStyleOption[];
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

export interface ChampionRunes {
  mostPopular: RuneSetup;
  highestWinRate: RuneSetup;
}

export interface ChampionItems {
  starting: ItemSet[];
  early: ItemSet[];
  core: ItemSet[];
  completed: ItemSet[];
  buildOrder: number[];
  boots: ItemSet[];
  situational: ItemSet[];
  trinkets: ItemSet[];
}

export interface ChampionMatchups {
  bestAgainst: MatchupEntry[];
  worstAgainst: MatchupEntry[];
  strongAgainst?: MatchupEntry[];
  weakAgainst?: MatchupEntry[];
}

export interface InsightItem {
  text: string;
  abilityKeys: ("P" | "Q" | "W" | "E" | "R")[];
  targetChampionKey?: string;
}

export interface ChampionInsights {
  general: string[];
  strengths: string[];
  weaknesses: string[];
  structured?: {
    general: InsightItem[];
    strengths: InsightItem[];
    weaknesses: InsightItem[];
  };
}

export interface ChampionBuildPayload {
  overview: ChampionOverview;
  previousPatch: PreviousPatchStats;
  damageBreakdown: DamageBreakdown;
  spells: SpellPair[];
  runes: ChampionRunes;
  skills: SkillPriority;
  abilities: ChampionAbilities;
  items: ChampionItems;
  matchups: ChampionMatchups;
  similarChampions: SimilarChampion[];
  insights: ChampionInsights;
}
