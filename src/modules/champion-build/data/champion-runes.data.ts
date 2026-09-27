import {
  RuneSetup,
  RuneStyleOption,
  StatShards,
} from "../interfaces/champion-build.interface";
import { buildStatShards } from "../constants/champion-build.constants";

export const RUNE_STYLES_CATALOG = [
  {
    id: 8000,
    name: "Precision",
    iconUrl: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7201_Precision.png",
  },
  {
    id: 8100,
    name: "Domination",
    iconUrl: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7200_Domination.png",
  },
  {
    id: 8200,
    name: "Sorcery",
    iconUrl: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7202_Sorcery.png",
  },
  {
    id: 8300,
    name: "Inspiration",
    iconUrl: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7203_Whimsy.png",
  },
  {
    id: 8400,
    name: "Resolve",
    iconUrl: "https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/7204_Resolve.png",
  },
] as const;

export function buildRuneStyles(
  primaryStyleId: number,
  subStyleId: number
): {
  primaryStyles: RuneStyleOption[];
  subStyles: RuneStyleOption[];
} {
  const primaryStyles: RuneStyleOption[] = RUNE_STYLES_CATALOG.map((style) => ({
    id: style.id,
    name: style.name,
    iconUrl: style.iconUrl,
    isSelected: style.id === primaryStyleId,
  }));

  const subStyles: RuneStyleOption[] = RUNE_STYLES_CATALOG
    .filter((style) => style.id !== primaryStyleId)
    .map((style) => ({
      id: style.id,
      name: style.name,
      iconUrl: style.iconUrl,
      isSelected: style.id === subStyleId,
    }));

  return { primaryStyles, subStyles };
}

export type RawRunePreset = Omit<RuneSetup, "winRate" | "pickRate" | "primaryStyles" | "subStyles">;

export interface ChampionRuneOverride {
  mostPopular: RawRunePreset;
  highestWinRate: RawRunePreset;
}

export const SUB_ARCHETYPE_RUNES: Record<string, RawRunePreset> = {
  support_tank: {
    primaryStyleId: 8400,
    primaryStyleName: "Resolve",
    keystoneId: 8439, // Aftershock
    selectedPerkIds: [8463, 8473, 8451], // Font of Life, Bone Plating, Overgrowth
    subStyleId: 8300,
    subStyleName: "Inspiration",
    subPerkIds: [8306, 8347], // Hextech Flashtraption, Cosmic Insight
    statShards: buildStatShards(5007, 5001, 5011), // Ability Haste, Scaling Health, Flat Health
  },
  enchanter_support: {
    primaryStyleId: 8200,
    primaryStyleName: "Sorcery",
    keystoneId: 8214, // Summon Aery
    selectedPerkIds: [8226, 8210, 8237], // Manaflow Band, Transcendence, Scorch
    subStyleId: 8300,
    subStyleName: "Inspiration",
    subPerkIds: [8345, 8347], // Biscuit Delivery, Cosmic Insight
    statShards: buildStatShards(5007, 5008, 5011),
  },
  crit_marksman: {
    primaryStyleId: 8000,
    primaryStyleName: "Precision",
    keystoneId: 8021, // Fleet Footwork
    selectedPerkIds: [8009, 9103, 8017], // Presence of Mind, Bloodline, Cut Down
    subStyleId: 8300,
    subStyleName: "Inspiration",
    subPerkIds: [8304, 8345], // Magical Footwear, Biscuit Delivery
    statShards: buildStatShards(5005, 5008, 5001),
  },
};

export const CHAMPION_RUNE_OVERRIDES: Record<string, ChampionRuneOverride> = {
  // Quinn: Matches Blitz.gg Sorcery (Phase Rush) + Inspiration signature rune setup
  Quinn: {
    mostPopular: {
      primaryStyleId: 8200,
      primaryStyleName: "Sorcery",
      keystoneId: 8230, // Phase Rush
      selectedPerkIds: [8275, 8234, 8237], // Nimbus Cloak, Celerity, Scorch
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8304, 8347], // Magical Footwear, Cosmic Insight
      statShards: buildStatShards(5005, 5008, 5001), // Attack Speed, Adaptive Force, Scaling Health
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8005, // Press the Attack
      selectedPerkIds: [9111, 9104, 8014], // Triumph, Alacrity, Cut Down
      subStyleId: 8200,
      subStyleName: "Sorcery",
      subPerkIds: [8233, 8236], // Absolute Focus, Gathering Storm
      statShards: buildStatShards(5005, 5008, 5011),
    },
  },

  // Ezreal: Press the Attack / Conqueror + Inspiration (Footwear + Biscuits)
  Ezreal: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8005, // Press the Attack
      selectedPerkIds: [8009, 9103, 8017], // Presence of Mind, Bloodline, Cut Down
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8304, 8345], // Magical Footwear, Biscuit Delivery
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [8009, 9104, 8017],
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8304, 8347], // Magical Footwear, Cosmic Insight
      statShards: buildStatShards(5005, 5008, 5011),
    },
  },

  // Samira & Nilah: Conqueror + Domination
  Samira: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [9111, 9103, 8299], // Triumph, Bloodline, Last Stand
      subStyleId: 8100,
      subStyleName: "Domination",
      subPerkIds: [8139, 8135], // Taste of Blood, Treasure Hunter
      statShards: buildStatShards(5008, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010,
      selectedPerkIds: [9111, 9103, 8299],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8444, 8453], // Second Wind, Revitalize
      statShards: buildStatShards(5008, 5008, 5011),
    },
  },
  Nilah: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [9111, 9103, 8299],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8444, 8453],
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010,
      selectedPerkIds: [9111, 9103, 8299],
      subStyleId: 8100,
      subStyleName: "Domination",
      subPerkIds: [8143, 8135],
      statShards: buildStatShards(5005, 5008, 5011),
    },
  },

  // Ashe: Lethal Tempo + Approach Velocity
  Ashe: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8008, // Lethal Tempo
      selectedPerkIds: [8009, 9104, 8017], // Presence of Mind, Alacrity, Cut Down
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8304, 8410], // Magical Footwear, Approach Velocity
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8008,
      selectedPerkIds: [8009, 9104, 8017],
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8345, 8410], // Biscuit Delivery, Approach Velocity
      statShards: buildStatShards(5005, 5008, 5011),
    },
  },

  // Jhin: Fleet Footwork + Sorcery (Celerity + Gathering Storm)
  Jhin: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8021, // Fleet Footwork
      selectedPerkIds: [8009, 9103, 8014], // Presence of Mind, Bloodline, Coup de Grace
      subStyleId: 8200,
      subStyleName: "Sorcery",
      subPerkIds: [8234, 8236], // Celerity, Gathering Storm
      statShards: buildStatShards(5008, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8100,
      primaryStyleName: "Domination",
      keystoneId: 8128, // Dark Harvest
      selectedPerkIds: [8139, 8138, 8135], // Taste of Blood, Eyeball Collection, Treasure Hunter
      subStyleId: 8200,
      subStyleName: "Sorcery",
      subPerkIds: [8234, 8236],
      statShards: buildStatShards(5008, 5008, 5011),
    },
  },

  // Smolder: Fleet Footwork + Inspiration
  Smolder: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8021, // Fleet Footwork
      selectedPerkIds: [8009, 9103, 8017], // Presence of Mind, Bloodline, Cut Down
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8304, 8345], // Magical Footwear, Biscuit Delivery
      statShards: buildStatShards(5008, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8005, // Press the Attack
      selectedPerkIds: [8009, 9104, 8017],
      subStyleId: 8200,
      subStyleName: "Sorcery",
      subPerkIds: [8210, 8236], // Transcendence, Gathering Storm
      statShards: buildStatShards(5008, 5008, 5011),
    },
  },

  // Kalista: Hail of Blades + Precision
  Kalista: {
    mostPopular: {
      primaryStyleId: 8100,
      primaryStyleName: "Domination",
      keystoneId: 9923, // Hail of Blades
      selectedPerkIds: [8139, 8138, 8135], // Taste of Blood, Eyeball Collection, Treasure Hunter
      subStyleId: 8000,
      subStyleName: "Precision",
      subPerkIds: [9111, 9104], // Triumph, Legend: Alacrity
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8008, // Lethal Tempo
      selectedPerkIds: [9111, 9104, 8017],
      subStyleId: 8100,
      subStyleName: "Domination",
      subPerkIds: [8139, 8135],
      statShards: buildStatShards(5005, 5008, 5011),
    },
  },

  // Yasuo & Yone: Conqueror + Resolve (Second Wind + Overgrowth)
  Yasuo: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [9111, 9104, 8299], // Triumph, Alacrity, Last Stand
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8444, 8451], // Second Wind, Overgrowth
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8021, // Fleet Footwork
      selectedPerkIds: [9111, 9104, 8299],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8473, 8451], // Bone Plating, Overgrowth
      statShards: buildStatShards(5005, 5008, 5011),
    },
  },
  Yone: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [9111, 9104, 8299],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8444, 8451],
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8021, // Fleet Footwork
      selectedPerkIds: [9111, 9104, 8299],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8473, 8451],
      statShards: buildStatShards(5005, 5008, 5011),
    },
  },

  // Jinx & Caitlyn: Precision (Fleet / PTA) + Inspiration (Footwear + Biscuits)
  Jinx: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8021, // Fleet Footwork
      selectedPerkIds: [8009, 9104, 8017], // Presence of Mind, Alacrity, Cut Down
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8304, 8345], // Magical Footwear, Biscuit Delivery
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8008, // Lethal Tempo
      selectedPerkIds: [8009, 9104, 8017],
      subStyleId: 8200,
      subStyleName: "Sorcery",
      subPerkIds: [8233, 8236], // Absolute Focus, Gathering Storm
      statShards: buildStatShards(5005, 5008, 5011),
    },
  },
  Caitlyn: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8021, // Fleet Footwork
      selectedPerkIds: [8009, 9104, 8017],
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8304, 8345],
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8005, // Press the Attack
      selectedPerkIds: [8009, 9104, 8017],
      subStyleId: 8100,
      subStyleName: "Domination",
      subPerkIds: [8138, 8105], // Eyeball Collection, Relentless Hunter
      statShards: buildStatShards(5005, 5008, 5011),
    },
  },

  // Sylas & Diana & Katarina: Conqueror / Electrocute
  Sylas: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [8009, 9105, 8299], // Presence of Mind, Legend: Haste, Last Stand
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8444, 8242], // Second Wind, Unflinching
      statShards: buildStatShards(5008, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8100,
      primaryStyleName: "Domination",
      keystoneId: 8112, // Electrocute
      selectedPerkIds: [8143, 8138, 8105], // Sudden Impact, Eyeball Collection, Relentless Hunter
      subStyleId: 8000,
      subStyleName: "Precision",
      subPerkIds: [8009, 8299],
      statShards: buildStatShards(5008, 5008, 5011),
    },
  },
  Diana: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [9111, 9104, 8299],
      subStyleId: 8100,
      subStyleName: "Domination",
      subPerkIds: [8143, 8105],
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8100,
      primaryStyleName: "Domination",
      keystoneId: 8112, // Electrocute
      selectedPerkIds: [8143, 8138, 8105],
      subStyleId: 8000,
      subStyleName: "Precision",
      subPerkIds: [9111, 8014],
      statShards: buildStatShards(5008, 5008, 5011),
    },
  },
  Katarina: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [9111, 9104, 8299],
      subStyleId: 8100,
      subStyleName: "Domination",
      subPerkIds: [8143, 8105],
      statShards: buildStatShards(5008, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8100,
      primaryStyleName: "Domination",
      keystoneId: 8112, // Electrocute
      selectedPerkIds: [8143, 8138, 8105],
      subStyleId: 8000,
      subStyleName: "Precision",
      subPerkIds: [9111, 8299],
      statShards: buildStatShards(5008, 5008, 5011),
    },
  },
  Akali: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8021, // Fleet Footwork
      selectedPerkIds: [8009, 9105, 8014],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8444, 8451],
      statShards: buildStatShards(5008, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8100,
      primaryStyleName: "Domination",
      keystoneId: 8112, // Electrocute
      selectedPerkIds: [8143, 8138, 8105],
      subStyleId: 8000,
      subStyleName: "Precision",
      subPerkIds: [8009, 8299],
      statShards: buildStatShards(5008, 5008, 5011),
    },
  },

  // Darius & Garen: Conqueror + Nimbus Cloak + Celerity
  Darius: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [9111, 9104, 8299], // Triumph, Alacrity, Last Stand
      subStyleId: 8200,
      subStyleName: "Sorcery",
      subPerkIds: [8275, 8234], // Nimbus Cloak, Celerity
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010,
      selectedPerkIds: [9111, 9104, 8299],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8444, 8451], // Second Wind, Overgrowth
      statShards: buildStatShards(5005, 5008, 5013),
    },
  },
  Garen: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [9111, 9104, 8299],
      subStyleId: 8200,
      subStyleName: "Sorcery",
      subPerkIds: [8275, 8234], // Nimbus Cloak, Celerity
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8200,
      primaryStyleName: "Sorcery",
      keystoneId: 8230, // Phase Rush
      selectedPerkIds: [8275, 8234, 8236],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8444, 8451],
      statShards: buildStatShards(5005, 5008, 5011),
    },
  },

  // Camille & Fiora & Jax: Grasp / Conqueror + Inspiration
  Camille: {
    mostPopular: {
      primaryStyleId: 8400,
      primaryStyleName: "Resolve",
      keystoneId: 8437, // Grasp of the Undying
      selectedPerkIds: [8401, 8444, 8451], // Shield Bash, Second Wind, Overgrowth
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8304, 8345], // Magical Footwear, Biscuit Delivery
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [9111, 9104, 8299],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8401, 8444],
      statShards: buildStatShards(5005, 5008, 5011),
    },
  },
  Fiora: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [9111, 9104, 8299],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8446, 8473], // Demolish, Bone Plating
      statShards: buildStatShards(5008, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8400,
      primaryStyleName: "Resolve",
      keystoneId: 8437, // Grasp of the Undying
      selectedPerkIds: [8446, 8444, 8451],
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8304, 8345],
      statShards: buildStatShards(5008, 5008, 5011),
    },
  },
  Jax: {
    mostPopular: {
      primaryStyleId: 8400,
      primaryStyleName: "Resolve",
      keystoneId: 8437, // Grasp of the Undying
      selectedPerkIds: [8446, 8444, 8451],
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8304, 8345],
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8008, // Lethal Tempo
      selectedPerkIds: [9111, 9104, 8299],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8444, 8451],
      statShards: buildStatShards(5005, 5008, 5011),
    },
  },
  Riven: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [9111, 9105, 8299], // Triumph, Legend: Haste, Last Stand
      subStyleId: 8200,
      subStyleName: "Sorcery",
      subPerkIds: [8275, 8210], // Nimbus Cloak, Transcendence
      statShards: buildStatShards(5008, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010,
      selectedPerkIds: [9111, 9105, 8299],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8401, 8444],
      statShards: buildStatShards(5008, 5008, 5011),
    },
  },

  // Vladimir: Phase Rush + Inspiration
  Vladimir: {
    mostPopular: {
      primaryStyleId: 8200,
      primaryStyleName: "Sorcery",
      keystoneId: 8230, // Phase Rush
      selectedPerkIds: [8275, 8210, 8236], // Nimbus Cloak, Transcendence, Gathering Storm
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8304, 8347], // Magical Footwear, Cosmic Insight
      statShards: buildStatShards(5008, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8200,
      primaryStyleName: "Sorcery",
      keystoneId: 8214, // Summon Aery
      selectedPerkIds: [8275, 8210, 8237],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8444, 8451],
      statShards: buildStatShards(5008, 5008, 5011),
    },
  },

  // Pyke: Hail of Blades + Precision / Resolve
  Pyke: {
    mostPopular: {
      primaryStyleId: 8100,
      primaryStyleName: "Domination",
      keystoneId: 9923, // Hail of Blades
      selectedPerkIds: [8126, 8138, 8105], // Cheap Shot, Eyeball Collection, Relentless Hunter
      subStyleId: 8000,
      subStyleName: "Precision",
      subPerkIds: [9111, 9104], // Triumph, Legend: Alacrity
      statShards: buildStatShards(5008, 5008, 5011),
    },
    highestWinRate: {
      primaryStyleId: 8100,
      primaryStyleName: "Domination",
      keystoneId: 9923,
      selectedPerkIds: [8126, 8138, 8105],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8473, 8242], // Bone Plating, Unflinching
      statShards: buildStatShards(5008, 5008, 5001),
    },
  },

  // Shaco: Hail of Blades + Precision
  Shaco: {
    mostPopular: {
      primaryStyleId: 8100,
      primaryStyleName: "Domination",
      keystoneId: 9923, // Hail of Blades
      selectedPerkIds: [8143, 8138, 8105], // Sudden Impact, Eyeball Collection, Relentless Hunter
      subStyleId: 8000,
      subStyleName: "Precision",
      subPerkIds: [9104, 8014], // Legend: Alacrity, Coup de Grace
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8100,
      primaryStyleName: "Domination",
      keystoneId: 9923,
      selectedPerkIds: [8143, 8138, 8105],
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8304, 8347],
      statShards: buildStatShards(5005, 5008, 5011),
    },
  },

  // Master Yi & Bel'Veth: Conqueror / Lethal Tempo
  MasterYi: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8008, // Lethal Tempo
      selectedPerkIds: [9111, 9104, 8299], // Triumph, Alacrity, Last Stand
      subStyleId: 8100,
      subStyleName: "Domination",
      subPerkIds: [8138, 8105], // Eyeball Collection, Relentless Hunter
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [9111, 9104, 8299],
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8304, 8347],
      statShards: buildStatShards(5005, 5008, 5011),
    },
  },
  Belveth: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [9111, 9104, 8014],
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8304, 8347],
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8008, // Lethal Tempo
      selectedPerkIds: [9111, 9104, 8014],
      subStyleId: 8100,
      subStyleName: "Domination",
      subPerkIds: [8143, 8105],
      statShards: buildStatShards(5005, 5008, 5011),
    },
  },

  // SUPPORT TANKS: Aftershock + Hexflash (NOT Grasp!)
  Leona: {
    mostPopular: {
      primaryStyleId: 8400,
      primaryStyleName: "Resolve",
      keystoneId: 8439, // Aftershock
      selectedPerkIds: [8463, 8473, 8451], // Font of Life, Bone Plating, Overgrowth
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8306, 8347], // Hextech Flashtraption, Cosmic Insight
      statShards: buildStatShards(5007, 5001, 5011),
    },
    highestWinRate: {
      primaryStyleId: 8400,
      primaryStyleName: "Resolve",
      keystoneId: 8439,
      selectedPerkIds: [8463, 8444, 8242], // Font of Life, Second Wind, Unflinching
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8345, 8347], // Biscuit Delivery, Cosmic Insight
      statShards: buildStatShards(5007, 5001, 5001),
    },
  },
  Nautilus: {
    mostPopular: {
      primaryStyleId: 8400,
      primaryStyleName: "Resolve",
      keystoneId: 8439, // Aftershock
      selectedPerkIds: [8401, 8473, 8451], // Shield Bash, Bone Plating, Overgrowth
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8306, 8347], // Hextech Flashtraption, Cosmic Insight
      statShards: buildStatShards(5007, 5001, 5011),
    },
    highestWinRate: {
      primaryStyleId: 8300,
      primaryStyleName: "Inspiration",
      keystoneId: 8351, // Glacial Augment
      selectedPerkIds: [8306, 8345, 8347], // Hexflash, Biscuits, Cosmic Insight
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8473, 8451],
      statShards: buildStatShards(5007, 5001, 5011),
    },
  },
  Thresh: {
    mostPopular: {
      primaryStyleId: 8300,
      primaryStyleName: "Inspiration",
      keystoneId: 8351, // Glacial Augment
      selectedPerkIds: [8306, 8345, 8347], // Hexflash, Biscuits, Cosmic Insight
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8473, 8242], // Bone Plating, Unflinching
      statShards: buildStatShards(5007, 5008, 5011),
    },
    highestWinRate: {
      primaryStyleId: 8400,
      primaryStyleName: "Resolve",
      keystoneId: 8439, // Aftershock
      selectedPerkIds: [8463, 8473, 8451],
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8306, 8347],
      statShards: buildStatShards(5007, 5001, 5011),
    },
  },
  Blitzcrank: {
    mostPopular: {
      primaryStyleId: 8300,
      primaryStyleName: "Inspiration",
      keystoneId: 8351, // Glacial Augment
      selectedPerkIds: [8306, 8345, 8347], // Hexflash, Biscuits, Cosmic Insight
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8473, 8242], // Bone Plating, Unflinching
      statShards: buildStatShards(5007, 5010, 5011), // Ability Haste, Movement Speed, Flat Health
    },
    highestWinRate: {
      primaryStyleId: 8400,
      primaryStyleName: "Resolve",
      keystoneId: 8439, // Aftershock
      selectedPerkIds: [8463, 8473, 8451],
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8306, 8347],
      statShards: buildStatShards(5007, 5010, 5011),
    },
  },
  Alistar: {
    mostPopular: {
      primaryStyleId: 8400,
      primaryStyleName: "Resolve",
      keystoneId: 8439, // Aftershock
      selectedPerkIds: [8463, 8473, 8451],
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8306, 8347],
      statShards: buildStatShards(5007, 5001, 5011),
    },
    highestWinRate: {
      primaryStyleId: 8300,
      primaryStyleName: "Inspiration",
      keystoneId: 8351, // Glacial Augment
      selectedPerkIds: [8306, 8345, 8347],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8473, 8451],
      statShards: buildStatShards(5007, 5001, 5011),
    },
  },

  // Lulu & Enchanters: Summon Aery + Inspiration (Biscuits + Cosmic Insight)
  Lulu: {
    mostPopular: {
      primaryStyleId: 8200,
      primaryStyleName: "Sorcery",
      keystoneId: 8214, // Summon Aery
      selectedPerkIds: [8226, 8210, 8237], // Manaflow Band, Transcendence, Scorch
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8345, 8347], // Biscuit Delivery, Cosmic Insight
      statShards: buildStatShards(5007, 5008, 5011),
    },
    highestWinRate: {
      primaryStyleId: 8400,
      primaryStyleName: "Resolve",
      keystoneId: 8465, // Guardian
      selectedPerkIds: [8463, 8473, 8453], // Font of Life, Bone Plating, Revitalize
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8304, 8347],
      statShards: buildStatShards(5007, 5010, 5011),
    },
  },
  Nami: {
    mostPopular: {
      primaryStyleId: 8200,
      primaryStyleName: "Sorcery",
      keystoneId: 8214, // Summon Aery
      selectedPerkIds: [8226, 8210, 8237],
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8345, 8347],
      statShards: buildStatShards(5007, 5008, 5011),
    },
    highestWinRate: {
      primaryStyleId: 8100,
      primaryStyleName: "Domination",
      keystoneId: 8112, // Electrocute
      selectedPerkIds: [8139, 8138, 8105],
      subStyleId: 8200,
      subStyleName: "Sorcery",
      subPerkIds: [8226, 8237],
      statShards: buildStatShards(5007, 5008, 5011),
    },
  },
  Janna: {
    mostPopular: {
      primaryStyleId: 8200,
      primaryStyleName: "Sorcery",
      keystoneId: 8214, // Summon Aery
      selectedPerkIds: [8226, 8234, 8237], // Manaflow Band, Celerity, Scorch
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8345, 8347],
      statShards: buildStatShards(5010, 5008, 5011), // Movement Speed, Adaptive Force, Flat Health
    },
    highestWinRate: {
      primaryStyleId: 8300,
      primaryStyleName: "Inspiration",
      keystoneId: 8351, // Glacial Augment
      selectedPerkIds: [8304, 8345, 8347],
      subStyleId: 8200,
      subStyleName: "Sorcery",
      subPerkIds: [8234, 8237],
      statShards: buildStatShards(5010, 5008, 5011),
    },
  },

  // Aatrox: Conqueror + Resolve
  Aatrox: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [9111, 9104, 8299], // Triumph, Alacrity, Last Stand
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8444, 8451], // Second Wind, Overgrowth
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010,
      selectedPerkIds: [9111, 9104, 8299],
      subStyleId: 8200,
      subStyleName: "Sorcery",
      subPerkIds: [8275, 8234], // Nimbus Cloak, Celerity
      statShards: buildStatShards(5008, 5008, 5013),
    },
  },

  // Singed: Conqueror or Phase Rush
  Singed: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8010, // Conqueror
      selectedPerkIds: [9111, 9105, 8299], // Triumph, Legend: Haste, Last Stand
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8444, 8242], // Second Wind, Unflinching
      statShards: buildStatShards(5008, 5010, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8200,
      primaryStyleName: "Sorcery",
      keystoneId: 8230, // Phase Rush
      selectedPerkIds: [8275, 8234, 8232], // Nimbus Cloak, Celerity, Waterwalking
      subStyleId: 8300,
      subStyleName: "Inspiration",
      subPerkIds: [8345, 8347],
      statShards: buildStatShards(5008, 5010, 5001),
    },
  },

  // Teemo: Press the Attack + Resolve / Domination
  Teemo: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8005, // Press the Attack
      selectedPerkIds: [8009, 9104, 8017], // Presence of Mind, Alacrity, Cut Down
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8473, 8451], // Bone Plating, Overgrowth
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8200,
      primaryStyleName: "Sorcery",
      keystoneId: 8229, // Arcane Comet
      selectedPerkIds: [8226, 8233, 8237], // Manaflow Band, Absolute Focus, Scorch
      subStyleId: 8100,
      subStyleName: "Domination",
      subPerkIds: [8139, 8106], // Taste of Blood, Ultimate Hunter
      statShards: buildStatShards(5005, 5008, 5011),
    },
  },

  // Kayle: Fleet Footwork + Resolve
  Kayle: {
    mostPopular: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8021, // Fleet Footwork
      selectedPerkIds: [9101, 9104, 8017],
      subStyleId: 8400,
      subStyleName: "Resolve",
      subPerkIds: [8444, 8451],
      statShards: buildStatShards(5005, 5008, 5001),
    },
    highestWinRate: {
      primaryStyleId: 8000,
      primaryStyleName: "Precision",
      keystoneId: 8005, // Press the Attack
      selectedPerkIds: [9111, 9104, 8299],
      subStyleId: 8200,
      subStyleName: "Sorcery",
      subPerkIds: [8234, 8236], // Celerity, Gathering Storm
      statShards: buildStatShards(5005, 5008, 5011),
    },
  },
};
