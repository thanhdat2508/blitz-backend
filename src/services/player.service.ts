import { riotClientService, RiotClientService } from "./riot-client.service";
import { redisClient } from "../config/redis";
import {
  REGION_MAPPING,
  CACHE_TTL,
  DDRAGON_BASE_URL,
  DEFAULT_DDRAGON_VERSION
} from "../config/riot";
import {
  PlayerProfileResponse,
  CleanRankInfo,
  RiotLeagueEntryDTO,
  RiotMatchDTO,
  CleanMatchSummary,
  CleanChampionPerformance,
  CleanParticipantDTO,
  CleanMatchItemDTO
} from "../types/riot.types";

export class PlayerService {
  constructor(private readonly riotClient: RiotClientService = riotClientService) { }

  private readonly spellMap: Record<number, string> = {
    1: "SummonerBoost",
    3: "SummonerExhaust",
    4: "SummonerFlash",
    6: "SummonerHaste",
    7: "SummonerHeal",
    11: "SummonerSmite",
    12: "SummonerTeleport",
    13: "SummonerMana",
    14: "SummonerDot",
    21: "SummonerBarrier",
    32: "SummonerSnowball",
  };

  private getQueueName(queueId: number): string {
    switch (queueId) {
      case 420:
        return "Ranked Solo";
      case 440:
        return "Ranked Flex";
      case 450:
        return "ARAM";
      case 400:
      case 430:
      case 490:
        return "Normal";
      case 1700:
        return "Arena";
      default:
        return "Special Mode";
    }
  }

  private formatDuration(durationSeconds: number): string {
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = Math.floor(durationSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  private formatTimeAgo(timestampMs: number): string {
    const diffMs = Date.now() - timestampMs;
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 60) {
      return `${Math.max(1, diffMinutes)} Mins Ago`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} Hours Ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      return "Yesterday";
    }
    return `${diffDays} Days Ago`;
  }

  private formatMatchSummary(
    match: RiotMatchDTO,
    puuid: string,
    ddragonVersion: string
  ): CleanMatchSummary {
    const participant =
      match.info.participants.find((p) => p.puuid === puuid) ||
      match.info.participants[0];

    const durationMinutes = Math.max(1, match.info.gameDuration / 60);
    const totalCs = participant.totalMinionsKilled + participant.neutralMinionsKilled;
    const csPerMinute = (totalCs / durationMinutes).toFixed(1);
    const gpm = Math.round(participant.goldEarned / durationMinutes);
    const kdaRatio =
      participant.deaths === 0
        ? "Perfect"
        : ((participant.kills + participant.assists) / participant.deaths).toFixed(1);

    const spells = [participant.summoner1Id, participant.summoner2Id].map((id) => ({
      id,
      iconUrl: `${DDRAGON_BASE_URL}/cdn/${ddragonVersion}/img/spell/${this.spellMap[id] || "SummonerFlash"}.png`,
    }));

    const primaryKeystoneId =
      participant.perks?.styles?.[0]?.selections?.[0]?.perk || null;
    const secondaryStyleId = participant.perks?.styles?.[1]?.style || null;

    const items: CleanMatchItemDTO[] = [
      participant.item0,
      participant.item1,
      participant.item2,
      participant.item3,
      participant.item4,
      participant.item5,
      participant.item6,
    ].map((id, slot) => ({
      slot,
      id,
      iconUrl: id > 0 ? `${DDRAGON_BASE_URL}/cdn/${ddragonVersion}/img/item/${id}.png` : null,
    }));

    // Retain only name and champion icon for other match participants
    const participants: CleanParticipantDTO[] = match.info.participants.map((p) => ({
      riotId: p.riotIdGameName
        ? `${p.riotIdGameName}#${p.riotIdTagline || ""}`
        : p.summonerName || "Unknown",
      championIconUrl: `${DDRAGON_BASE_URL}/cdn/${ddragonVersion}/img/champion/${p.championName}.png`,
      teamId: p.teamId,
      isCurrentPlayer: p.puuid === puuid,
    }));

    return {
      matchId: match.metadata.matchId,
      win: participant.win,
      queueType: this.getQueueName(match.info.queueId),
      gameDuration: this.formatDuration(match.info.gameDuration),
      gameCreation: match.info.gameCreation,
      timeAgo: this.formatTimeAgo(match.info.gameCreation),
      champion: {
        id: participant.championId,
        name: participant.championName,
        iconUrl: `${DDRAGON_BASE_URL}/cdn/${ddragonVersion}/img/champion/${participant.championName}.png`,
      },
      stats: {
        kdaRatio: `${kdaRatio} KDA`,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        cs: totalCs,
        csPerMinute: `${csPerMinute} CS/Min.`,
        gpm,
      },
      spells,
      runes: {
        primaryKeystoneId,
        secondaryStyleId,
      },
      items,
      participants,
    };
  }


  // Calculates champion performance aggregated directly from the recent matches (10 matches)
  private calculateRecentChampionPerformance(
    matches: RiotMatchDTO[],
    puuid: string,
    ddragonVersion: string,
    championMap: Record<string, string>
  ): CleanChampionPerformance[] {
    const statsMap = new Map<
      number,
      {
        championId: number;
        championName: string;
        kills: number;
        deaths: number;
        assists: number;
        wins: number;
        gamesPlayed: number;
      }
    >();

    for (const match of matches) {
      const p = match.info.participants.find((part) => part.puuid === puuid);
      if (!p) continue;

      const champName = p.championName || championMap[String(p.championId)] || `Champion_${p.championId}`;
      const existing = statsMap.get(p.championId) || {
        championId: p.championId,
        championName: champName,
        kills: 0,
        deaths: 0,
        assists: 0,
        wins: 0,
        gamesPlayed: 0,
      };

      existing.kills += p.kills;
      existing.deaths += p.deaths;
      existing.assists += p.assists;
      existing.gamesPlayed += 1;
      if (p.win) existing.wins += 1;

      statsMap.set(p.championId, existing);
    }

    const performanceList: CleanChampionPerformance[] = Array.from(statsMap.values()).map((stat) => {
      const losses = stat.gamesPlayed - stat.wins;
      const winRate = Math.round((stat.wins / stat.gamesPlayed) * 100);
      const kdaRatio = stat.deaths === 0
        ? "Perfect"
        : `${((stat.kills + stat.assists) / stat.deaths).toFixed(1)} KDA`;

      return {
        championId: stat.championId,
        championName: stat.championName,
        championIconUrl: `${DDRAGON_BASE_URL}/cdn/${ddragonVersion}/img/champion/${stat.championName}.png`,
        gamesPlayed: stat.gamesPlayed,
        wins: stat.wins,
        losses,
        winRate,
        kdaRatio,
      };
    });

    // Enforce strict descending order: most played in recent 10 matches on top, then highest win rate
    return performanceList.sort(
      (a, b) => b.gamesPlayed - a.gamesPlayed || b.winRate - a.winRate
    );
  }

  // Generates a normalized Redis key for player profile caching
  private getCacheKey(region: string, gameName: string, tagLine: string): string {
    return `player:${region.toLowerCase()}:${gameName.toLowerCase().replace(/\s+/g, "")}:${tagLine.toLowerCase()}`;
  }

  // Normalizes raw Riot league entries into clean Solo/Duo and Flex stats
  private formatRanks(entries: RiotLeagueEntryDTO[]): {
    solo: CleanRankInfo | null;
    flex: CleanRankInfo | null;
  } {
    let solo: CleanRankInfo | null = null;
    let flex: CleanRankInfo | null = null;

    for (const entry of entries) {
      const totalGames = entry.wins + entry.losses;
      const winRate = totalGames > 0 ? Math.round((entry.wins / totalGames) * 100) : 0;

      const cleanInfo: CleanRankInfo = {
        queueType: entry.queueType as any,
        queueName: entry.queueType === "RANKED_SOLO_5x5" ? "Solo/Duo" : "Flex",
        tier: entry.tier,
        rank: entry.rank,
        lp: entry.leaguePoints,
        wins: entry.wins,
        losses: entry.losses,
        winRate,
      };

      if (entry.queueType === "RANKED_SOLO_5x5") {
        solo = cleanInfo;
      } else if (entry.queueType === "RANKED_FLEX_SR") {
        flex = cleanInfo;
      }
    }

    return { solo, flex };
  }

  // Retrieves player profile, champion performance, and recent matches with Redis caching
  async getPlayerProfile(
    gameName: string,
    tagLine: string,
    region: string,
    forceRefresh = false
  ): Promise<PlayerProfileResponse> {
    const regionKey = region.toLowerCase();
    const regionConfig = REGION_MAPPING[regionKey];

    if (!regionConfig) {
      throw new Error(`Region '${region}' is not supported. Supported regions: ${Object.keys(REGION_MAPPING).join(", ")}`);
    }

    const cacheKey = this.getCacheKey(regionKey, gameName, tagLine);

    // 1. Check Redis Cache first (unless forceRefresh is requested)
    if (!forceRefresh && redisClient.isOpen) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          const parsed = JSON.parse(cachedData) as PlayerProfileResponse;
          return {
            ...parsed,
            fromCache: true,
          };
        }
      } catch (err: any) {
        console.warn(`[Redis Cache Warning] Failed to read cache: ${err.message}`);
      }
    }

    // 2. Cache MISS: Query upstream Riot API
    // Step 2.1: Look up account PUUID via Account-V1
    const account = await this.riotClient.getAccountByRiotId(
      gameName,
      tagLine,
      regionConfig.regional
    );

    // Step 2.2: Concurrently fetch Summoner, League, DDragon version, Match IDs and Champion Map
    const [summoner, leagueEntries, ddragonVersion, matchIds, championMap] = await Promise.all([
      this.riotClient.getSummonerByPuuid(account.puuid, regionConfig.platform),
      this.riotClient.getLeagueEntriesByPuuid(account.puuid, regionConfig.platform),
      this.riotClient.getLatestDDragonVersion(),
      this.riotClient
        .getMatchIdsByPuuid(account.puuid, regionConfig.regional, 10)
        .catch((err) => {
          console.warn(`[Match-V5 Warning] Failed to fetch match IDs: ${err.message}`);
          return [] as string[];
        }),
      this.riotClient.getChampionMap(),
    ]);

    // Step 2.3: Fetch match details with per-match Redis caching (TTL: 30 days)
    const matchDetails = await Promise.all(
      matchIds.map(async (matchId) => {
        const matchCacheKey = `match:${matchId}`;
        if (redisClient.isOpen) {
          try {
            const cachedMatch = await redisClient.get(matchCacheKey);
            if (cachedMatch) {
              return JSON.parse(cachedMatch) as RiotMatchDTO;
            }
          } catch {
            // Ignore Redis read error and fallback to Riot API
          }
        }

        try {
          const match = await this.riotClient.getMatchById(matchId, regionConfig.regional);
          if (redisClient.isOpen) {
            await redisClient
              .set(matchCacheKey, JSON.stringify(match), {
                EX: CACHE_TTL.MATCH_DETAILS,
              })
              .catch(() => { });
          }
          return match;
        } catch (err: any) {
          console.warn(`[Match-V5 Warning] Failed to fetch match ${matchId}: ${err.message}`);
          return null;
        }
      })
    );

    const validMatches = matchDetails.filter((m): m is RiotMatchDTO => m !== null);
    const recentMatches = validMatches.map((m) =>
      this.formatMatchSummary(m, account.puuid, ddragonVersion)
    );

    // 3. Transform and sanitize response payload
    const ranks = this.formatRanks(leagueEntries);
    const championPerformance = this.calculateRecentChampionPerformance(
      validMatches,
      account.puuid,
      ddragonVersion,
      championMap
    );
    const profileIconUrl = `${DDRAGON_BASE_URL}/cdn/${ddragonVersion}/img/profileicon/${summoner.profileIconId}.png`;

    const result: PlayerProfileResponse = {
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
      riotId: `${account.gameName}#${account.tagLine}`,
      region: regionKey,
      regionName: regionConfig.displayName,
      summonerLevel: summoner.summonerLevel,
      profileIconId: summoner.profileIconId,
      profileIconUrl,
      ranks,
      championPerformance,
      recentMatches,
      cachedAt: new Date().toISOString(),
      fromCache: false,
    };

    // 4. Store result in Redis Cache with 5-minute TTL
    if (redisClient.isOpen) {
      try {
        await redisClient.set(cacheKey, JSON.stringify(result), {
          EX: CACHE_TTL.PLAYER_PROFILE,
        });
      } catch (err: any) {
        console.warn(`[Redis Cache Warning] Failed to store cache: ${err.message}`);
      }
    }

    return result;
  }
}

export const playerService = new PlayerService();
