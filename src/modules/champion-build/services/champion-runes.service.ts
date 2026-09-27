import {
  ChampionRunes,
  Role,
  RuneSetup,
} from "../interfaces/champion-build.interface";
import {
  ChampionClass,
  ClassArchetypePreset,
  RawRunePreset,
} from "../constants/champion-build.constants";
import {
  buildRuneStyles,
  CHAMPION_RUNE_OVERRIDES,
  SUB_ARCHETYPE_RUNES,
} from "../data/champion-runes.data";
import { round2 } from "../../../utils/math";

export interface ResolveChampionRunesParams {
  championKey: string;
  role?: Role;
  primaryClass: ChampionClass;
  classPreset: ClassArchetypePreset;
  baseWinRate: number;
}

export class ChampionRunesService {
  /**
   * Resolves champion runes with 3-tier hierarchical resolution:
   * Tier 1: Champion-specific signature overrides (Quinn Phase Rush, Yasuo Conqueror, Pyke HoB, etc.)
   * Tier 2: Sub-archetype auto-adaptation (Support Tanks get Aftershock + Hexflash, Enchanters get Aery, ADCs get Fleet/PTA)
   * Tier 3: Class preset baseline fallback
   * All tiers populate dynamic primaryStyles and subStyles with official Riot CDN icons.
   */
  public resolveChampionRunes(params: ResolveChampionRunesParams): ChampionRunes {
    const { championKey, role, primaryClass, classPreset, baseWinRate } = params;

    const normalizedKey = championKey.toLowerCase().replace(/[^a-z0-9]/g, "");
    const override =
      CHAMPION_RUNE_OVERRIDES[championKey] ??
      Object.entries(CHAMPION_RUNE_OVERRIDES).find(
        ([key]) => key.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedKey
      )?.[1];

    let subArchetype: RawRunePreset | undefined;
    if (!override) {
      if (role === "support" && primaryClass === "Tank") {
        subArchetype = SUB_ARCHETYPE_RUNES.support_tank;
      } else if (role === "support" && (primaryClass === "Mage" || primaryClass === "Support")) {
        subArchetype = SUB_ARCHETYPE_RUNES.enchanter_support;
      } else if (primaryClass === "Marksman") {
        subArchetype = SUB_ARCHETYPE_RUNES.crit_marksman;
      }
    }

    const rawMostPopular: RawRunePreset = override?.mostPopular ?? subArchetype ?? classPreset.mostPopularRunes;
    const rawHighestWinRate: RawRunePreset = override?.highestWinRate ?? classPreset.highestWinRateRunes;

    const mostPopularStyles = buildRuneStyles(rawMostPopular.primaryStyleId, rawMostPopular.subStyleId);
    const highestWinRateStyles = buildRuneStyles(rawHighestWinRate.primaryStyleId, rawHighestWinRate.subStyleId);

    const mostPopular: RuneSetup = {
      ...rawMostPopular,
      primaryStyles: mostPopularStyles.primaryStyles,
      subStyles: mostPopularStyles.subStyles,
      winRate: round2(baseWinRate + 0.3),
      pickRate: round2(67.4),
    };

    const highestWinRate: RuneSetup = {
      ...rawHighestWinRate,
      primaryStyles: highestWinRateStyles.primaryStyles,
      subStyles: highestWinRateStyles.subStyles,
      winRate: round2(baseWinRate + 1.8),
      pickRate: round2(16.5),
    };

    return { mostPopular, highestWinRate };
  }
}

export const championRunesService = new ChampionRunesService();
