import prisma from "../../../config/database";
import {
  ChampionAbilities,
  ChampionBuildPayload,
  ChampionOverview,
  DamageBreakdown,
  ItemSet,
  MatchupEntry,
  PreviousPatchStats,
  Role,
  RolePlayRate,
  RuneSetup,
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
          champion: true,
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
        avatarUrl: champion.avatarUrl,
        splashUrl: champion.splashUrl,
        role: record.role as Role,
        availableRoles: [
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
      const runes = record.runes as unknown as {
        mostPopular: RuneSetup;
        highestWinRate: RuneSetup;
      };
      const skills = record.skills as unknown as SkillPriority;
      const items = record.items as unknown as {
        starting: ItemSet[];
        early: ItemSet[];
        core: ItemSet[];
        completed: ItemSet[];
        buildOrder: number[];
        boots: ItemSet[];
        situational: ItemSet[];
        trinkets: ItemSet[];
      };
      const matchups = record.matchups as unknown as {
        bestAgainst: MatchupEntry[];
        worstAgainst: MatchupEntry[];
        strongAgainst?: MatchupEntry[];
        weakAgainst?: MatchupEntry[];
      };
      const similarChampions = record.similarChampions as unknown as SimilarChampion[];
      const insights = record.insights as unknown as {
        general: string[];
        strengths: string[];
        weaknesses: string[];
      };

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
      console.warn(`[ChampionBuildRepository] DB lookup failed for ${championKey}/${role}:`, error);
      return null;
    }
  }

  public async saveBuild(payload: ChampionBuildPayload): Promise<void> {
    try {
      const { overview } = payload;

      // 1. Upsert Champion root entity
      await prisma.champion.upsert({
        where: { id: overview.id },
        update: {
          name: overview.name,
          title: overview.title,
          avatarUrl: overview.avatarUrl,
          splashUrl: overview.splashUrl,
          abilities: payload.abilities as object,
        },
        create: {
          id: overview.id,
          key: overview.key,
          name: overview.name,
          title: overview.title,
          primaryClass: "Fighter",
          tags: ["Fighter"],
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
      console.warn(`[ChampionBuildRepository] DB save failed for ${payload.overview.name}:`, error);
    }
  }
}

export const championBuildRepository = new ChampionBuildRepository();
