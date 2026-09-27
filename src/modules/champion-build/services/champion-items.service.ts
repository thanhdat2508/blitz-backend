import {
  ChampionItems,
  ItemSet,
  Role,
} from "../interfaces/champion-build.interface";
import {
  ChampionClass,
  ClassArchetypePreset,
  RolePreset,
} from "../constants/champion-build.constants";
import {
  CHAMPION_ITEM_OVERRIDES,
  CONTEXTUAL_SITUATIONAL_ITEMS,
  DamageProfile,
  SUB_ARCHETYPE_PRESETS,
} from "../data/champion-items.data";
import { randomInt, round2 } from "../../../utils/math";

export interface ResolveChampionItemsParams {
  championKey: string;
  role: Role;
  primaryClass: ChampionClass;
  partype?: string;
  classPreset: ClassArchetypePreset;
  rolePreset: RolePreset;
  baseWinRate: number;
}

export class ChampionItemsService {
  /**
   * Resolves champion items using a 3-tier hierarchical resolution:
   * Tier 1: Curated champion-specific signature overrides (Quinn, Jinx, Yasuo, Vladimir, etc.)
   * Tier 2: Sub-archetype & resource-aware adaptation (Manaless AP, Crit ADC, Enchanter Support)
   * Tier 3: Class preset baseline fallback
   */
  public resolveChampionItems(params: ResolveChampionItemsParams): ChampionItems {
    const {
      championKey,
      role,
      primaryClass,
      partype,
      classPreset,
      rolePreset,
      baseWinRate,
    } = params;

    const normalizedKey = championKey.toLowerCase().replace(/[^a-z0-9]/g, "");
    const override =
      CHAMPION_ITEM_OVERRIDES[championKey] ??
      Object.entries(CHAMPION_ITEM_OVERRIDES).find(
        ([key]) => key.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedKey
      )?.[1];

    // Determine sub-archetype if no champion-specific override exists
    const subArchetype = !override ? this.detectSubArchetype(role, primaryClass, partype) : undefined;

    // Resolved item IDs and progressions
    const coreItemIds =
      role === "support" && !override
        ? (subArchetype ? subArchetype.coreItems : [3869, 3190, 3107])
        : (override?.coreItems ?? subArchetype?.coreItems ?? classPreset.coreItems);

    const completedItemIds =
      role === "support" && !override
        ? (subArchetype ? subArchetype.completedItems : [3869, 3047, 3190, 3107, 3110, 2504])
        : (override?.completedItems ?? subArchetype?.completedItems ?? classPreset.completedItems);

    const buildOrder = override?.buildOrder ?? subArchetype?.buildOrder ?? classPreset.buildOrder;

    const candidateBoots = override?.boots !== undefined
      ? override.boots
      : (subArchetype?.boots ? [...subArchetype.boots] : [...classPreset.boots]);

    const startingLanerIds =
      override?.startingItemsLaner ??
      subArchetype?.startingItemsLaner ??
      classPreset.startingItemsLaner;

    const damageProfile =
      override?.damageProfile ??
      subArchetype?.damageProfile ??
      this.resolveClassDamageProfile(primaryClass);

    // 1. Starting Items
    const startingItemIds =
      role === "jungle" || role === "support"
        ? rolePreset.startingItems
        : startingLanerIds;

    const starting: ItemSet[] = [
      {
        itemIds: startingItemIds,
        winRate: round2(baseWinRate + 0.4),
        pickRate: round2(74.6),
        gamesPlayed: randomInt(11000, 19000),
      },
    ];

    if (role === "jungle") {
      starting.push({
        itemIds: [1101, 2003], // Gustwalker Hatchling + Health Potion
        winRate: round2(baseWinRate - 0.2),
        pickRate: round2(25.4),
        gamesPlayed: randomInt(3200, 6500),
      });
    } else if (role !== "support") {
      const altStart = startingItemIds[0] === 1056 ? [1054, 2003] : [1055, 2003];
      starting.push({
        itemIds: altStart,
        winRate: round2(baseWinRate - 0.3),
        pickRate: round2(23.8),
        gamesPlayed: randomInt(2800, 5200),
      });
    }

    // 2. Early Items
    const early: ItemSet[] = [
      {
        itemIds: rolePreset.earlyItems,
        winRate: round2(baseWinRate + 1.1),
        pickRate: round2(72.5),
        gamesPlayed: randomInt(9000, 15000),
      },
    ];

    // 3. Core Items
    const core: ItemSet[] = [
      {
        itemIds: coreItemIds,
        winRate: round2(baseWinRate + 3.8),
        pickRate: round2(48.2),
        gamesPlayed: randomInt(5000, 9000),
      },
    ];

    // 4. Completed 6 Items
    const completed: ItemSet[] = [
      {
        itemIds: completedItemIds,
        winRate: round2(baseWinRate + 6.2),
        pickRate: round2(35.4),
        gamesPlayed: randomInt(3500, 7000),
      },
    ];

    // 5. Boots progression
    const boots: ItemSet[] = candidateBoots.map((bootId, index) => ({
      itemIds: [bootId],
      winRate: round2(baseWinRate + (index === 0 ? 1.4 : 0.6)),
      pickRate: round2(index === 0 ? 63.5 : 24.1),
      gamesPlayed: randomInt(3000, 8000),
    }));

    // 6. Contextual Situational Items
    const situationalItemsList = override?.situational ?? CONTEXTUAL_SITUATIONAL_ITEMS[damageProfile];
    const situational: ItemSet[] = situationalItemsList.slice(0, 2).map((itemId, idx) => ({
      itemIds: [itemId],
      winRate: round2(baseWinRate + (idx === 0 ? 4.2 : 3.1)),
      pickRate: round2(idx === 0 ? 19.4 : 14.8),
      gamesPlayed: randomInt(1500, 4500),
    }));

    // 7. Trinkets
    const trinkets: ItemSet[] = rolePreset.trinkets.map((trinketId) => ({
      itemIds: [trinketId],
      winRate: round2(baseWinRate + 0.5),
      pickRate: round2(88.0),
      gamesPlayed: randomInt(12000, 22000),
    }));

    return {
      starting,
      early,
      core,
      completed,
      buildOrder,
      boots,
      situational,
      trinkets,
    };
  }

  private detectSubArchetype(
    role: Role,
    primaryClass: ChampionClass,
    partype?: string
  ): typeof SUB_ARCHETYPE_PRESETS[keyof typeof SUB_ARCHETYPE_PRESETS] | undefined {
    // 1. Support role Enchanter detection
    if (role === "support" && (primaryClass === "Mage" || primaryClass === "Support")) {
      return SUB_ARCHETYPE_PRESETS.enchanter_support;
    }

    // 2. Manaless AP detection (Mage or AP Assassin without Mana bar)
    const isManaless = partype && partype.toLowerCase() !== "mana";
    if (isManaless && (primaryClass === "Mage" || primaryClass === "Assassin")) {
      return SUB_ARCHETYPE_PRESETS.manaless_ap;
    }

    // 3. Marksman general Crit ADC standard
    if (primaryClass === "Marksman") {
      return SUB_ARCHETYPE_PRESETS.crit_marksman;
    }

    return undefined;
  }

  private resolveClassDamageProfile(primaryClass: ChampionClass): DamageProfile {
    switch (primaryClass) {
      case "Mage":
        return "ap_burst";
      case "Assassin":
        return "ad_lethality";
      case "Marksman":
        return "ad_crit";
      case "Fighter":
        return "ad_bruiser";
      case "Tank":
        return "tank";
      case "Support":
        return "tank";
    }
  }
}

export const championItemsService = new ChampionItemsService();
