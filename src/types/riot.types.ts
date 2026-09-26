// DTO from Riot Account-V1: /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
export interface RiotAccountDTO {
  puuid: string;
  gameName: string;
  tagLine: string;
}

// DTO from Riot Summoner-V4: /lol/summoner/v4/summoners/by-puuid/{puuid}
export interface RiotSummonerDTO {
  id?: string;
  accountId?: string;
  puuid: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

// DTO from Riot League-V4: /lol/league/v4/entries/by-puuid/{puuid}
export interface RiotLeagueEntryDTO {
  leagueId?: string;
  queueType: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR" | string;
  tier: string;
  rank: string;
  puuid?: string;
  summonerId?: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

// Normalized rank information sent to client
export interface CleanRankInfo {
  queueType: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR";
  queueName: string; // e.g. "Solo/Duo" or "Flex"
  tier: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
  winRate: number; // Win rate percentage (0 - 100)
}

// Raw participant data from Riot Match-V5
export interface RiotParticipantDTO {
  puuid: string;
  riotIdGameName?: string;
  riotIdTagline?: string;
  summonerName?: string;
  championId: number;
  championName: string;
  teamId: number; // 100: Blue, 200: Red
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  goldEarned: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number; // Trinket slot
  summoner1Id: number;
  summoner2Id: number;
  perks?: {
    statPerks?: { defense: number; flex: number; offense: number };
    styles?: Array<{
      description: string;
      selections: Array<{ perk: number; var1: number; var2: number; var3: number }>;
      style: number;
    }>;
  };
}

// Raw match DTO from Riot Match-V5
export interface RiotMatchDTO {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number; // in seconds
    gameMode: string;
    queueId: number;
    participants: RiotParticipantDTO[];
  };
}

// Simplified participant summary for match cards (only name and champion icon)
export interface CleanParticipantDTO {
  riotId: string;
  championIconUrl: string;
  teamId: number;
  isCurrentPlayer: boolean;
}

export interface RiotChampionMasteryDTO {
  puuid: string;
  championId: number;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
  championSeasonMilestone?: number;
}

// Single item slot in match history
export interface CleanMatchItemDTO {
  slot: number;
  id: number;
  iconUrl: string | null;
}

// Clean match card for match history list
export interface CleanMatchSummary {
  matchId: string;
  win: boolean;
  queueType: string;
  gameDuration: string; // e.g. "32:36"
  gameCreation: number;
  timeAgo: string; // e.g. "6 Hours Ago"
  champion: {
    id: number;
    name: string;
    iconUrl: string;
  };
  stats: {
    kdaRatio: string;
    kills: number;
    deaths: number;
    assists: number;
    cs: number;
    csPerMinute: string; // e.g. "6.4 CS/Min."
    gpm: number; // Gold per minute
  };
  spells: Array<{ id: number; iconUrl: string }>;
  runes: {
    primaryKeystoneId: number | null;
    secondaryStyleId: number | null;
  };
  items: CleanMatchItemDTO[];
  participants: CleanParticipantDTO[];
}

// Champion performance statistics aggregated for the season (streamlined)
export interface CleanChampionPerformance {
  championId: number;
  championName: string;
  championIconUrl: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number; // e.g. 52.9
  kdaRatio: string; // e.g. "1.9 KDA"
}

// Cleaned and optimized player profile response DTO
export interface PlayerProfileResponse {
  puuid: string;
  gameName: string;
  tagLine: string;
  riotId: string;
  region: string;
  regionName: string;
  summonerLevel: number;
  profileIconId: number;
  profileIconUrl: string;
  ranks: {
    solo: CleanRankInfo | null;
    flex: CleanRankInfo | null;
  };
  championPerformance: CleanChampionPerformance[];
  recentMatches: CleanMatchSummary[];
  cachedAt?: string;
  fromCache: boolean;
}

// Standardized domain exception for Riot Games API communication
export class RiotApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly retryAfterSeconds?: number
  ) {
    super(message);
    this.name = "RiotApiError";
  }
}
