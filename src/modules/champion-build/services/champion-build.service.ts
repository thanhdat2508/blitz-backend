import redisClient from "../../../config/redis";
import {
  ChampionBuildPayload,
  ChampionItems,
  ChampionMatchups,
  ChampionOverview,
  ChampionRunes,
  ItemSet,
  MatchupEntry,
  PreviousPatchStats,
  Role,
  RolePlayRate,
  RuneSetup,
  SkillPriority,
  SpellPair,
  Tier,
  TierRank,
} from "../interfaces/champion-build.interface";
import {
  ChampionClass,
  CLASS_PRESETS,
  DDRAGON_CDN,
  DDRAGON_SPLASH_CDN,
  ROLE_PRESETS,
} from "../constants/champion-build.constants";
import { riotStaticDataService, RiotStaticDataService } from "./riot-static-data.service";
import { championBuildRepository, ChampionBuildRepository } from "../repositories/champion-build.repository";
import { championInsightsService, ChampionInsightsService } from "./champion-insights.service";
import { championItemsService, ChampionItemsService } from "./champion-items.service";
import { randomInt, randomRate, round2 } from "../../../utils/math";
import { generateChampionUUID } from "../../../utils/crypto";

export class ChampionBuildService {
  private static readonly CACHE_TTL_SECONDS = 3600; // 1 hour

  constructor(
    private readonly staticDataService: RiotStaticDataService = riotStaticDataService,
    private readonly repository: ChampionBuildRepository = championBuildRepository,
    private readonly insightsService: ChampionInsightsService = championInsightsService,
    private readonly itemsService: ChampionItemsService = championItemsService
  ) {}

  public async getChampionBuild(
    championKey: string,
    role: Role = "mid",
    tier: Tier = "EMERALD+",
    region: string = "WORLD",
    patch?: string
  ): Promise<ChampionBuildPayload> {
    const resolvedPatch = patch || (await this.staticDataService.getCurrentPatch());
    const normalizedKey = championKey.toLowerCase();
    const cacheKey = `lol:build:${resolvedPatch}:${region}:${tier}:${normalizedKey}:${role}`;

    // 1. Level 1: Redis Cache (< 2ms)
    const cached = await this.readFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Level 2: PostgreSQL Database via Prisma (< 10ms)
    const dbRecord = await this.repository.findBuild(championKey, role, tier, region, resolvedPatch);
    if (dbRecord) {
      await this.writeToCache(cacheKey, dbRecord);
      return dbRecord;
    }

    // 3. Level 3: Dynamic Riot Engine + Auto-persist to DB & Redis
    const buildPayload = await this.generateBuildPayload(championKey, role, tier, region, resolvedPatch);
    await this.repository.saveBuild(buildPayload);
    await this.writeToCache(cacheKey, buildPayload);

    return buildPayload;
  }

  private async readFromCache(cacheKey: string): Promise<ChampionBuildPayload | null> {
    try {
      if (!redisClient.isOpen) return null;
      const raw = await redisClient.get(cacheKey);
      return raw ? (JSON.parse(raw) as ChampionBuildPayload) : null;
    } catch (error) {
      console.warn(`[Redis] Cache read failed for key ${cacheKey}:`, error);
      return null;
    }
  }

  private async writeToCache(cacheKey: string, payload: ChampionBuildPayload): Promise<void> {
    try {
      if (!redisClient.isOpen) return;
      await redisClient.set(cacheKey, JSON.stringify(payload), {
        EX: ChampionBuildService.CACHE_TTL_SECONDS,
      });
    } catch (error) {
      console.warn(`[Redis] Cache write failed for key ${cacheKey}:`, error);
    }
  }

  private async generateBuildPayload(
    championKey: string,
    role: Role,
    tier: Tier,
    region: string,
    patch: string
  ): Promise<ChampionBuildPayload> {
    // 1. Fetch live Riot Data Dragon metadata
    const riotData = await this.staticDataService.getChampion(championKey, patch);
    const resolvedKey = riotData?.id || championKey.charAt(0).toUpperCase() + championKey.slice(1);
    const resolvedId = riotData ? generateChampionUUID(riotData.key) : generateChampionUUID(resolvedKey);
    const resolvedName = riotData?.name || resolvedKey;
    const resolvedTitle = riotData?.title || "the Legend";
    const primaryTag = this.resolvePrimaryClass(riotData?.tags);

    const baseWinRate = randomRate(49.5, 53.5);
    const classPreset = CLASS_PRESETS[primaryTag];
    const rolePreset = ROLE_PRESETS[role];

    // 2. Fetch abilities & gameplay tips
    const abilities = await this.staticDataService.getChampionAbilities(resolvedKey, patch);
    const gameplayTips = await this.staticDataService.getChampionGameplayTips(resolvedKey, patch);

    const matchups = this.buildMatchups(resolvedKey, role, baseWinRate);
    const topOpponent = matchups.worstAgainst[0]?.key || matchups.bestAgainst[0]?.key;
    const insights = this.insightsService.generateInsights(
      resolvedKey,
      resolvedName,
      primaryTag,
      abilities,
      riotData?.partype,
      topOpponent,
      gameplayTips
    );

    return {
      overview: this.buildOverview(
        resolvedId,
        resolvedKey,
        resolvedName,
        resolvedTitle,
        primaryTag,
        role,
        tier,
        region,
        patch,
        baseWinRate,
        riotData?.tags
      ),
      previousPatch: this.buildPreviousPatch(patch, baseWinRate),
      damageBreakdown: classPreset.damageBreakdown,
      spells: this.buildSpells(rolePreset.spells, baseWinRate),
      runes: this.buildRunes(classPreset, baseWinRate),
      skills: this.buildSkills(classPreset.skillsMaxOrder, role, baseWinRate),
      abilities,
      items: this.itemsService.resolveChampionItems({
        championKey: resolvedKey,
        role,
        primaryClass: primaryTag,
        partype: riotData?.partype,
        classPreset,
        rolePreset,
        baseWinRate,
      }),
      matchups,
      similarChampions: classPreset.similarChampions,
      insights,
    };
  }

  private static readonly VALID_CHAMPION_CLASSES: readonly ChampionClass[] = [
    "Mage",
    "Assassin",
    "Marksman",
    "Fighter",
    "Tank",
    "Support",
  ];

  private resolvePrimaryClass(tags?: string[]): ChampionClass {
    const firstTag = tags?.[0] as ChampionClass | undefined;
    if (firstTag && ChampionBuildService.VALID_CHAMPION_CLASSES.includes(firstTag)) {
      return firstTag;
    }
    return "Fighter";
  }

  private buildOverview(
    id: string,
    key: string,
    name: string,
    title: string,
    championClass: ChampionClass,
    role: Role,
    tier: Tier,
    region: string,
    patch: string,
    winRate: number,
    tags?: string[]
  ): ChampionOverview {
    const tierRank: TierRank = winRate >= 52.5 ? "S+" : winRate >= 51.5 ? "S" : winRate >= 50.5 ? "A" : "B";
    const availableRoles = this.buildAvailableRoles(championClass, role);

    return {
      id,
      key,
      name,
      title,
      primaryClass: championClass,
      tags: tags && tags.length > 0 ? tags : [championClass],
      avatarUrl: `${DDRAGON_CDN}/img/champion/${key}.png`,
      splashUrl: `${DDRAGON_SPLASH_CDN}/${key}_0.jpg`,
      role,
      availableRoles,
      tier,
      region,
      patch,
      tierRank,
      winRate,
      pickRate: randomRate(2.8, 6.2),
      banRate: randomRate(0.8, 3.5),
      gamesPlayed: randomInt(14000, 32000),
    };
  }

  private buildPreviousPatch(currentPatch: string, currentWinRate: number): PreviousPatchStats {
    const parts = currentPatch.split(".");
    const major = parts[0] || "14";
    const minor = Number(parts[1] || "24");
    const prevPatchStr = `${major}.${Math.max(1, minor - 1)}`;

    const winRateDiff = round2(randomRate(0.5, 2.2));
    const isUp = Math.random() > 0.35;
    const prevWinRate = isUp
      ? round2(currentWinRate - winRateDiff)
      : round2(currentWinRate + winRateDiff);

    return {
      patch: prevPatchStr,
      winRate: prevWinRate,
      winRateDiff,
      trend: isUp ? "up" : "down",
      gamesPlayed: randomInt(12000, 28000),
    };
  }

  private buildAvailableRoles(championClass: ChampionClass, currentRole: Role): RolePlayRate[] {
    const distribution: Record<ChampionClass, Array<{ role: Role; pickRate: number }>> = {
      Mage: [
        { role: "mid", pickRate: 72.4 },
        { role: "support", pickRate: 23.1 },
        { role: "top", pickRate: 4.5 },
      ],
      Assassin: [
        { role: "mid", pickRate: 58.2 },
        { role: "jungle", pickRate: 35.6 },
        { role: "top", pickRate: 6.2 },
      ],
      Marksman: [
        { role: "adc", pickRate: 84.5 },
        { role: "mid", pickRate: 11.2 },
        { role: "top", pickRate: 4.3 },
      ],
      Fighter: [
        { role: "top", pickRate: 64.2 },
        { role: "jungle", pickRate: 28.5 },
        { role: "mid", pickRate: 7.3 },
      ],
      Tank: [
        { role: "top", pickRate: 52.1 },
        { role: "support", pickRate: 34.7 },
        { role: "jungle", pickRate: 13.2 },
      ],
      Support: [
        { role: "support", pickRate: 88.4 },
        { role: "mid", pickRate: 11.6 },
      ],
    };

    const roles = [...(distribution[championClass] || distribution.Fighter)];
    const existingIndex = roles.findIndex((r) => r.role === currentRole);
    if (existingIndex === -1) {
      roles.push({ role: currentRole, pickRate: 3.2 });
    }

    return roles.map((entry) => ({
      role: entry.role,
      pickRate: entry.pickRate,
      isPrimary: entry.role === currentRole,
    }));
  }

  private buildSpells(
    spellPresets: Array<{ spell1Id: number; spell2Id: number; pickRate: number; winRateOffset: number }>,
    baseWinRate: number
  ): SpellPair[] {
    return spellPresets.map((preset) => ({
      spell1Id: preset.spell1Id,
      spell2Id: preset.spell2Id,
      winRate: round2(baseWinRate + preset.winRateOffset),
      pickRate: round2(preset.pickRate),
    }));
  }

  private buildRunes(
    classPreset: typeof CLASS_PRESETS[ChampionClass],
    baseWinRate: number
  ): ChampionRunes {
    const mostPopular: RuneSetup = {
      ...classPreset.mostPopularRunes,
      winRate: round2(baseWinRate + 0.3),
      pickRate: round2(67.4),
    };

    const highestWinRate: RuneSetup = {
      ...classPreset.highestWinRateRunes,
      winRate: round2(baseWinRate + 1.8),
      pickRate: round2(16.5),
    };

    return { mostPopular, highestWinRate };
  }

  private buildSkills(skillsMaxOrder: string[], role: Role, baseWinRate: number): SkillPriority {
    const effectiveOrder =
      role === "jungle" && skillsMaxOrder[0] === "W"
        ? ["Q", "W", "E"]
        : skillsMaxOrder;

    const first = effectiveOrder[0];
    const second = effectiveOrder[1];
    const third = effectiveOrder[2];

    const progression = [
      first, second, third, first, first, "R",
      first, second, first, second, "R", second,
      second, third, third, "R", third, third,
    ];

    return {
      maxOrder: effectiveOrder,
      progression,
      winRate: round2(baseWinRate + 0.9),
      pickRate: round2(76.8),
    };
  }

  private buildItems(
    role: Role,
    classPreset: typeof CLASS_PRESETS[ChampionClass],
    rolePreset: typeof ROLE_PRESETS[Role],
    baseWinRate: number,
    championKey: string = "",
    primaryClass: ChampionClass = "Marksman",
    partype?: string
  ): ChampionItems {
    return this.itemsService.resolveChampionItems({
      championKey,
      role,
      primaryClass,
      partype,
      classPreset,
      rolePreset,
      baseWinRate,
    });
  }

  private buildMatchups(
    currentChampKey: string,
    role: Role,
    baseWinRate: number
  ): ChampionMatchups {
    const roleOpponents: Record<Role, Array<{ id: number; key: string; name: string }>> = {
      mid: [
        { id: 157, key: "Yasuo", name: "Yasuo" },
        { id: 777, key: "Yone", name: "Yone" },
        { id: 90, key: "Malzahar", name: "Malzahar" },
        { id: 103, key: "Ahri", name: "Ahri" },
        { id: 238, key: "Zed", name: "Zed" },
        { id: 134, key: "Syndra", name: "Syndra" },
        { id: 84, key: "Akali", name: "Akali" },
        { id: 55, key: "Katarina", name: "Katarina" },
        { id: 517, key: "Sylas", name: "Sylas" },
        { id: 112, key: "Viktor", name: "Viktor" },
      ],
      top: [
        { id: 266, key: "Aatrox", name: "Aatrox" },
        { id: 86, key: "Garen", name: "Garen" },
        { id: 85, key: "Kennen", name: "Kennen" },
        { id: 24, key: "Jax", name: "Jax" },
        { id: 122, key: "Darius", name: "Darius" },
        { id: 114, key: "Fiora", name: "Fiora" },
        { id: 58, key: "Renekton", name: "Renekton" },
        { id: 164, key: "Camille", name: "Camille" },
        { id: 897, key: "KSante", name: "K'Sante" },
        { id: 875, key: "Sett", name: "Sett" },
        { id: 82, key: "Mordekaiser", name: "Mordekaiser" },
      ],
      jungle: [
        { id: 64, key: "LeeSin", name: "Lee Sin" },
        { id: 234, key: "Viego", name: "Viego" },
        { id: 59, key: "JarvanIV", name: "Jarvan IV" },
        { id: 121, key: "Khazix", name: "Kha'Zix" },
        { id: 56, key: "Nocturne", name: "Nocturne" },
        { id: 104, key: "Graves", name: "Graves" },
        { id: 60, key: "Elise", name: "Elise" },
        { id: 141, key: "Kayn", name: "Kayn" },
        { id: 5, key: "XinZhao", name: "Xin Zhao" },
        { id: 203, key: "Kindred", name: "Kindred" },
      ],
      adc: [
        { id: 222, key: "Jinx", name: "Jinx" },
        { id: 145, key: "Kaisa", name: "Kai'Sa" },
        { id: 51, key: "Caitlyn", name: "Caitlyn" },
        { id: 81, key: "Ezreal", name: "Ezreal" },
        { id: 67, key: "Vayne", name: "Vayne" },
        { id: 202, key: "Jhin", name: "Jhin" },
        { id: 22, key: "Ashe", name: "Ashe" },
        { id: 236, key: "Lucian", name: "Lucian" },
        { id: 360, key: "Samira", name: "Samira" },
        { id: 18, key: "Tristana", name: "Tristana" },
      ],
      support: [
        { id: 412, key: "Thresh", name: "Thresh" },
        { id: 99, key: "Lux", name: "Lux" },
        { id: 111, key: "Nautilus", name: "Nautilus" },
        { id: 89, key: "Leona", name: "Leona" },
        { id: 53, key: "Blitzcrank", name: "Blitzcrank" },
        { id: 117, key: "Lulu", name: "Lulu" },
        { id: 555, key: "Pyke", name: "Pyke" },
        { id: 43, key: "Karma", name: "Karma" },
        { id: 267, key: "Nami", name: "Nami" },
        { id: 497, key: "Rakan", name: "Rakan" },
      ],
    };

    const pool = (roleOpponents[role] || roleOpponents.mid).filter(
      (champ) => champ.key.toLowerCase() !== currentChampKey.toLowerCase()
    );

    // Guaranteed disjoint slices: first 4-5 for best/strong, last 4-5 for worst/weak
    const halfSize = Math.min(5, Math.floor(pool.length / 2));
    const bestPool = pool.slice(0, halfSize);
    const worstPool = pool.slice(-halfSize);

    const bestAgainst: MatchupEntry[] = bestPool.map((champ, idx) => ({
      championId: champ.id,
      name: champ.name,
      key: champ.key,
      avatarUrl: `${DDRAGON_CDN}/img/champion/${champ.key}.png`,
      winRate: round2(baseWinRate + 3.8 - idx * 0.4),
      gamesPlayed: randomInt(1100, 2200),
    }));

    const worstAgainst: MatchupEntry[] = worstPool.map((champ, idx) => ({
      championId: champ.id,
      name: champ.name,
      key: champ.key,
      avatarUrl: `${DDRAGON_CDN}/img/champion/${champ.key}.png`,
      winRate: round2(baseWinRate - 4.5 + idx * 0.4),
      gamesPlayed: randomInt(900, 1800),
    }));

    return {
      bestAgainst,
      worstAgainst,
      strongAgainst: bestAgainst,
      weakAgainst: worstAgainst,
    };
  }
}

export const championBuildService = new ChampionBuildService();
