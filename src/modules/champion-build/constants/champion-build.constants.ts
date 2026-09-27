import {
  DamageBreakdown,
  Role,
  RuneSetup,
  SimilarChampion,
  StatShardOption,
  StatShardRow,
  StatShardRowType,
  StatShards,
} from "../interfaces/champion-build.interface";

export const DDRAGON_VERSION = "14.24.1";
export const DDRAGON_CDN = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}`;
export const DDRAGON_SPLASH_CDN = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash";

export type ChampionClass = "Mage" | "Assassin" | "Marksman" | "Fighter" | "Tank" | "Support";

export interface RolePreset {
  spells: Array<{ spell1Id: number; spell2Id: number; pickRate: number; winRateOffset: number }>;
  startingItems: number[];
  earlyItems: number[];
  boots: number[];
  trinkets: number[];
}

export const ROLE_PRESETS: Record<Role, RolePreset> = {
  jungle: {
    spells: [
      { spell1Id: 4, spell2Id: 11, pickRate: 78.4, winRateOffset: 1.2 }, // Flash + Smite
      { spell1Id: 6, spell2Id: 11, pickRate: 21.6, winRateOffset: 0.8 }, // Ghost + Smite
    ],
    startingItems: [1102, 2003],    // Mosstomper Seedling + Health Potion
    earlyItems: [1001, 3133, 3044], // Boots, Caulfield's, Phage
    boots: [3047, 3111, 3006],      // Steelcaps, Mercury's, Berserker's
    trinkets: [3364],              // Oracle Lens
  },
  support: {
    spells: [
      { spell1Id: 4, spell2Id: 14, pickRate: 58.2, winRateOffset: 0.9 }, // Flash + Ignite
      { spell1Id: 4, spell2Id: 3, pickRate: 41.8, winRateOffset: 0.4 },  // Flash + Exhaust
    ],
    startingItems: [3865, 2003, 2003], // World Atlas + 2 Potions
    earlyItems: [1001, 3067, 3114],    // Boots, Kindlegem, Forbidden Idol
    boots: [3158, 3111, 3009],         // Ionian Boots, Mercury's, Swiftness
    trinkets: [3364],                  // Oracle Lens
  },
  mid: {
    spells: [
      { spell1Id: 4, spell2Id: 14, pickRate: 64.5, winRateOffset: 1.1 }, // Flash + Ignite
      { spell1Id: 4, spell2Id: 12, pickRate: 35.5, winRateOffset: 0.5 }, // Flash + Teleport
    ],
    startingItems: [1055, 2003],       // Doran's Blade
    earlyItems: [1001, 3133, 3134],    // Boots, Caulfield's, Dirk
    boots: [3020, 3006, 3111],         // Sorcerer's, Berserker's, Mercury's
    trinkets: [3340, 3363],            // Stealth Ward, Farsight
  },
  top: {
    spells: [
      { spell1Id: 4, spell2Id: 12, pickRate: 82.1, winRateOffset: 0.7 }, // Flash + Teleport
      { spell1Id: 4, spell2Id: 14, pickRate: 17.9, winRateOffset: 1.0 }, // Flash + Ignite
    ],
    startingItems: [1055, 2003],       // Doran's Blade / Shield
    earlyItems: [1001, 1037, 3044],    // Boots, Pickaxe, Phage
    boots: [3047, 3111, 3006],         // Steelcaps, Mercury's, Berserker's
    trinkets: [3340, 3363],
  },
  adc: {
    spells: [
      { spell1Id: 4, spell2Id: 7, pickRate: 72.8, winRateOffset: 0.8 },  // Flash + Heal
      { spell1Id: 4, spell2Id: 21, pickRate: 27.2, winRateOffset: 1.1 }, // Flash + Barrier
    ],
    startingItems: [1055, 2003],       // Doran's Blade + Potion
    earlyItems: [1001, 1037, 6670],    // Boots, Pickaxe, Noonquiver
    boots: [3006],                     // Berserker's Greaves
    trinkets: [3363],                  // Farsight
  },
};

export type RawRunePreset = Omit<RuneSetup, "winRate" | "pickRate" | "primaryStyles" | "subStyles">;

export interface ClassArchetypePreset {
  coreItems: number[];
  completedItems: number[];
  buildOrder: number[];
  startingItemsLaner: number[];
  boots: number[];
  damageBreakdown: DamageBreakdown;
  skillsMaxOrder: string[];
  mostPopularRunes: RawRunePreset;
  highestWinRateRunes: RawRunePreset;
  similarChampions: SimilarChampion[];
  insights: {
    general: string[];
    strengths: string[];
    weaknesses: string[];
  };
}

export const STAT_MOD_ICONS = {
  ADAPTIVE_FORCE: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/StatModsAdaptiveForceIcon.png",
  ATTACK_SPEED: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/StatModsAttackSpeedIcon.png",
  ABILITY_HASTE: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/StatModsCDRScalingIcon.png",
  MOVEMENT_SPEED: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/StatModsMovementSpeedIcon.png",
  SCALING_HEALTH: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/StatModsHealthScalingIcon.png",
  FLAT_HEALTH: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/StatModsHealthPlusIcon.png",
  TENACITY: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/StatModsTenacityIcon.png",
} as const;

export type StatShardDefinition = Omit<StatShardOption, "isSelected">;

export const STAT_SHARD_ROW_DEFINITIONS: Record<StatShardRowType, readonly StatShardDefinition[]> = {
  offense: [
    {
      id: 5008,
      code: "adaptive_force",
      name: "Adaptive Force",
      description: "+9 Adaptive Force",
      iconUrl: STAT_MOD_ICONS.ADAPTIVE_FORCE,
    },
    {
      id: 5005,
      code: "attack_speed",
      name: "Attack Speed",
      description: "+10% Attack Speed",
      iconUrl: STAT_MOD_ICONS.ATTACK_SPEED,
    },
    {
      id: 5007,
      code: "ability_haste",
      name: "Ability Haste",
      description: "+8 Ability Haste",
      iconUrl: STAT_MOD_ICONS.ABILITY_HASTE,
    },
  ],
  flex: [
    {
      id: 5008,
      code: "adaptive_force",
      name: "Adaptive Force",
      description: "+9 Adaptive Force",
      iconUrl: STAT_MOD_ICONS.ADAPTIVE_FORCE,
    },
    {
      id: 5010,
      code: "movement_speed",
      name: "Movement Speed",
      description: "+2% Movement Speed",
      iconUrl: STAT_MOD_ICONS.MOVEMENT_SPEED,
    },
    {
      id: 5001,
      code: "health_scaling",
      name: "Scaling Health",
      description: "+10-180 Health (based on level)",
      iconUrl: STAT_MOD_ICONS.SCALING_HEALTH,
    },
  ],
  defense: [
    {
      id: 5011,
      code: "health_flat",
      name: "Health",
      description: "+65 Health",
      iconUrl: STAT_MOD_ICONS.FLAT_HEALTH,
    },
    {
      id: 5013,
      code: "tenacity",
      name: "Tenacity and Slow Resist",
      description: "+10% Tenacity and Slow Resist",
      iconUrl: STAT_MOD_ICONS.TENACITY,
    },
    {
      id: 5001,
      code: "health_scaling",
      name: "Scaling Health",
      description: "+10-180 Health (based on level)",
      iconUrl: STAT_MOD_ICONS.SCALING_HEALTH,
    },
  ],
};

export function buildStatShards(offenseId: number, flexId: number, defenseId: number): StatShards {
  const buildRow = (
    rowNumber: number,
    type: StatShardRowType,
    selectedId: number
  ): StatShardRow => ({
    row: rowNumber,
    type,
    selectedId,
    options: STAT_SHARD_ROW_DEFINITIONS[type].map((def) => ({
      ...def,
      isSelected: def.id === selectedId,
    })),
  });

  return {
    offense: offenseId,
    flex: flexId,
    defense: defenseId,
    slots: [offenseId, flexId, defenseId],
    rows: [
      buildRow(1, "offense", offenseId),
      buildRow(2, "flex", flexId),
      buildRow(3, "defense", defenseId),
    ],
  };
}

export const CLASS_PRESETS: Record<ChampionClass, ClassArchetypePreset> = {
  Mage: {
    coreItems: [3285, 4645, 3089], // Luden's, Shadowflame, Rabadon's
    completedItems: [3285, 3020, 4645, 3089, 3157, 3135], // Luden's, Sorc Shoes, Shadowflame, Rabadon's, Zhonya's, Void Staff
    buildOrder: [1056, 3802, 3285, 1001, 3020, 3145, 4645], // Lost Chapter -> Luden's -> Sorc -> Hextech Alt -> Shadowflame
    startingItemsLaner: [1056, 2003, 2003],
    boots: [3020, 3158],
    damageBreakdown: { physical: 6.5, magic: 91.2, trueDamage: 2.3 },
    skillsMaxOrder: ["Q", "W", "E"],
    mostPopularRunes: {
      primaryStyleId: 8200,
      primaryStyleName: "Sorcery",
      keystoneId: 8229, // Arcane Comet
      selectedPerkIds: [8226, 8210, 8237],
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8345, 8347],
      statShards: buildStatShards(5008, 5008, 5011),
    },
    highestWinRateRunes: {
      primaryStyleId: 8100,
      primaryStyleName: "Domination",
      keystoneId: 8112, // Electrocute
      selectedPerkIds: [8126, 8138, 8105],
      subStyleId: 8200,
      subStyleName: "Sorcery",
      subPerkIds: [8226, 8236],
      statShards: buildStatShards(5007, 5008, 5001),
    },
    similarChampions: [
      { championId: 103, name: "Ahri", key: "Ahri", avatarUrl: `${DDRAGON_CDN}/img/champion/Ahri.png` },
      { championId: 134, name: "Syndra", key: "Syndra", avatarUrl: `${DDRAGON_CDN}/img/champion/Syndra.png` },
      { championId: 99, name: "Lux", key: "Lux", avatarUrl: `${DDRAGON_CDN}/img/champion/Lux.png` },
      { championId: 61, name: "Orianna", key: "Orianna", avatarUrl: `${DDRAGON_CDN}/img/champion/Orianna.png` },
      { championId: 112, name: "Viktor", key: "Viktor", avatarUrl: `${DDRAGON_CDN}/img/champion/Viktor.png` },
    ],
    insights: {
      general: [
        "Play around power spikes at Lost Chapter and first completed AP item.",
        "Keep vision control around mid river bushes to avoid side ganks.",
      ],
      strengths: [
        "Massive waveclear and burst damage in teamfights.",
        "High range allows safe farming and zone control.",
      ],
      weaknesses: [
        "Vulnerable to high-mobility dive assassins when Flash is down.",
        "Mana reliant in early laning phase.",
      ],
    },
  },

  Assassin: {
    coreItems: [6676, 6698, 3036], // Profane Hydra, Opportunity, LDR
    completedItems: [6698, 3009, 3814, 6676, 6697, 3036], // Profane, Swifties, Edge of Night, Collector, Hubris, LDR
    buildOrder: [3077, 2020, 6698, 1001, 3009, 3134, 3814], // Tiamat -> Brutalizer -> Hydra -> Boots -> Swiftness -> Dirk -> Edge of Night
    startingItemsLaner: [1055, 2003],
    boots: [3158, 3009, 3006],
    damageBreakdown: { physical: 91.0, magic: 0.5, trueDamage: 8.5 },
    skillsMaxOrder: ["Q", "E", "W"],
    mostPopularRunes: {
      primaryStyleId: 8100,
      primaryStyleName: "Domination",
      keystoneId: 8112, // Electrocute
      selectedPerkIds: [8143, 8138, 8105],
      subStyleId: 8000,
      subStyleName: "Precision",
      subPerkIds: [9111, 8014],
      statShards: buildStatShards(5008, 5008, 5011),
    },
    highestWinRateRunes: {
      primaryStyleId: 8100,
      primaryStyleName: "Domination",
      keystoneId: 8128, // Dark Harvest
      selectedPerkIds: [8143, 8138, 8106],
      subStyleId: 8200,
      subStyleName: "Sorcery",
      subPerkIds: [8233, 8236],
      statShards: buildStatShards(5008, 5010, 5001),
    },
    similarChampions: [
      { championId: 238, name: "Zed", key: "Zed", avatarUrl: `${DDRAGON_CDN}/img/champion/Zed.png` },
      { championId: 91, name: "Talon", key: "Talon", avatarUrl: `${DDRAGON_CDN}/img/champion/Talon.png` },
      { championId: 121, name: "Kha'Zix", key: "Khazix", avatarUrl: `${DDRAGON_CDN}/img/champion/Khazix.png` },
      { championId: 555, name: "Pyke", key: "Pyke", avatarUrl: `${DDRAGON_CDN}/img/champion/Pyke.png` },
      { championId: 107, name: "Rengar", key: "Rengar", avatarUrl: `${DDRAGON_CDN}/img/champion/Rengar.png` },
    ],
    insights: {
      general: [
        "Roam to side lanes whenever your ultimate is ready to create numerical advantages.",
        "Look to flank backline carries during teamfight engagements.",
      ],
      strengths: [
        "Extremely high single-target burst execution.",
        "Excellent map roaming and pick potential.",
      ],
      weaknesses: [
        "Falls off in 5v5 front-to-back late game teamfights.",
        "Hard countered by defensive items like Zhonya's and Guardian Angel.",
      ],
    },
  },

  Marksman: {
    coreItems: [6672, 3031, 3046], // Kraken Slayer, Infinity Edge, Phantom Dancer
    completedItems: [6672, 3006, 3031, 3046, 3036, 3072], // Kraken, Berserker's Greaves, Infinity Edge, Phantom Dancer, LDR, Bloodthirster
    buildOrder: [1036, 1037, 6670, 6672, 1001, 3006, 1038, 3031],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3009],
    damageBreakdown: { physical: 89.4, magic: 2.1, trueDamage: 8.5 },
    skillsMaxOrder: ["W", "Q", "E"],
    mostPopularRunes: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8021, // Fleet Footwork
      selectedPerkIds: [9101, 9104, 8014],
      subStyleId: 8200,
      subStyleName: "Sorcery",
      subPerkIds: [8233, 8236],
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRateRunes: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8005, // Press the Attack
      selectedPerkIds: [9111, 9104, 8014],
      subStyleId: 8100,
      subStyleName: "Domination",
      subPerkIds: [8138, 8105],
      statShards: buildStatShards(5005, 5008, 5011),
    },
    similarChampions: [
      { championId: 10, name: "Kayle", key: "Kayle", avatarUrl: `${DDRAGON_CDN}/img/champion/Kayle.png` },
      { championId: 15, name: "Sivir", key: "Sivir", avatarUrl: `${DDRAGON_CDN}/img/champion/Sivir.png` },
      { championId: 17, name: "Teemo", key: "Teemo", avatarUrl: `${DDRAGON_CDN}/img/champion/Teemo.png` },
      { championId: 18, name: "Tristana", key: "Tristana", avatarUrl: `${DDRAGON_CDN}/img/champion/Tristana.png` },
      { championId: 21, name: "Miss Fortune", key: "MissFortune", avatarUrl: `${DDRAGON_CDN}/img/champion/MissFortune.png` },
      { championId: 22, name: "Ashe", key: "Ashe", avatarUrl: `${DDRAGON_CDN}/img/champion/Ashe.png` },
    ],
    insights: {
      general: [
        "Excels with items that boost attack damage, critical strike chance, and movement speed.",
        "Can proc passive multiple times in prolonged skirmishes.",
      ],
      strengths: [
        "Very strong laner, considered an oppressive lane bully.",
        "Attack speed and movement speed buffs make trading very favorable.",
      ],
      weaknesses: [
        "Aggressive positioning leaves her exposed to being ganked or flanked.",
        "Needs early lead to stay relevant and falls off if neutral.",
      ],
    },
  },

  Fighter: {
    coreItems: [3078, 6610, 3053], // Trinity Force, Sundered Sky, Sterak's
    completedItems: [3078, 3047, 6610, 3053, 6333, 3026], // Triforce, Steelcaps, Sundered, Steraks, Death's Dance, GA
    buildOrder: [3044, 3057, 3078, 1001, 3047, 3133, 6610], // Phage -> Sheen -> Triforce -> Boots -> Steelcaps -> Warhammer -> Sundered Sky
    startingItemsLaner: [1055, 2003],
    boots: [3047, 3111],
    damageBreakdown: { physical: 78.5, magic: 14.2, trueDamage: 7.3 },
    skillsMaxOrder: ["Q", "E", "W"],
    mostPopularRunes: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [9111, 9104, 8299],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8429, 8451],
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRateRunes: {
      primaryStyleId: 8400,
      primaryStyleName: "Resolve",
      keystoneId: 8437, // Grasp
      selectedPerkIds: [8401, 8429, 8451],
      subStyleId: 8000,
      subStyleName: "Precision",
      subPerkIds: [9111, 8299],
      statShards: buildStatShards(5008, 5008, 5013),
    },
    similarChampions: [
      { championId: 266, name: "Aatrox", key: "Aatrox", avatarUrl: `${DDRAGON_CDN}/img/champion/Aatrox.png` },
      { championId: 86, name: "Garen", key: "Garen", avatarUrl: `${DDRAGON_CDN}/img/champion/Garen.png` },
      { championId: 122, name: "Darius", key: "Darius", avatarUrl: `${DDRAGON_CDN}/img/champion/Darius.png` },
      { championId: 24, name: "Jax", key: "Jax", avatarUrl: `${DDRAGON_CDN}/img/champion/Jax.png` },
      { championId: 58, name: "Renekton", key: "Renekton", avatarUrl: `${DDRAGON_CDN}/img/champion/Renekton.png` },
    ],
    insights: {
      general: [
        "Prioritize extended trades where Conqueror and item healing can stack.",
        "Split push effectively in side lanes during mid game.",
      ],
      strengths: [
        "Incredible 1v1 and 1v2 skirmish potential.",
        "High durability combined with sustained physical damage.",
      ],
      weaknesses: [
        "Susceptible to heavy kite compositions and chain crowd control.",
        "Requires good wave management to avoid being frozen on.",
      ],
    },
  },

  Tank: {
    coreItems: [3084, 3068, 3075], // Heartsteel, Sunfire, Thornmail
    completedItems: [3084, 3047, 3068, 3075, 4401, 3110], // Heartsteel, Steelcaps, Sunfire, Thornmail, Force of Nature, Frozen Heart
    buildOrder: [1054, 3211, 3084, 1001, 3047, 1031, 3068],
    startingItemsLaner: [1054, 2003],
    boots: [3047, 3111],
    damageBreakdown: { physical: 34.0, magic: 58.5, trueDamage: 7.5 },
    skillsMaxOrder: ["Q", "W", "E"],
    mostPopularRunes: {
      primaryStyleId: 8400,
      primaryStyleName: "Resolve",
      keystoneId: 8437,
      selectedPerkIds: [8401, 8429, 8451],
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8345, 8347],
      statShards: buildStatShards(5007, 5001, 5001),
    },
    highestWinRateRunes: {
      primaryStyleId: 8400,
      primaryStyleName: "Resolve",
      keystoneId: 8465,
      selectedPerkIds: [8463, 8444, 8453],
      subStyleId: 8000,
      subStyleName: "Precision",
      subPerkIds: [9111, 8014],
      statShards: buildStatShards(5005, 5001, 5013),
    },
    similarChampions: [
      { championId: 54, name: "Malphite", key: "Malphite", avatarUrl: `${DDRAGON_CDN}/img/champion/Malphite.png` },
      { championId: 516, name: "Ornn", key: "Ornn", avatarUrl: `${DDRAGON_CDN}/img/champion/Ornn.png` },
      { championId: 78, name: "Poppy", key: "Poppy", avatarUrl: `${DDRAGON_CDN}/img/champion/Poppy.png` },
      { championId: 31, name: "Cho'Gath", key: "Chogath", avatarUrl: `${DDRAGON_CDN}/img/champion/Chogath.png` },
      { championId: 14, name: "Sion", key: "Sion", avatarUrl: `${DDRAGON_CDN}/img/champion/Sion.png` },
    ],
    insights: {
      general: [
        "Play frontline and protect your high damage backline carries.",
        "Stack health and resistances according to enemy damage profile.",
      ],
      strengths: [
        "Unrivaled teamfight durability and engage capability.",
        "Cheap itemization allows smooth mid game power curve.",
      ],
      weaknesses: [
        "Low individual wave clear without Bami's Cinder.",
        "Can be shredded by % health damage items like Blade of the Ruined King and LDR.",
      ],
    },
  },

  Support: {
    coreItems: [3869, 3190, 3107], // Solstice Sleigh, Locket, Redemption
    completedItems: [3869, 3158, 3190, 3107, 3222, 3110], // Solstice Sleigh, Ionian Boots, Locket, Redemption, Mikael's, Frozen Heart
    buildOrder: [3865, 1001, 3158, 3067, 3190, 3114, 3107],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3158, 3009],
    damageBreakdown: { physical: 18.2, magic: 74.3, trueDamage: 7.5 },
    skillsMaxOrder: ["E", "Q", "W"],
    mostPopularRunes: {
      primaryStyleId: 8400,
      primaryStyleName: "Resolve",
      keystoneId: 8465, // Guardian
      selectedPerkIds: [8463, 8444, 8453],
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8345, 8347],
      statShards: buildStatShards(5007, 5008, 5011),
    },
    highestWinRateRunes: {
      primaryStyleId: 8200,
      primaryStyleName: "Sorcery",
      keystoneId: 8214, // Summon Aery
      selectedPerkIds: [8226, 8210, 8236],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8444, 8453],
      statShards: buildStatShards(5007, 5010, 5011),
    },
    similarChampions: [
      { championId: 412, name: "Thresh", key: "Thresh", avatarUrl: `${DDRAGON_CDN}/img/champion/Thresh.png` },
      { championId: 111, name: "Nautilus", key: "Nautilus", avatarUrl: `${DDRAGON_CDN}/img/champion/Nautilus.png` },
      { championId: 89, name: "Leona", key: "Leona", avatarUrl: `${DDRAGON_CDN}/img/champion/Leona.png` },
      { championId: 43, name: "Karma", key: "Karma", avatarUrl: `${DDRAGON_CDN}/img/champion/Karma.png` },
      { championId: 117, name: "Lulu", key: "Lulu", avatarUrl: `${DDRAGON_CDN}/img/champion/Lulu.png` },
    ],
    insights: {
      general: [
        "Control deep vision in enemy jungle around Dragon and Baron timers.",
        "Roam with your jungler to secure objectives and mid lane pressure.",
      ],
      strengths: [
        "Exceptional utility, peeling, and crowd control.",
        "Functions effectively on very low economy.",
      ],
      weaknesses: [
        "Dependent on teammates to follow up on engages.",
        "Fragile when caught warding alone.",
      ],
    },
  },
};
