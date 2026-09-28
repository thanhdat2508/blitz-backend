import prisma from "../config/database";
import { redisClient } from "../config/redis";
import { DDRAGON_BASE_URL, DEFAULT_DDRAGON_VERSION } from "../config/riot";
import { CHAMPION_CATALOG } from "../data/champion-catalog";
import { PRO_PLAYERS_DATA } from "../data/pro-players.data";
import {
  ChampionSearchResult,
  ProPlayerSearchResult,
  PostSearchResult,
  SummonerSearchResult,
  GlobalSearchData,
} from "../types/search.types";

export class SearchService {
  private readonly CACHE_TTL_SECONDS = 60; // 1 minute cache for search queries

  /**
   * Search across Champions, Pro Players, Posts, and Summoners
   */
  async search(query: string, region: string = "vn2", limit: number = 6): Promise<GlobalSearchData> {
    const rawQuery = query.trim();
    if (!rawQuery) {
      return {
        query: "",
        region,
        totalMatches: 0,
        champions: [],
        proPlayers: [],
        posts: [],
      };
    }

    const normalized = rawQuery.toLowerCase();
    const cacheKey = `search:${region.toLowerCase()}:${normalized}:${limit}`;

    // 1. Try Redis cache
    if (redisClient.isOpen) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached) as GlobalSearchData;
        }
      } catch (err) {
        console.warn("[SearchService] Redis read failed:", err);
      }
    }

    // 2. Parallel fetch for all domains
    const [championsResult, proPlayersResult, postsResult] = await Promise.allSettled([
      this.searchChampions(normalized, limit),
      this.searchProPlayers(normalized, limit),
      this.searchPosts(normalized, limit),
    ]);

    const champions = championsResult.status === "fulfilled" ? championsResult.value : [];
    const proPlayers = proPlayersResult.status === "fulfilled" ? proPlayersResult.value : [];
    const posts = postsResult.status === "fulfilled" ? postsResult.value : [];

    // 3. Summoner candidate generation
    const summoner = this.extractSummonerCandidate(rawQuery, region);

    const totalMatches = champions.length + proPlayers.length + posts.length + (summoner ? 1 : 0);

    const result: GlobalSearchData = {
      query: rawQuery,
      region,
      totalMatches,
      champions,
      proPlayers,
      posts,
      ...(summoner ? { summoner } : {}),
    };

    // 4. Save to Redis cache
    if (redisClient.isOpen) {
      try {
        await redisClient.set(cacheKey, JSON.stringify(result), {
          EX: this.CACHE_TTL_SECONDS,
        });
      } catch (err) {
        console.warn("[SearchService] Redis write failed:", err);
      }
    }

    return result;
  }

  /**
   * Search Champions with DB first and Catalog fallback
   */
  private async searchChampions(keyword: string, limit: number): Promise<ChampionSearchResult[]> {
    const results: ChampionSearchResult[] = [];

    // Try DB first
    try {
      const dbChampions = await prisma.champion.findMany({
        where: {
          OR: [
            { name: { contains: keyword, mode: "insensitive" } },
            { key: { contains: keyword, mode: "insensitive" } },
            { title: { contains: keyword, mode: "insensitive" } },
            { primaryClass: { contains: keyword, mode: "insensitive" } },
          ],
        },
        take: limit,
      });

      if (dbChampions && dbChampions.length > 0) {
        return dbChampions.map((c) => ({
          id: c.id,
          key: c.key,
          name: c.name,
          title: c.title,
          primaryClass: c.primaryClass,
          roles: [c.primaryClass.toLowerCase()],
          avatarUrl: c.avatarUrl || `${DDRAGON_BASE_URL}/cdn/${DEFAULT_DDRAGON_VERSION}/img/champion/${c.key}.png`,
          url: `/champions/${c.key}`,
        }));
      }
    } catch {
      // Graceful fallback to static catalog
    }

    // Fallback: in-memory champion catalog
    const catalogMatches = CHAMPION_CATALOG.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(keyword);
      const idMatch = c.id.toLowerCase().includes(keyword);
      const titleMatch = c.title.toLowerCase().includes(keyword);
      const roleMatch = c.roles.some((r) => r.toLowerCase().includes(keyword));
      return nameMatch || idMatch || titleMatch || roleMatch;
    }).slice(0, limit);

    return catalogMatches.map((c) => ({
      id: c.id,
      key: c.id,
      name: c.name,
      title: c.title,
      roles: c.roles,
      avatarUrl: `${DDRAGON_BASE_URL}/cdn/${DEFAULT_DDRAGON_VERSION}/img/champion/${c.id}.png`,
      url: `/champions/${c.id}`,
    }));
  }

  /**
   * Search Pro Players with DB first and Dataset fallback
   */
  private async searchProPlayers(keyword: string, limit: number): Promise<ProPlayerSearchResult[]> {
    // Try DB
    try {
      const dbPlayers = await (prisma as any).proPlayer.findMany({
        where: {
          OR: [
            { name: { contains: keyword, mode: "insensitive" } },
            { nickname: { contains: keyword, mode: "insensitive" } },
            { team: { contains: keyword, mode: "insensitive" } },
            { role: { contains: keyword, mode: "insensitive" } },
            { gameId: { contains: keyword, mode: "insensitive" } },
          ],
        },
        take: limit,
      });

      if (dbPlayers && dbPlayers.length > 0) {
        return dbPlayers.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          nickname: p.nickname,
          team: p.team,
          role: p.role,
          avatar: p.avatar || p.playerImageUrl,
          riotGameName: p.riotGameName || p.nickname,
          riotTagLine: p.riotTagLine || "KR1",
          riotId: p.gameId || `${p.nickname}#KR1`,
        }));
      }
    } catch {
      // Gracefully continue to static dataset fallback
    }

    // Fallback: static dataset
    const matched = PRO_PLAYERS_DATA.filter((p) => {
      return (
        p.name.toLowerCase().includes(keyword) ||
        p.nickname.toLowerCase().includes(keyword) ||
        p.team.toLowerCase().includes(keyword) ||
        p.role.toLowerCase().includes(keyword) ||
        p.gameId.toLowerCase().includes(keyword) ||
        p.riotGameName.toLowerCase().includes(keyword)
      );
    }).slice(0, limit);

    return matched.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      nickname: p.nickname,
      team: p.team,
      role: p.role,
      avatar: p.avatar || p.playerImageUrl,
      riotGameName: p.riotGameName,
      riotTagLine: p.riotTagLine,
      riotId: `${p.riotGameName}#${p.riotTagLine}`,
    }));
  }

  /**
   * Search published posts
   */
  private async searchPosts(keyword: string, limit: number): Promise<PostSearchResult[]> {
    try {
      const posts = await prisma.post.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: keyword, mode: "insensitive" } },
            { content: { contains: keyword, mode: "insensitive" } },
          ],
        },
        include: {
          author: {
            select: { name: true, username: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      return posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        contentSnippet: p.content.slice(0, 120) + (p.content.length > 120 ? "..." : ""),
        coverImageUrl: p.coverImageUrl,
        authorName: p.author.name || p.author.username || "Blitz Staff",
        createdAt: p.createdAt.toISOString(),
      }));
    } catch {
      // DB unavailable or table empty
      return [];
    }
  }

  /**
   * Extract summoner search parameters from user input
   */
  private extractSummonerCandidate(rawInput: string, defaultRegion: string): SummonerSearchResult | undefined {
    const text = rawInput.trim();
    if (text.length < 2) return undefined;

    let gameName = text;
    let tagLine = defaultRegion.toUpperCase();
    let isDirectLookup = false;

    if (text.includes("#")) {
      const parts = text.split("#");
      gameName = parts[0].trim();
      tagLine = parts.slice(1).join("#").trim().toUpperCase() || defaultRegion.toUpperCase();
      isDirectLookup = true;
    }

    if (!gameName) return undefined;

    return {
      gameName,
      tagLine,
      region: defaultRegion,
      riotId: `${gameName}#${tagLine}`,
      isDirectLookup,
    };
  }
}

export const searchService = new SearchService();
