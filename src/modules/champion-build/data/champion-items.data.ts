export type DamageProfile = "ad_crit" | "ad_lethality" | "ad_bruiser" | "ap_burst" | "ap_manaless" | "ap_bruiser" | "tank" | "enchanter";

export interface ChampionItemOverride {
  coreItems: number[];
  completedItems: number[];
  buildOrder: number[];
  startingItemsLaner?: number[];
  boots?: number[];
  damageProfile: DamageProfile;
  situational?: number[];
}

export const CONTEXTUAL_SITUATIONAL_ITEMS: Record<DamageProfile, number[]> = {
  ad_crit: [3072, 3042, 3026, 3156, 3139], // Bloodthirster, Shieldbow, GA, Maw, Mercurial
  ad_lethality: [3814, 5601, 3156, 3026, 6695], // Edge of Night, Serpent's Fang, Maw, GA, Serylda's
  ad_bruiser: [6333, 3156, 3053, 3026, 6609], // Death's Dance, Maw, Sterak's, GA, Chempunk
  ap_burst: [3157, 3102, 3165, 3137, 4629], // Zhonya's, Banshee's, Morello, Cryptbloom, Cosmic Drive
  ap_manaless: [3157, 3102, 3165, 4637, 3135], // Zhonya's, Banshee's, Morello, Riftmaker, Void Staff
  ap_bruiser: [3157, 3116, 6665, 8020, 2504], // Zhonya's, Rylai's, Jak'Sho, Abyssal Mask, Kaenic Rookern
  tank: [3143, 4401, 2504, 3110, 6665], // Randuin's, Force of Nature, Kaenic Rookern, Frozen Heart, Jak'Sho
  enchanter: [3222, 6616, 6620, 3157, 3107], // Mikael's, Staff of Flowing Water, Dawncore, Zhonya's, Redemption
};

export interface SubArchetypePreset {
  coreItems: number[];
  completedItems: number[];
  buildOrder: number[];
  startingItemsLaner: number[];
  boots: number[];
  damageProfile: DamageProfile;
}

export const SUB_ARCHETYPE_PRESETS: Record<string, SubArchetypePreset> = {
  crit_marksman: {
    coreItems: [6672, 3031, 3046], // Kraken Slayer, Infinity Edge, Phantom Dancer
    completedItems: [6672, 3006, 3031, 3046, 3036, 3072], // Kraken, Berserker's, IE, PD, LDR, Bloodthirster
    buildOrder: [1036, 1037, 6670, 6672, 1001, 3006, 1038, 3031],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3009],
    damageProfile: "ad_crit",
  },
  manaless_ap: {
    coreItems: [4637, 4629, 3089], // Riftmaker, Cosmic Drive, Rabadon's
    completedItems: [4637, 3020, 4629, 3089, 3157, 3135], // Riftmaker, Sorcerer's, Cosmic Drive, Rabadon's, Zhonya's, Void Staff
    buildOrder: [1052, 3145, 4637, 1001, 3020, 3108, 4629],
    startingItemsLaner: [1054, 2003], // Doran's Shield + Potion
    boots: [3020, 3158],
    damageProfile: "ap_manaless",
  },
  enchanter_support: {
    coreItems: [3870, 6617, 3504], // Dream Maker, Moonstone Renewer, Ardent Censer
    completedItems: [3870, 3158, 6617, 3504, 6616, 3107], // Dream Maker, Ionian, Moonstone, Ardent, Staff of Flowing Water, Redemption
    buildOrder: [3865, 1001, 3158, 3067, 6617, 3114, 3504],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3158, 3009],
    damageProfile: "enchanter",
  },
  engage_tank_support: {
    coreItems: [3869, 3190, 3107], // Solstice Sleigh, Locket, Redemption
    completedItems: [3869, 3047, 3190, 3107, 3110, 2504], // Solstice Sleigh, Steelcaps, Locket, Redemption, Frozen Heart, Kaenic Rookern
    buildOrder: [3865, 1001, 3047, 3067, 3190, 3105, 3107],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3047, 3158, 3009],
    damageProfile: "tank",
  },
};

export const CHAMPION_ITEM_OVERRIDES: Record<string, ChampionItemOverride> = {
  // --- MARKSMEN & SPECIALIZED AD CARRIES ---
  Quinn: {
    coreItems: [6698, 6676, 3036], // Opportunity, Profane Hydra, LDR
    completedItems: [6698, 3009, 3814, 6676, 6697, 3036], // Opportunity, Swifties, Edge of Night, Profane Hydra, Collector, LDR
    buildOrder: [3077, 2020, 6698, 1001, 3009, 3134, 3814],
    startingItemsLaner: [1055, 2003],
    boots: [3009, 3006],
    damageProfile: "ad_lethality",
    situational: [3026, 3814, 3156],
  },
  Jinx: {
    coreItems: [6672, 3031, 3085], // Kraken Slayer, Infinity Edge, Runaan's Hurricane
    completedItems: [6672, 3006, 3031, 3085, 3036, 3072], // Kraken, Berserker's, IE, Runaan's, LDR, Bloodthirster
    buildOrder: [1036, 1037, 6670, 6672, 1001, 3006, 1038, 3031],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3009],
    damageProfile: "ad_crit",
  },
  Caitlyn: {
    coreItems: [6697, 3031, 3094], // The Collector, Infinity Edge, Rapid Firecannon
    completedItems: [6697, 3006, 3031, 3094, 3036, 3072], // Collector, Berserker's, IE, RFC, LDR, Bloodthirster
    buildOrder: [3134, 1037, 6697, 1001, 3006, 1038, 3031],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3009],
    damageProfile: "ad_crit",
  },
  Ezreal: {
    coreItems: [3078, 3004, 6695], // Trinity Force, Manamune, Serylda's Grudge
    completedItems: [3078, 3158, 3004, 6695, 3161, 3026], // Trinity Force, Ionian, Muramana, Serylda's, Shojin, GA
    buildOrder: [3070, 3057, 3044, 3078, 1001, 3158, 3133, 3004],
    startingItemsLaner: [1055, 2003],
    boots: [3158, 3006],
    damageProfile: "ad_bruiser",
  },
  Vayne: {
    coreItems: [3153, 3124, 3302], // Blade of the Ruined King, Guinsoo's Rageblade, Terminus
    completedItems: [3153, 3006, 3124, 3302, 3091, 6665], // BoRK, Berserker's, Guinsoo's, Terminus, Wit's End, Jak'Sho
    buildOrder: [1043, 1053, 3153, 1001, 3006, 1043, 3124],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3047],
    damageProfile: "ad_crit",
  },
  KogMaw: {
    coreItems: [3153, 3124, 3085], // Blade of the Ruined King, Guinsoo's, Runaan's
    completedItems: [3153, 3006, 3124, 3085, 3302, 6665], // BoRK, Berserker's, Guinsoo's, Runaan's, Terminus, Jak'Sho
    buildOrder: [1043, 1053, 3153, 1001, 3006, 1043, 3124],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3009],
    damageProfile: "ad_crit",
  },
  Jhin: {
    coreItems: [6697, 3031, 3094], // The Collector, Infinity Edge, Rapid Firecannon
    completedItems: [6697, 3009, 3031, 3094, 3036, 3072], // Collector, Boots of Swiftness, IE, RFC, LDR, Bloodthirster
    buildOrder: [3134, 1037, 6697, 1001, 3009, 1038, 3031],
    startingItemsLaner: [1055, 2003],
    boots: [3009, 3006],
    damageProfile: "ad_crit",
  },
  Kaisa: {
    coreItems: [6672, 3124, 3115], // Kraken Slayer, Guinsoo's Rageblade, Nashor's Tooth
    completedItems: [6672, 3006, 3124, 3115, 3157, 3135], // Kraken, Berserker's, Guinsoo's, Nashor's, Zhonya's, Void Staff
    buildOrder: [1036, 1037, 6672, 1001, 3006, 1043, 3124],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3020],
    damageProfile: "ad_crit",
  },
  Samira: {
    coreItems: [6697, 3031, 3036], // The Collector, Infinity Edge, LDR
    completedItems: [6697, 3047, 3031, 3036, 3072, 3026], // Collector, Plated Steelcaps, IE, LDR, Bloodthirster, GA
    buildOrder: [3134, 1037, 6697, 1001, 3047, 1038, 3031],
    startingItemsLaner: [1055, 2003],
    boots: [3047, 3111],
    damageProfile: "ad_crit",
  },
  Draven: {
    coreItems: [3072, 3031, 6697], // Bloodthirster, Infinity Edge, The Collector
    completedItems: [3072, 3006, 3031, 6697, 3036, 3026], // Bloodthirster, Berserker's, IE, Collector, LDR, GA
    buildOrder: [1038, 1053, 3072, 1001, 3006, 1038, 3031],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3047],
    damageProfile: "ad_crit",
  },
  Ashe: {
    coreItems: [6672, 3078, 3085], // Kraken Slayer, Trinity Force, Runaan's
    completedItems: [6672, 3006, 3078, 3085, 3036, 3072], // Kraken, Berserker's, Triforce, Runaan's, LDR, Bloodthirster
    buildOrder: [1036, 1037, 6672, 1001, 3006, 3057, 3078],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3009],
    damageProfile: "ad_crit",
  },
  MissFortune: {
    coreItems: [6698, 6697, 3036], // Opportunity, The Collector, LDR
    completedItems: [6698, 3009, 6697, 3814, 6695, 3036], // Opportunity, Swifties, Collector, Edge of Night, Serylda's, LDR
    buildOrder: [3134, 1037, 6698, 1001, 3009, 3134, 6697],
    startingItemsLaner: [1055, 2003],
    boots: [3009, 3006],
    damageProfile: "ad_lethality",
  },

  // --- MELEE CRIT SKIRMISHERS ---
  Yasuo: {
    coreItems: [3153, 3031, 3042], // Blade of the Ruined King, Infinity Edge, Immortal Shieldbow
    completedItems: [3006, 3153, 3031, 3042, 6333, 3026], // Berserker's, BoRK, IE, Shieldbow, Death's Dance, GA
    buildOrder: [1001, 3006, 1053, 1043, 3153, 1038, 3031],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3047],
    damageProfile: "ad_crit",
  },
  Yone: {
    coreItems: [3153, 3031, 3042], // Blade of the Ruined King, Infinity Edge, Immortal Shieldbow
    completedItems: [3006, 3153, 3031, 3042, 6333, 3026], // Berserker's, BoRK, IE, Shieldbow, Death's Dance, GA
    buildOrder: [1001, 3006, 1053, 1043, 3153, 1038, 3031],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3047],
    damageProfile: "ad_crit",
  },
  Tryndamere: {
    coreItems: [6672, 3031, 3046], // Kraken Slayer, Infinity Edge, Phantom Dancer
    completedItems: [3006, 6672, 3031, 3046, 3036, 6677], // Berserker's, Kraken, IE, PD, LDR, Yun Tal
    buildOrder: [1001, 3006, 1036, 1037, 6672, 1038, 3031],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3047],
    damageProfile: "ad_crit",
  },

  // --- SPECIALIZED MAGES & AP CHAMPIONS ---
  Vladimir: {
    coreItems: [4637, 4629, 3089], // Riftmaker, Cosmic Drive, Rabadon's Deathcap
    completedItems: [4637, 3020, 4629, 3089, 3157, 3135], // Riftmaker, Sorcs, Cosmic Drive, Rabadon, Zhonya, Void Staff
    buildOrder: [1052, 3145, 4637, 1001, 3020, 3108, 4629],
    startingItemsLaner: [1054, 2003],
    boots: [3020, 3158],
    damageProfile: "ap_manaless",
  },
  Katarina: {
    coreItems: [3100, 3115, 4645], // Lich Bane, Nashor's Tooth, Shadowflame
    completedItems: [3100, 3020, 3115, 4645, 3157, 3089], // Lich Bane, Sorcs, Nashor's, Shadowflame, Zhonya, Rabadon
    buildOrder: [3057, 3145, 3100, 1001, 3020, 1043, 3115],
    startingItemsLaner: [1054, 2003],
    boots: [3020, 3006],
    damageProfile: "ap_manaless",
  },
  Akali: {
    coreItems: [3100, 4645, 3157], // Lich Bane, Shadowflame, Zhonya's
    completedItems: [3100, 3020, 4645, 3157, 3089, 3135], // Lich Bane, Sorcs, Shadowflame, Zhonya, Rabadon, Void Staff
    buildOrder: [3057, 3145, 3100, 1001, 3020, 3145, 4645],
    startingItemsLaner: [1054, 2003],
    boots: [3020, 3111],
    damageProfile: "ap_manaless",
  },
  Singed: {
    coreItems: [3116, 6653, 3742], // Rylai's, Liandry's, Dead Man's Plate
    completedItems: [3116, 3009, 6653, 3742, 4401, 6665], // Rylai's, Swifties, Liandry's, Dead Man's, Force of Nature, Jak'Sho
    buildOrder: [1052, 1011, 3116, 1001, 3009, 1052, 6653],
    startingItemsLaner: [1082, 2031], // Dark Seal + Refillable Potion
    boots: [3009, 3047],
    damageProfile: "ap_bruiser",
  },
  Cassiopeia: {
    coreItems: [3040, 6657, 3116], // Seraph's Embrace, Rod of Ages, Rylai's
    completedItems: [6657, 3040, 3116, 3089, 3157, 3135], // RoA, Seraph's, Rylai's, Rabadon's, Zhonya's, Void Staff
    buildOrder: [3070, 1058, 6657, 3108, 3040, 1011, 3116],
    startingItemsLaner: [1056, 2003, 2003],
    boots: [], // Cassiopeia passive: cannot buy boots!
    damageProfile: "ap_burst",
  },
  Ryze: {
    coreItems: [3040, 6657, 4629], // Seraph's Embrace, Rod of Ages, Cosmic Drive
    completedItems: [6657, 3020, 3040, 4629, 3089, 3157], // RoA, Sorcerer's, Seraph's, Cosmic Drive, Rabadon, Zhonya
    buildOrder: [3070, 1058, 6657, 1001, 3020, 3108, 3040],
    startingItemsLaner: [1056, 2003, 2003],
    boots: [3020, 3158],
    damageProfile: "ap_burst",
  },
  Rumble: {
    coreItems: [6653, 4637, 3157], // Liandry's Torment, Riftmaker, Zhonya's
    completedItems: [6653, 3020, 4637, 3157, 3089, 3135], // Liandry's, Sorcs, Riftmaker, Zhonya, Rabadon, Void Staff
    buildOrder: [1052, 3145, 6653, 1001, 3020, 3145, 4637],
    startingItemsLaner: [1054, 2003],
    boots: [3020, 3047],
    damageProfile: "ap_manaless",
  },
  Kennen: {
    coreItems: [3152, 4645, 3157], // Hextech Rocketbelt, Shadowflame, Zhonya's
    completedItems: [3152, 3020, 4645, 3157, 3089, 3135], // Rocketbelt, Sorcs, Shadowflame, Zhonya, Rabadon, Void Staff
    buildOrder: [3145, 3067, 3152, 1001, 3020, 3145, 4645],
    startingItemsLaner: [1054, 2003],
    boots: [3020, 3158],
    damageProfile: "ap_manaless",
  },
  Mordekaiser: {
    coreItems: [3116, 6653, 4637], // Rylai's, Liandry's, Riftmaker
    completedItems: [3116, 3047, 6653, 4637, 6665, 3068], // Rylai's, Steelcaps, Liandry's, Riftmaker, Jak'Sho, Sunfire
    buildOrder: [1052, 1011, 3116, 1001, 3047, 1052, 6653],
    startingItemsLaner: [1054, 2003],
    boots: [3047, 3111],
    damageProfile: "ap_bruiser",
  },
  Sylas: {
    coreItems: [3100, 4645, 3157], // Lich Bane, Shadowflame, Zhonya's
    completedItems: [3100, 3020, 4645, 3157, 3089, 4637], // Lich Bane, Sorcs, Shadowflame, Zhonya, Rabadon, Riftmaker
    buildOrder: [3057, 3145, 3100, 1001, 3020, 3145, 4645],
    startingItemsLaner: [1056, 2003, 2003],
    boots: [3020, 3158],
    damageProfile: "ap_burst",
  },

  // --- FIGHTERS & JUGGERNAUTS ---
  Aatrox: {
    coreItems: [6610, 6692, 3053], // Sundered Sky, Eclipse, Sterak's
    completedItems: [6610, 3047, 6692, 3053, 6695, 6333], // Sundered Sky, Steelcaps, Eclipse, Sterak's, Serylda's, Death's Dance
    buildOrder: [3133, 3044, 6610, 1001, 3047, 3133, 6692],
    startingItemsLaner: [1054, 2003],
    boots: [3047, 3111],
    damageProfile: "ad_bruiser",
  },
  Darius: {
    coreItems: [6631, 3078, 3742], // Stridebreaker, Trinity Force, Dead Man's Plate
    completedItems: [6631, 3047, 3078, 3742, 3053, 4401], // Stridebreaker, Steelcaps, Triforce, Dead Man's, Sterak's, Force of Nature
    buildOrder: [3077, 3044, 6631, 1001, 3047, 3057, 3078],
    startingItemsLaner: [1055, 2003],
    boots: [3047, 3009],
    damageProfile: "ad_bruiser",
  },
  Garen: {
    coreItems: [6631, 3046, 3742], // Stridebreaker, Phantom Dancer, Dead Man's Plate
    completedItems: [6631, 3006, 3046, 3742, 3031, 3053], // Stridebreaker, Berserker's, PD, Dead Man's, IE, Sterak's
    buildOrder: [3077, 3044, 6631, 1001, 3006, 3086, 3046],
    startingItemsLaner: [1054, 2003],
    boots: [3006, 3047],
    damageProfile: "ad_bruiser",
  },
  Jax: {
    coreItems: [3078, 6610, 3153], // Trinity Force, Sundered Sky, BoRK
    completedItems: [3078, 3047, 6610, 3153, 3053, 6665], // Trinity, Steelcaps, Sundered Sky, BoRK, Sterak's, Jak'Sho
    buildOrder: [3057, 3044, 3078, 1001, 3047, 3133, 6610],
    startingItemsLaner: [1054, 2003],
    boots: [3047, 3111],
    damageProfile: "ad_bruiser",
  },
  Irelia: {
    coreItems: [3153, 6610, 3091], // Blade of the Ruined King, Sundered Sky, Wit's End
    completedItems: [3153, 3047, 6610, 3091, 3053, 6665], // BoRK, Steelcaps, Sundered Sky, Wit's End, Sterak's, Jak'Sho
    buildOrder: [1043, 1053, 3153, 1001, 3047, 3133, 6610],
    startingItemsLaner: [1055, 2003],
    boots: [3047, 3111],
    damageProfile: "ad_bruiser",
  },
  Camille: {
    coreItems: [3078, 3074, 3053], // Trinity Force, Ravenous Hydra, Sterak's
    completedItems: [3078, 3047, 3074, 3053, 6333, 3026], // Trinity, Steelcaps, Ravenous Hydra, Sterak's, Death's Dance, GA
    buildOrder: [3057, 3044, 3078, 1001, 3047, 3077, 3074],
    startingItemsLaner: [1054, 2003],
    boots: [3047, 3111],
    damageProfile: "ad_bruiser",
  },
  Riven: {
    coreItems: [6692, 6610, 3074], // Eclipse, Sundered Sky, Ravenous Hydra
    completedItems: [6692, 3158, 6610, 3074, 6333, 6695], // Eclipse, Ionian, Sundered Sky, Ravenous, Death's Dance, Serylda
    buildOrder: [3133, 1037, 6692, 1001, 3158, 3133, 6610],
    startingItemsLaner: [1055, 2003],
    boots: [3158, 3047],
    damageProfile: "ad_bruiser",
  },

  // --- ENCHANTERS & UTILITY SUPPORTS ---
  Lulu: {
    coreItems: [3870, 6617, 3504], // Dream Maker, Moonstone Renewer, Ardent Censer
    completedItems: [3870, 3158, 6617, 3504, 6616, 3107], // Dream Maker, Ionian, Moonstone, Ardent, Staff of Flowing Water, Redemption
    buildOrder: [3865, 1001, 3158, 3067, 6617, 3114, 3504],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3158, 3009],
    damageProfile: "enchanter",
  },
  Nami: {
    coreItems: [3870, 6617, 6621], // Dream Maker, Moonstone Renewer, Echoes of Helia
    completedItems: [3870, 3158, 6617, 6621, 3504, 6616], // Dream Maker, Ionian, Moonstone, Helia, Ardent, Staff
    buildOrder: [3865, 1001, 3158, 3067, 6617, 3114, 6621],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3158, 3009],
    damageProfile: "enchanter",
  },
  Janna: {
    coreItems: [3870, 6617, 3504], // Dream Maker, Moonstone Renewer, Ardent Censer
    completedItems: [3870, 3009, 6617, 3504, 6616, 3107], // Dream Maker, Swifties, Moonstone, Ardent, Staff, Redemption
    buildOrder: [3865, 1001, 3009, 3067, 6617, 3114, 3504],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3009, 3158],
    damageProfile: "enchanter",
  },
  Sona: {
    coreItems: [3870, 6617, 3504], // Dream Maker, Moonstone Renewer, Ardent Censer
    completedItems: [3870, 3158, 6617, 3504, 6616, 3107], // Dream Maker, Ionian, Moonstone, Ardent, Staff, Redemption
    buildOrder: [3865, 1001, 3158, 3067, 6617, 3114, 3504],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3158, 3009],
    damageProfile: "enchanter",
  },
  Soraka: {
    coreItems: [3870, 6617, 3107], // Dream Maker, Moonstone Renewer, Redemption
    completedItems: [3870, 3158, 6617, 3107, 6616, 3222], // Dream Maker, Ionian, Moonstone, Redemption, Staff, Mikael's
    buildOrder: [3865, 1001, 3158, 3067, 6617, 3114, 3107],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3158, 3009],
    damageProfile: "enchanter",
  },
  Milio: {
    coreItems: [3870, 6617, 3504], // Dream Maker, Moonstone Renewer, Ardent Censer
    completedItems: [3870, 3158, 6617, 3504, 6616, 3107], // Dream Maker, Ionian, Moonstone, Ardent, Staff, Redemption
    buildOrder: [3865, 1001, 3158, 3067, 6617, 3114, 3504],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3158, 3009],
    damageProfile: "enchanter",
  },

  // --- TANK & ENGAGE SUPPORTS ---
  Thresh: {
    coreItems: [3869, 3190, 3107], // Solstice Sleigh, Locket, Redemption
    completedItems: [3869, 3158, 3190, 3107, 3110, 2504], // Solstice Sleigh, Ionian, Locket, Redemption, Frozen Heart, Kaenic Rookern
    buildOrder: [3865, 1001, 3158, 3067, 3190, 3105, 3107],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3158, 3047, 3009],
    damageProfile: "tank",
  },
  Nautilus: {
    coreItems: [3869, 3190, 3110], // Solstice Sleigh, Locket, Frozen Heart
    completedItems: [3869, 3047, 3190, 3110, 2504, 3075], // Solstice Sleigh, Steelcaps, Locket, Frozen Heart, Kaenic Rookern, Thornmail
    buildOrder: [3865, 1001, 3047, 3067, 3190, 1031, 3110],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3047, 3111, 3009],
    damageProfile: "tank",
  },
  Leona: {
    coreItems: [3869, 3190, 3110], // Solstice Sleigh, Locket, Frozen Heart
    completedItems: [3869, 3047, 3190, 3110, 2504, 3075], // Solstice Sleigh, Steelcaps, Locket, Frozen Heart, Kaenic Rookern, Thornmail
    buildOrder: [3865, 1001, 3047, 3067, 3190, 1031, 3110],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3047, 3111, 3009],
    damageProfile: "tank",
  },
  Blitzcrank: {
    coreItems: [3869, 3190, 3110], // Solstice Sleigh, Locket, Frozen Heart
    completedItems: [3869, 3009, 3190, 3110, 2504, 3107], // Solstice Sleigh, Swifties, Locket, Frozen Heart, Kaenic Rookern, Redemption
    buildOrder: [3865, 1001, 3009, 3067, 3190, 1031, 3110],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3009, 3047],
    damageProfile: "tank",
  },
  Pyke: {
    coreItems: [6698, 3814, 6695], // Opportunity, Edge of Night, Serylda's Grudge
    completedItems: [3876, 3009, 6698, 3814, 6695, 3026], // Bloodsong, Swifties, Opportunity, Edge of Night, Serylda's, GA
    buildOrder: [3865, 1001, 3009, 3134, 6698, 3134, 3814],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3009, 3158],
    damageProfile: "ad_lethality",
  },
  Senna: {
    coreItems: [6698, 3094, 3071], // Opportunity, Rapid Firecannon, Black Cleaver
    completedItems: [3876, 3009, 6698, 3094, 3071, 3036], // Bloodsong, Swifties, Opportunity, RFC, Black Cleaver, LDR
    buildOrder: [3865, 1001, 3009, 3134, 6698, 3086, 3094],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3009, 3006],
    damageProfile: "ad_crit",
  },
  Yuumi: {
    coreItems: [3870, 6617, 3504], // Dream Maker, Moonstone Renewer, Ardent Censer
    completedItems: [3870, 3158, 6617, 3504, 6616, 6620], // Dream Maker, Ionian, Moonstone, Ardent, Staff, Dawncore
    buildOrder: [3865, 1001, 3158, 3067, 6617, 3114, 3504],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3158],
    damageProfile: "enchanter",
  },
  Braum: {
    coreItems: [3869, 3190, 3110], // Solstice Sleigh, Locket, Frozen Heart
    completedItems: [3869, 3047, 3190, 3110, 3107, 2504], // Solstice Sleigh, Steelcaps, Locket, Frozen Heart, Redemption, Kaenic Rookern
    buildOrder: [3865, 1001, 3047, 3067, 3190, 1031, 3110],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3047, 3111],
    damageProfile: "tank",
  },
  Rakan: {
    coreItems: [3869, 3190, 6617], // Solstice Sleigh, Locket, Moonstone
    completedItems: [3869, 3158, 3190, 6617, 3107, 3110], // Solstice Sleigh, Ionian, Locket, Moonstone, Redemption, Frozen Heart
    buildOrder: [3865, 1001, 3158, 3067, 3190, 3067, 6617],
    startingItemsLaner: [3865, 2003, 2003],
    boots: [3158, 3009],
    damageProfile: "enchanter",
  },

  // --- SPECIAL HYBRID & AP MARKSMEN ---
  Teemo: {
    coreItems: [3115, 6653, 3118], // Nashor's Tooth, Liandry's Torment, Malignance
    completedItems: [3115, 3020, 6653, 3118, 3089, 3135], // Nashor's, Sorcs, Liandry's, Malignance, Rabadon, Void Staff
    buildOrder: [1043, 3108, 3115, 1001, 3020, 1052, 6653],
    startingItemsLaner: [1056, 2003, 2003],
    boots: [3020, 3009],
    damageProfile: "ap_burst",
  },
  Kayle: {
    coreItems: [3115, 4637, 3089], // Nashor's Tooth, Riftmaker, Rabadon's
    completedItems: [3006, 3115, 4637, 3089, 4645, 3157], // Berserker's, Nashor's, Riftmaker, Rabadon's, Shadowflame, Zhonya's
    buildOrder: [1001, 3006, 1043, 3108, 3115, 3145, 4637],
    startingItemsLaner: [1054, 2003],
    boots: [3006, 3020],
    damageProfile: "ap_burst",
  },
  Smolder: {
    coreItems: [3161, 3508, 3094], // Spear of Shojin, Essence Reaver, Rapid Firecannon
    completedItems: [3158, 3508, 3161, 3094, 3072, 6653], // Ionian, Essence Reaver, Shojin, RFC, Bloodthirster, Liandry's
    buildOrder: [3057, 1037, 3508, 1001, 3158, 3133, 3161],
    startingItemsLaner: [1055, 2003],
    boots: [3158, 3006],
    damageProfile: "ad_crit",
  },
  Kalista: {
    coreItems: [3153, 3124, 3085], // Blade of the Ruined King, Guinsoo's, Runaan's
    completedItems: [3006, 3153, 3124, 3085, 3302, 3026], // Berserker's, BoRK, Guinsoo's, Runaan's, Terminus, GA
    buildOrder: [1001, 3006, 1043, 1053, 3153, 1043, 3124],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3047],
    damageProfile: "ad_crit",
  },
  Zeri: {
    coreItems: [3087, 3085, 3031], // Statikk Shiv, Runaan's, Infinity Edge
    completedItems: [3006, 3087, 3085, 3031, 3036, 3042], // Berserker's, Statikk, Runaan's, IE, LDR, Shieldbow
    buildOrder: [1036, 1037, 3087, 1001, 3006, 3086, 3085],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3009],
    damageProfile: "ad_crit",
  },
  Aphelios: {
    coreItems: [6697, 3031, 3036], // The Collector, Infinity Edge, LDR
    completedItems: [3006, 6697, 3031, 3085, 3036, 3072], // Berserker's, Collector, IE, Runaan's, LDR, Bloodthirster
    buildOrder: [3134, 1037, 6697, 1001, 3006, 1038, 3031],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3047],
    damageProfile: "ad_crit",
  },
  Xayah: {
    coreItems: [6672, 3031, 3046], // Kraken Slayer, Infinity Edge, Phantom Dancer
    completedItems: [3006, 6672, 3031, 3046, 3036, 3042], // Berserker's, Kraken, IE, PD, LDR, Shieldbow
    buildOrder: [1036, 1037, 6672, 1001, 3006, 1038, 3031],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3047],
    damageProfile: "ad_crit",
  },

  // --- SPECIALIZED ON-HIT & AD JUNGLERS ---
  MasterYi: {
    coreItems: [3153, 3124, 3091], // Blade of the Ruined King, Guinsoo's Rageblade, Wit's End
    completedItems: [3006, 3153, 3124, 3091, 3053, 3026], // Berserker's, BoRK, Guinsoo's, Wit's End, Sterak's, GA
    buildOrder: [1043, 1053, 3153, 1001, 3006, 1043, 3124],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3047],
    damageProfile: "ad_crit",
  },
  Belveth: {
    coreItems: [6672, 3153, 6631], // Kraken Slayer, BoRK, Stridebreaker
    completedItems: [3006, 6672, 3153, 6631, 3302, 3026], // Berserker's, Kraken, BoRK, Stridebreaker, Terminus, GA
    buildOrder: [1036, 1037, 6672, 1001, 3006, 1043, 3153],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3047],
    damageProfile: "ad_crit",
  },
  Graves: {
    coreItems: [6698, 6697, 3031], // Opportunity, The Collector, Infinity Edge
    completedItems: [3047, 6698, 6697, 3031, 3036, 3072], // Steelcaps, Opportunity, Collector, IE, LDR, Bloodthirster
    buildOrder: [3134, 1037, 6698, 1001, 3047, 3134, 6697],
    startingItemsLaner: [1055, 2003],
    boots: [3047, 3006],
    damageProfile: "ad_crit",
  },
  Kayn: {
    coreItems: [6698, 6676, 6695], // Opportunity, Profane Hydra, Serylda's Grudge
    completedItems: [3158, 6698, 6676, 6695, 3814, 3026], // Ionian, Opportunity, Profane, Serylda's, Edge of Night, GA
    buildOrder: [3134, 1037, 6698, 1001, 3158, 3077, 6676],
    startingItemsLaner: [1055, 2003],
    boots: [3158, 3009],
    damageProfile: "ad_lethality",
  },
  Hecarim: {
    coreItems: [3078, 3074, 3053], // Trinity Force, Ravenous Hydra, Sterak's
    completedItems: [3158, 3078, 3074, 3053, 6333, 4401], // Ionian, Triforce, Ravenous, Sterak's, Death's Dance, Force of Nature
    buildOrder: [3057, 3044, 3078, 1001, 3158, 3077, 3074],
    startingItemsLaner: [1055, 2003],
    boots: [3158, 3047],
    damageProfile: "ad_bruiser",
  },
  Nocturne: {
    coreItems: [6631, 6676, 3053], // Stridebreaker, Profane Hydra, Sterak's
    completedItems: [3047, 6631, 6676, 3053, 3814, 3026], // Steelcaps, Stridebreaker, Profane, Sterak's, Edge of Night, GA
    buildOrder: [3077, 3044, 6631, 1001, 3047, 2020, 6676],
    startingItemsLaner: [1055, 2003],
    boots: [3047, 3009],
    damageProfile: "ad_bruiser",
  },
  Shaco: {
    coreItems: [6698, 6676, 6697], // Opportunity, Profane Hydra, The Collector
    completedItems: [3006, 6698, 6676, 6697, 3031, 3036], // Berserker's, Opportunity, Profane, Collector, IE, LDR
    buildOrder: [3134, 1037, 6698, 1001, 3006, 3077, 6676],
    startingItemsLaner: [1055, 2003],
    boots: [3006, 3009],
    damageProfile: "ad_crit",
  },
  Khazix: {
    coreItems: [6698, 6676, 6695], // Opportunity, Profane Hydra, Serylda's
    completedItems: [6698, 3158, 6676, 6695, 3814, 3026], // Opportunity, Ionian, Profane, Serylda's, Edge of Night, GA
    buildOrder: [3134, 1037, 6698, 1001, 3158, 3077, 6676],
    startingItemsLaner: [1055, 2003],
    boots: [3158, 3009],
    damageProfile: "ad_lethality",
  },
  Rengar: {
    coreItems: [6676, 6698, 6697], // Profane Hydra, Opportunity, The Collector
    completedItems: [6676, 3158, 6698, 6697, 3036, 3031], // Profane, Ionian, Opportunity, Collector, LDR, IE
    buildOrder: [3077, 2020, 6676, 1001, 3158, 3134, 6698],
    startingItemsLaner: [1055, 2003],
    boots: [3158, 3009],
    damageProfile: "ad_crit",
  },
  Warwick: {
    coreItems: [3153, 3748, 6665], // BoRK, Titanic Hydra, Jak'Sho
    completedItems: [3153, 3047, 3748, 6665, 3075, 4401], // BoRK, Steelcaps, Titanic Hydra, Jak'Sho, Thornmail, Force of Nature
    buildOrder: [1043, 1053, 3153, 1001, 3047, 3077, 3748],
    startingItemsLaner: [1054, 2003],
    boots: [3047, 3111],
    damageProfile: "ad_bruiser",
  },
  Volibear: {
    coreItems: [6657, 4637, 3068], // Rod of Ages, Riftmaker, Sunfire
    completedItems: [3158, 6657, 4637, 3068, 4401, 6665], // Ionian, RoA, Riftmaker, Sunfire, Force of Nature, Jak'Sho
    buildOrder: [1058, 6657, 1001, 3158, 3145, 4637],
    startingItemsLaner: [1054, 2003],
    boots: [3158, 3047],
    damageProfile: "ap_bruiser",
  },
  Urgot: {
    coreItems: [3071, 3053, 6665], // Black Cleaver, Sterak's, Jak'Sho
    completedItems: [3047, 3071, 3053, 6665, 3075, 4401], // Steelcaps, Black Cleaver, Sterak's, Jak'Sho, Thornmail, Force of Nature
    buildOrder: [3044, 3133, 3071, 1001, 3047, 1011, 3053],
    startingItemsLaner: [1054, 2003],
    boots: [3047, 3111],
    damageProfile: "ad_bruiser",
  },
  Illaoi: {
    coreItems: [6610, 3071, 3053], // Sundered Sky, Black Cleaver, Sterak's
    completedItems: [3047, 6610, 3071, 3053, 6662, 6665], // Steelcaps, Sundered Sky, Black Cleaver, Sterak's, Iceborn Gauntlet, Jak'Sho
    buildOrder: [3133, 3044, 6610, 1001, 3047, 3044, 3071],
    startingItemsLaner: [1054, 2003],
    boots: [3047, 3111],
    damageProfile: "ad_bruiser",
  },
  Gangplank: {
    coreItems: [3508, 6697, 3031], // Essence Reaver, Collector, Infinity Edge
    completedItems: [3158, 3508, 6697, 3031, 3033, 3072], // Ionian, Essence Reaver, Collector, IE, Mortal Reminder, Bloodthirster
    buildOrder: [3057, 1037, 3508, 1001, 3158, 3134, 6697],
    startingItemsLaner: [1054, 2003],
    boots: [3158, 3006],
    damageProfile: "ad_crit",
  },

  // --- SPECIALIZED AP MAGES & AP JUNGLERS ---
  Brand: {
    coreItems: [6653, 3116, 3305], // Liandry's Torment, Rylai's, Blackfire Torch
    completedItems: [3305, 3020, 6653, 3116, 3157, 3137], // Blackfire Torch, Sorcs, Liandry's, Rylai's, Zhonya's, Cryptbloom
    buildOrder: [3802, 3305, 1001, 3020, 1052, 6653, 1011, 3116],
    startingItemsLaner: [1056, 2003, 2003],
    boots: [3020, 3158],
    damageProfile: "ap_burst",
  },
  Malzahar: {
    coreItems: [3305, 3116, 6653], // Blackfire Torch, Rylai's, Liandry's
    completedItems: [3305, 3020, 3116, 6653, 3089, 3135], // Blackfire Torch, Sorcs, Rylai's, Liandry's, Rabadon's, Void Staff
    buildOrder: [3802, 3305, 1001, 3020, 1052, 1011, 3116],
    startingItemsLaner: [1056, 2003, 2003],
    boots: [3020, 3158],
    damageProfile: "ap_burst",
  },
  AurelionSol: {
    coreItems: [3116, 6653, 4637], // Rylai's, Liandry's, Riftmaker
    completedItems: [3116, 3020, 6653, 4637, 3089, 3157], // Rylai's, Sorcs, Liandry's, Riftmaker, Rabadon's, Zhonya's
    buildOrder: [1052, 1011, 3116, 1001, 3020, 1052, 6653],
    startingItemsLaner: [1056, 2003, 2003],
    boots: [3020, 3009],
    damageProfile: "ap_burst",
  },
  Fiddlesticks: {
    coreItems: [6653, 3157, 4645], // Liandry's Torment, Zhonya's, Shadowflame
    completedItems: [6653, 3020, 3157, 4645, 3089, 3135], // Liandry's, Sorcs, Zhonya's, Shadowflame, Rabadon's, Void Staff
    buildOrder: [1052, 3145, 6653, 1001, 3020, 3108, 3157],
    startingItemsLaner: [1056, 2003, 2003],
    boots: [3020, 3158],
    damageProfile: "ap_burst",
  },
  Karthus: {
    coreItems: [3305, 6653, 4645], // Blackfire Torch, Liandry's, Shadowflame
    completedItems: [3305, 3020, 6653, 4645, 3089, 3135], // Blackfire Torch, Sorcs, Liandry's, Shadowflame, Rabadon's, Void Staff
    buildOrder: [3802, 3305, 1001, 3020, 1052, 6653],
    startingItemsLaner: [1056, 2003, 2003],
    boots: [3020, 3158],
    damageProfile: "ap_burst",
  },
  Lillia: {
    coreItems: [6653, 4637, 3157], // Liandry's Torment, Riftmaker, Zhonya's
    completedItems: [6653, 3158, 4637, 3157, 3116, 3089], // Liandry's, Ionian, Riftmaker, Zhonya's, Rylai's, Rabadon's
    buildOrder: [1052, 3145, 6653, 1001, 3158, 3145, 4637],
    startingItemsLaner: [1056, 2003, 2003],
    boots: [3158, 3020],
    damageProfile: "ap_bruiser",
  },
  Anivia: {
    coreItems: [6657, 3040, 6653], // RoA, Seraph's, Liandry's
    completedItems: [6657, 3020, 3040, 6653, 3157, 3089], // RoA, Sorcs, Seraph's, Liandry's, Zhonya's, Rabadon's
    buildOrder: [3070, 1058, 6657, 1001, 3020, 3108, 3040],
    startingItemsLaner: [1056, 2003, 2003],
    boots: [3020, 3158],
    damageProfile: "ap_burst",
  },
  Kassadin: {
    coreItems: [6657, 3040, 3100], // RoA, Seraph's, Lich Bane
    completedItems: [6657, 3020, 3040, 3100, 3157, 3089], // RoA, Sorcs, Seraph's, Lich Bane, Zhonya's, Rabadon's
    buildOrder: [3070, 1058, 6657, 1001, 3020, 3108, 3040],
    startingItemsLaner: [1056, 2003, 2003],
    boots: [3020, 3158],
    damageProfile: "ap_burst",
  },
  Swain: {
    coreItems: [3116, 6653, 3157], // Rylai's, Liandry's, Zhonya's
    completedItems: [3116, 3047, 6653, 3157, 6665, 8020], // Rylai's, Steelcaps, Liandry's, Zhonya's, Jak'Sho, Abyssal Mask
    buildOrder: [1052, 1011, 3116, 1001, 3047, 1052, 6653],
    startingItemsLaner: [1056, 2003, 2003],
    boots: [3047, 3020],
    damageProfile: "ap_bruiser",
  },
  Ekko: {
    coreItems: [3100, 4645, 3089], // Lich Bane, Shadowflame, Rabadon's
    completedItems: [3100, 3020, 4645, 3089, 3157, 3135], // Lich Bane, Sorcs, Shadowflame, Rabadon's, Zhonya's, Void Staff
    buildOrder: [3057, 3145, 3100, 1001, 3020, 3145, 4645],
    startingItemsLaner: [1056, 2003, 2003],
    boots: [3020, 3158],
    damageProfile: "ap_burst",
  },
  Fizz: {
    coreItems: [3100, 3157, 4645], // Lich Bane, Zhonya's, Shadowflame
    completedItems: [3100, 3020, 3157, 4645, 3089, 3135], // Lich Bane, Sorcs, Zhonya's, Shadowflame, Rabadon's, Void Staff
    buildOrder: [3057, 3145, 3100, 1001, 3020, 3108, 3157],
    startingItemsLaner: [1054, 2003],
    boots: [3020, 3158],
    damageProfile: "ap_burst",
  },
  Evelynn: {
    coreItems: [3100, 4645, 3089], // Lich Bane, Shadowflame, Rabadon's
    completedItems: [3100, 3020, 4645, 3089, 3135, 3157], // Lich Bane, Sorcs, Shadowflame, Rabadon's, Void Staff, Zhonya's
    buildOrder: [3057, 3145, 3100, 1001, 3020, 3145, 4645],
    startingItemsLaner: [1082, 2031],
    boots: [3020, 3158],
    damageProfile: "ap_burst",
  },

  // --- SPECIALIZED TANKS ---
  Ksante: {
    coreItems: [6662, 3068, 3075], // Iceborn Gauntlet, Sunfire, Thornmail
    completedItems: [6662, 3047, 3068, 3075, 2504, 6665], // Iceborn Gauntlet, Steelcaps, Sunfire, Thornmail, Kaenic Rookern, Jak'Sho
    buildOrder: [3057, 1031, 6662, 1001, 3047, 3751, 3068],
    startingItemsLaner: [1054, 2003],
    boots: [3047, 3111],
    damageProfile: "tank",
  },
  Malphite: {
    coreItems: [3068, 3075, 3110], // Sunfire, Thornmail, Frozen Heart
    completedItems: [3047, 3068, 3075, 3110, 2504, 6665], // Steelcaps, Sunfire, Thornmail, Frozen Heart, Kaenic Rookern, Jak'Sho
    buildOrder: [1054, 3751, 3068, 1001, 3047, 1031, 3075],
    startingItemsLaner: [1054, 2003],
    boots: [3047, 3111],
    damageProfile: "tank",
  },
  Ornn: {
    coreItems: [3068, 3084, 3075], // Sunfire, Heartsteel, Thornmail
    completedItems: [3047, 3068, 3084, 3075, 2504, 6665], // Steelcaps, Sunfire, Heartsteel, Thornmail, Kaenic Rookern, Jak'Sho
    buildOrder: [1054, 3751, 3068, 1001, 3047, 3211, 3084],
    startingItemsLaner: [1054, 2003],
    boots: [3047, 3111],
    damageProfile: "tank",
  },
  Sion: {
    coreItems: [3084, 3068, 3748], // Heartsteel, Sunfire, Titanic Hydra
    completedItems: [3047, 3084, 3068, 3748, 3075, 2504], // Steelcaps, Heartsteel, Sunfire, Titanic Hydra, Thornmail, Kaenic Rookern
    buildOrder: [1054, 3211, 3084, 1001, 3047, 3751, 3068],
    startingItemsLaner: [1054, 2003],
    boots: [3047, 3009],
    damageProfile: "tank",
  },
  Shen: {
    coreItems: [3084, 3068, 3748], // Heartsteel, Sunfire, Titanic Hydra
    completedItems: [3047, 3084, 3068, 3748, 3075, 2504], // Steelcaps, Heartsteel, Sunfire, Titanic, Thornmail, Kaenic Rookern
    buildOrder: [1054, 3211, 3084, 1001, 3047, 3751, 3068],
    startingItemsLaner: [1054, 2003],
    boots: [3047, 3111],
    damageProfile: "tank",
  },
  Rammus: {
    coreItems: [3075, 3068, 3110], // Thornmail, Sunfire, Frozen Heart
    completedItems: [3047, 3075, 3068, 3110, 3742, 2504], // Steelcaps, Thornmail, Sunfire, Frozen Heart, Dead Man's, Kaenic Rookern
    buildOrder: [1031, 3075, 1001, 3047, 3751, 3068],
    startingItemsLaner: [1054, 2003],
    boots: [3047, 3009],
    damageProfile: "tank",
  },
};
