import prisma from "../../../config/database";
import {
  ChampionAbilities,
  ChampionBuildPayload,
  ChampionInsights,
  ChampionItems,
  ChampionMatchups,
  ChampionOverview,
  ChampionRunes,
  DamageBreakdown,
  PreviousPatchStats,
  Role,
  RolePlayRate,
  SimilarChampion,
  SkillPriority,
  SpellPair,
  Tier,
  TierRank,
} from "../interfaces/champion-build.interface";

export class ChampionBuildRepository {
  public async findBuild(
    championKey: string,
    role: Role,
    tier: Tier,
    region: string,
    patch: string
  ): Promise<ChampionBuildPayload | null> {
    try {
      const record = await prisma.championBuild.findFirst({
        where: {
          champion: {
            key: { equals: championKey, mode: "insensitive" },
          },
          role,
          tier,
          region,
          patch,
        },
        include: {
          champion: {
            include: {
              tags: true,
            },
          },
        },
      });

      if (!record || !record.champion) {
        return null;
      }

      const { champion } = record;

      const overview: ChampionOverview = {
        id: champion.id,
        key: champion.key,
        name: champion.name,
        title: champion.title,
        primaryClass: champion.primaryClass,
        tags: champion.tags?.map((t) => t.name) || [champion.primaryClass],
        avatarUrl: champion.avatarUrl,
        splashUrl: champion.splashUrl,
        role: record.role as Role,
        availableRoles: (record.availableRoles as unknown as RolePlayRate[]) || [
          { role: record.role as Role, pickRate: record.pickRate, isPrimary: true },
        ],
        tier: record.tier as Tier,
        region: record.region,
        patch: record.patch,
        tierRank: record.tierRank as TierRank,
        winRate: record.winRate,
        pickRate: record.pickRate,
        banRate: record.banRate,
        gamesPlayed: record.gamesPlayed,
      };

      const abilities = champion.abilities as unknown as ChampionAbilities;
      const damageBreakdown = record.damageBreakdown as unknown as DamageBreakdown;
      const previousPatch = record.previousPatch as unknown as PreviousPatchStats;
      const spells = record.spells as unknown as SpellPair[];
      const runes = record.runes as unknown as ChampionRunes;
      const skills = record.skills as unknown as SkillPriority;
      const items = record.items as unknown as ChampionItems;
      const matchups = record.matchups as unknown as ChampionMatchups;
      const similarChampions = record.similarChampions as unknown as SimilarChampion[];
      const insights = record.insights as unknown as ChampionInsights;

      return {
        overview,
        previousPatch,
        damageBreakdown,
        spells,
        runes,
        skills,
        abilities,
        items,
        matchups,
        similarChampions,
        insights,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[ChampionBuildRepository] DB lookup skipped (${msg.split("\n")[0]}).`);
      return null;
    }
  }

  public async saveBuild(payload: ChampionBuildPayload): Promise<void> {
    try {
      const { overview } = payload;
      const championClass = overview.primaryClass || "Fighter";
      const championTags = overview.tags && overview.tags.length > 0 ? overview.tags : [championClass];

      // 1. Upsert Champion root entity with relational Tags
      await prisma.champion.upsert({
        where: { id: overview.id },
        update: {
          name: overview.name,
          title: overview.title,
          primaryClass: championClass,
          tags: {
            set: [],
            connectOrCreate: championTags.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
          avatarUrl: overview.avatarUrl,
          splashUrl: overview.splashUrl,
          abilities: payload.abilities as object,
        },
        create: {
          id: overview.id,
          key: overview.key,
          name: overview.name,
          title: overview.title,
          primaryClass: championClass,
          tags: {
            connectOrCreate: championTags.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
          partype: "Mana",
          avatarUrl: overview.avatarUrl,
          splashUrl: overview.splashUrl,
          abilities: payload.abilities as object,
        },
      });

      // 2. Upsert ChampionBuild entity
      await prisma.championBuild.upsert({
        where: {
          championId_role_tier_region_patch: {
            championId: overview.id,
            role: overview.role,
            tier: overview.tier,
            region: overview.region,
            patch: overview.patch,
          },
        },
        update: {
          tierRank: overview.tierRank,
          winRate: overview.winRate,
          pickRate: overview.pickRate,
          banRate: overview.banRate,
          gamesPlayed: overview.gamesPlayed,
          availableRoles: overview.availableRoles as unknown as object[],
          damageBreakdown: payload.damageBreakdown as object,
          previousPatch: payload.previousPatch as object,
          spells: payload.spells as unknown as object[],
          runes: payload.runes as object,
          skills: payload.skills as object,
          items: payload.items as object,
          matchups: payload.matchups as object,
          similarChampions: payload.similarChampions as unknown as object[],
          insights: payload.insights as object,
        },
        create: {
          championId: overview.id,
          role: overview.role,
          tier: overview.tier,
          region: overview.region,
          patch: overview.patch,
          tierRank: overview.tierRank,
          winRate: overview.winRate,
          pickRate: overview.pickRate,
          banRate: overview.banRate,
          gamesPlayed: overview.gamesPlayed,
          availableRoles: overview.availableRoles as unknown as object[],
          damageBreakdown: payload.damageBreakdown as object,
          previousPatch: payload.previousPatch as object,
          spells: payload.spells as unknown as object[],
          runes: payload.runes as object,
          skills: payload.skills as object,
          items: payload.items as object,
          matchups: payload.matchups as object,
          similarChampions: payload.similarChampions as unknown as object[],
          insights: payload.insights as object,
        },
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[ChampionBuildRepository] DB save skipped (${msg.split("\n")[0]}).`);
    }
  }

  public async findChampionsByTag(tagName: string) {
    try {
      return await prisma.champion.findMany({
        where: {
          tags: {
            some: {
              name: { equals: tagName, mode: "insensitive" },
            },
          },
        },
        include: {
          tags: true,
        },
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[ChampionBuildRepository] findChampionsByTag skipped (${msg.split("\n")[0]}).`);
      return [];
    }
  }

  public async getAllTags() {
    try {
      return await prisma.tag.findMany({
        include: {
          _count: {
            select: { champions: true },
          },
        },
        orderBy: { name: "asc" },
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[ChampionBuildRepository] getAllTags skipped (${msg.split("\n")[0]}).`);
      return [];
    }
  }
}

export const championBuildRepository = new ChampionBuildRepository();
