import prisma from "../config/database";
import { redisClient } from "../config/redis";
import { DDRAGON_BASE_URL, DEFAULT_DDRAGON_VERSION } from "../config/riot";
import { riotClientService, RiotClientService } from "./riot-client.service";
import { CHAMPION_CATALOG, ChampionCatalogItem } from "../data/champion-catalog";
import {
  ChampionRole,
  ChampionTierItem,
  RankTier,
  RoleType,
  TierGrade,
  TierListQueryParams,
  TierListResponse,
} from "../types/tierlist.types";

const PRIMARY_ROLE_BY_CHAMPION = new Map<string, ChampionRole>(
  CHAMPION_CATALOG.map((c) => [c.id.toLowerCase(), c.roles[0]])
);

export class TierListService {
  constructor(
    private readonly db = prisma,
    private readonly redis = redisClient,
    private readonly riotClient: RiotClientService = riotClientService
  ) {}

  // Total matches baseline per rank to calculate realistic champion match counts
  private readonly RANK_MATCH_SAMPLE: Record<RankTier, number> = {
    all: 2_500_000,
    iron: 110_000,
    bronze: 320_000,
    silver: 680_000,
    gold: 850_000,
    platinum: 620_000,
    emerald: 460_000,
    diamond: 230_000,
    master: 75_000,
    grandmaster: 28_000,
    challenger: 12_000,
  };

  // Rank variance multipliers for win rate dispersion
  private readonly RANK_WR_SPREAD: Record<RankTier, { min: number; max: number; skew: number }> = {
    all: { min: 46.8, max: 53.8, skew: 0 },
    iron: { min: 47.5, max: 52.8, skew: 0.2 },
    bronze: { min: 47.2, max: 53.0, skew: 0.1 },
    silver: { min: 47.0, max: 53.2, skew: 0 },
    gold: { min: 46.8, max: 53.5, skew: 0 },
    platinum: { min: 46.5, max: 53.8, skew: 0 },
    emerald: { min: 46.4, max: 54.0, skew: 0 },
    diamond: { min: 45.8, max: 54.6, skew: -0.2 },
    master: { min: 45.0, max: 55.0, skew: -0.25 },
    grandmaster: { min: 44.5, max: 55.6, skew: -0.3 },
    challenger: { min: 44.0, max: 56.2, skew: -0.4 },
  };

  // 32-bit FNV-1a Hash function for generating deterministic seeds from string tuples
  private hashString(str: string): number {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  // Mulberry32 pseudo-random number generator yielding uniform float in [0, 1)
  private createPrng(seed: number): () => number {
    let s = seed;
    return () => {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Assigns tier strictly based on win rate thresholds
  private calculateTierGrade(winRate: number): TierGrade {
    if (winRate >= 52.5) return "S";
    if (winRate >= 51.0) return "A";
    if (winRate >= 49.8) return "B";
    if (winRate >= 48.5) return "C";
    return "D";
  }

  // Synthesizes realistic meta statistics for a given champion, lane role, and rank tier
  private generateChampionStats(
    champion: ChampionCatalogItem,
    role: ChampionRole,
    rank: RankTier,
    patchVersion: string
  ): Omit<ChampionTierItem, "rank"> {
    const seed = this.hashString(`${champion.id}:${role}:${rank}:v2026`);
    const rand = this.createPrng(seed);

    const wrSpread = this.RANK_WR_SPREAD[rank] || this.RANK_WR_SPREAD.emerald;
    const rawWr = wrSpread.min + rand() * (wrSpread.max - wrSpread.min);
    const winRate = Number(rawWr.toFixed(1));

    // Patch WR change: range [-2.4, +2.5]%
    const rawChange = (rand() - 0.48) * 4.8;
    const patchWrChange = Number(rawChange.toFixed(1));

    // Pick rate: scaled by basePickBias
    const pickBias = champion.basePickBias ?? 1.0;
    const rawPick = (0.4 + rand() * 5.2) * pickBias;
    const pickRate = Number(Math.min(24.5, Math.max(0.1, rawPick)).toFixed(1));

    // Ban rate: skewed distribution scaled by baseBanBias
    const banBias = champion.baseBanBias ?? 1.0;
    const rawBan = (0.2 + Math.pow(rand(), 2.2) * 9.5) * banBias;
    const banRate = Number(Math.min(48.0, Math.max(0.1, rawBan)).toFixed(1));

    // Match count proportional to rank sample and pick rate with +/- 15% random noise
    const totalSample = this.RANK_MATCH_SAMPLE[rank] || this.RANK_MATCH_SAMPLE.emerald;
    const matchNoise = 0.85 + rand() * 0.3;
    const matches = Math.max(
      450,
      Math.round((totalSample * (pickRate / 100) * matchNoise) / 10) * 10
    );

    const tier = this.calculateTierGrade(winRate);
    const avatarUrl = `${DDRAGON_BASE_URL}/cdn/${patchVersion}/img/champion/${champion.id}.png`;

    return {
      championId: champion.id,
      name: champion.name,
      role,
      tier,
      winRate,
      patchWrChange,
      banRate,
      pickRate,
      matches,
      avatarUrl,
    };
  }

  // Generates in-memory records according to champion catalog
  private generateCatalogDataset(
    rank: RankTier,
    role: RoleType,
    patchVersion: string
  ): Omit<ChampionTierItem, "rank">[] {
    const items: Omit<ChampionTierItem, "rank">[] = [];

    for (const champion of CHAMPION_CATALOG) {
      if (role === "all") {
        const primaryRole = champion.roles[0];
        items.push(this.generateChampionStats(champion, primaryRole, rank, patchVersion));
      } else {
        if (champion.roles.includes(role as ChampionRole)) {
          items.push(this.generateChampionStats(champion, role as ChampionRole, rank, patchVersion));
        }
      }
    }

    return items;
  }

  /**
   * Deduplicates records for the 'all' role view so each champion is represented
   * exactly once by their primary competitive role (Unique Champion Model - 173 champions).
   */
  private deduplicateToUniqueChampions(
    items: Omit<ChampionTierItem, "rank">[]
  ): Omit<ChampionTierItem, "rank">[] {
    const championMap = new Map<string, Omit<ChampionTierItem, "rank">>();

    for (const item of items) {
      const key = item.championId.toLowerCase();
      const existing = championMap.get(key);
      const catalogPrimaryRole = PRIMARY_ROLE_BY_CHAMPION.get(key);

      if (!existing) {
        championMap.set(key, item);
        continue;
      }

      // Priority 1: Pick the record matching the catalog primary role
      if (item.role === catalogPrimaryRole && existing.role !== catalogPrimaryRole) {
        championMap.set(key, item);
      } else if (
        (item.role === catalogPrimaryRole && existing.role === catalogPrimaryRole) ||
        (item.role !== catalogPrimaryRole && existing.role !== catalogPrimaryRole)
      ) {
        // Priority 2: Pick the role variant with higher match count / pick rate
        if (item.matches > existing.matches) {
          championMap.set(key, item);
        }
      }
    }

    return Array.from(championMap.values());
  }

  // Retrieves dataset from Redis Cache, PostgreSQL Database, with self-healing auto-seed
  private async getBaseDataset(
    rank: RankTier,
    role: RoleType,
    patchVersion: string
  ): Promise<Omit<ChampionTierItem, "rank">[]> {
    const cacheKey = `tierlist:v2:${patchVersion}:${rank}:${role}`;

    // 1. Check Redis Cache first (Cache-Aside pattern with completeness validation)
    if (this.redis.isOpen) {
      try {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as Omit<ChampionTierItem, "rank">[];
          const expectedMinCount =
            role === "all"
              ? CHAMPION_CATALOG.length
              : CHAMPION_CATALOG.filter((c) => c.roles.includes(role as ChampionRole)).length;

          // Only accept cached data if it satisfies expected champion catalog coverage
          if (parsed.length >= expectedMinCount) {
            return role === "all" ? this.deduplicateToUniqueChampions(parsed) : parsed;
          }

          // Purge stale or incomplete cache entry
          await this.redis.del(cacheKey).catch(() => {});
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[Redis Cache Warning] Failed to read ${cacheKey}: ${msg}`);
      }
    }

    // 2. Query PostgreSQL via Prisma ORM
    let items: Omit<ChampionTierItem, "rank">[] = [];
    let fetchedFromDb = false;

    try {
      const whereClause: Record<string, string> = { rank };
      if (role !== "all") {
        whereClause.roleId = role;
      }

      const dbRecords = await (this.db as any).championTierStat.findMany({
        where: whereClause,
        include: { role: true },
        orderBy: { winRate: "desc" },
      });

      if (dbRecords && dbRecords.length > 0) {
        items = dbRecords.map((r: any) => ({
          championId: r.championId,
          name: r.name,
          role: (r.roleId || r.role?.id) as ChampionRole,
          tier: r.tier as TierGrade,
          winRate: r.winRate,
          patchWrChange: r.patchWrChange,
          banRate: r.banRate,
          pickRate: r.pickRate,
          matches: r.matches,
          avatarUrl: r.avatarUrl,
        }));
        fetchedFromDb = true;

        // Self-Healing Auto-Fill: Verify and automatically supplement any missing champions from catalog
        const targetCatalog =
          role === "all"
            ? CHAMPION_CATALOG
            : CHAMPION_CATALOG.filter((c) => c.roles.includes(role as ChampionRole));

        const existingChampionIds = new Set(
          items.map((item) =>
            role === "all"
              ? item.championId.toLowerCase()
              : `${item.championId.toLowerCase()}:${item.role}`
          )
        );

        const missingChampsToGenerate: Array<{
          champ: ChampionCatalogItem;
          roleToUse: ChampionRole;
        }> = [];

        for (const champ of targetCatalog) {
          if (role === "all") {
            if (!existingChampionIds.has(champ.id.toLowerCase())) {
              missingChampsToGenerate.push({ champ, roleToUse: champ.roles[0] });
            }
          } else {
            const key = `${champ.id.toLowerCase()}:${role}`;
            if (!existingChampionIds.has(key)) {
              missingChampsToGenerate.push({ champ, roleToUse: role as ChampionRole });
            }
          }
        }

        if (missingChampsToGenerate.length > 0) {
          const generatedMissing = missingChampsToGenerate.map(({ champ, roleToUse }) =>
            this.generateChampionStats(champ, roleToUse, rank, patchVersion)
          );
          items.push(...generatedMissing);

          // Asynchronously persist newly supplemented records to PostgreSQL
          const toInsertMissing = generatedMissing.map((item) => ({
            championId: item.championId,
            name: item.name,
            roleId: item.role,
            rank,
            tier: item.tier,
            winRate: item.winRate,
            patchWrChange: item.patchWrChange,
            banRate: item.banRate,
            pickRate: item.pickRate,
            matches: item.matches,
            avatarUrl: item.avatarUrl,
            patch: patchVersion,
          }));

          (this.db as any).championTierStat
            .createMany({
              data: toInsertMissing,
              skipDuplicates: true,
            })
            .catch((insertErr: unknown) => {
              console.warn("[Prisma Self-Healing Auto-Fill Warning]:", insertErr);
            });
        }
      } else {
        // Self-Healing Auto-Seed: Ensure master roles exist in Role table first
        const ROLES_DATA = [
          { id: "top", name: "TOP", displayName: "Top" },
          { id: "jungle", name: "JUNGLE", displayName: "Jungle" },
          { id: "mid", name: "MID", displayName: "Mid" },
          { id: "ad", name: "AD", displayName: "ADC" },
          { id: "sp", name: "SP", displayName: "Support" },
        ];
        for (const r of ROLES_DATA) {
          await (this.db as any).role.upsert({
            where: { id: r.id },
            update: { displayName: r.displayName },
            create: r,
          }).catch(() => {});
        }

        const generated = this.generateCatalogDataset(rank, role, patchVersion);
        items = generated;

        // Persist to PostgreSQL with roleId foreign key
        const toInsert = generated.map((item) => ({
          championId: item.championId,
          name: item.name,
          roleId: item.role,
          rank,
          tier: item.tier,
          winRate: item.winRate,
          patchWrChange: item.patchWrChange,
          banRate: item.banRate,
          pickRate: item.pickRate,
          matches: item.matches,
          avatarUrl: item.avatarUrl,
          patch: patchVersion,
        }));

        (this.db as any).championTierStat
          .createMany({
            data: toInsert,
            skipDuplicates: true,
          })
          .catch((insertErr: unknown) => {
            console.warn("[Prisma Auto-Seed Warning]:", insertErr);
          });
      }
    } catch (dbError: unknown) {
      // Graceful fallback to catalog math engine if PostgreSQL is unreachable
      console.warn(
        `[Database Warning] Could not query PostgreSQL: ${
          dbError instanceof Error ? dbError.message : String(dbError)
        }. Falling back to in-memory engine.`
      );
      items = this.generateCatalogDataset(rank, role, patchVersion);
    }

    // Deduplicate when role is 'all' to guarantee exact 173 unique champions
    if (role === "all") {
      items = this.deduplicateToUniqueChampions(items);
    }

    // 3. Cache the resolved dataset in Redis (TTL 1 hour)
    if (this.redis.isOpen && items.length > 0) {
      try {
        await this.redis.setEx(cacheKey, 3600, JSON.stringify(items));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[Redis Cache Warning] Failed to write ${cacheKey}: ${msg}`);
      }
    }

    return items;
  }

  // Retrieves, filters, sorts, and ranks champion tier list data
  async getTierList(params: TierListQueryParams): Promise<TierListResponse> {
    const rank: RankTier = params.rank || "emerald";
    const role: RoleType = params.role || "all";
    const sortBy = params.sortBy || "winRate";
    const order = params.order || "desc";
    const search = params.search?.trim().toLowerCase() || "";
    const tier = params.tier && params.tier !== "all" ? params.tier : undefined;
    const page = params.page && params.page > 0 ? params.page : undefined;
    const limit = params.limit && params.limit > 0 ? params.limit : undefined;

    // Obtain current patch version with graceful fallback
    const patchVersion = await this.riotClient
      .getLatestDDragonVersion()
      .catch(() => DEFAULT_DDRAGON_VERSION);

    // Retrieve data from DB / Redis / Fallback engine
    const rawItems = await this.getBaseDataset(rank, role, patchVersion);

    // Filter by champion name
    const filtered = search
      ? rawItems.filter(
          (item) =>
            item.name.toLowerCase().includes(search) ||
            item.championId.toLowerCase().includes(search)
        )
      : rawItems;

    // Calculate full tier distribution counts across search/role-filtered dataset
    const tierCounts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    for (const item of filtered) {
      const t = item.tier?.toUpperCase();
      if (tierCounts[t] !== undefined) tierCounts[t]++;
    }

    // Filter by tier grade if specified (S, A, B, C, D)
    const tierFiltered = tier
      ? filtered.filter((item) => item.tier.toUpperCase() === tier.toUpperCase())
      : filtered;

    // Sort items by chosen metric
    const sorted = [...tierFiltered].sort((a, b) => {
      let diff = 0;
      switch (sortBy) {
        case "winRate":
          diff = a.winRate - b.winRate;
          break;
        case "pickRate":
          diff = a.pickRate - b.pickRate;
          break;
        case "banRate":
          diff = a.banRate - b.banRate;
          break;
        case "matches":
          diff = a.matches - b.matches;
          break;
        case "patchWrChange":
          diff = a.patchWrChange - b.patchWrChange;
          break;
        default:
          diff = a.winRate - b.winRate;
          break;
      }
      return order === "asc" ? diff : -diff;
    });

    // Assign sequential rank numbers (1, 2, 3...)
    const rankedData: ChampionTierItem[] = sorted.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

    const total = rankedData.length;

    // Apply pagination if page or limit is specified
    let pagedData = rankedData;
    let totalPages: number | undefined = undefined;

    if (page !== undefined || limit !== undefined) {
      const activeLimit = limit || 20;
      const activePage = page || 1;
      totalPages = Math.max(1, Math.ceil(total / activeLimit));
      const startIndex = (activePage - 1) * activeLimit;
      pagedData = rankedData.slice(startIndex, startIndex + activeLimit);
    }

    return {
      success: true,
      patch: patchVersion,
      rank,
      role,
      tier: params.tier,
      total,
      page,
      limit,
      totalPages,
      tierCounts,
      data: pagedData,
    };
  }
}

export const tierListService = new TierListService();
