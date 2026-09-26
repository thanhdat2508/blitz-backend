import prisma from "../src/config/database";
import { CHAMPION_CATALOG } from "../src/data/champion-catalog";
import { ChampionRole, RankTier } from "../src/types/tierlist.types";
import { DDRAGON_BASE_URL, DEFAULT_DDRAGON_VERSION } from "../src/config/riot";

const ALL_RANKS: RankTier[] = [
  "all",
  "iron",
  "bronze",
  "silver",
  "gold",
  "platinum",
  "emerald",
  "diamond",
  "master",
  "grandmaster",
  "challenger",
];

const RANK_MATCH_SAMPLE: Record<RankTier, number> = {
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

const RANK_WR_SPREAD: Record<RankTier, { min: number; max: number }> = {
  all: { min: 46.8, max: 53.8 },
  iron: { min: 47.5, max: 52.8 },
  bronze: { min: 47.2, max: 53.0 },
  silver: { min: 47.0, max: 53.2 },
  gold: { min: 46.8, max: 53.5 },
  platinum: { min: 46.5, max: 53.8 },
  emerald: { min: 46.4, max: 54.0 },
  diamond: { min: 45.8, max: 54.6 },
  master: { min: 45.0, max: 55.0 },
  grandmaster: { min: 44.5, max: 55.6 },
  challenger: { min: 44.0, max: 56.2 },
};

function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createPrng(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function calculateTierGrade(winRate: number): string {
  if (winRate >= 52.5) return "S";
  if (winRate >= 51.0) return "A";
  if (winRate >= 49.8) return "B";
  if (winRate >= 48.5) return "C";
  return "D";
}

async function main() {
  console.log("Starting Champion Tier Stats database seed...");

  const patchVersion = DEFAULT_DDRAGON_VERSION;
  const recordsToInsert: Array<{
    championId: string;
    name: string;
    role: string;
    rank: string;
    tier: string;
    winRate: number;
    patchWrChange: number;
    banRate: number;
    pickRate: number;
    matches: number;
    avatarUrl: string;
    patch: string;
  }> = [];

  for (const rank of ALL_RANKS) {
    const wrSpread = RANK_WR_SPREAD[rank];
    const totalSample = RANK_MATCH_SAMPLE[rank];

    for (const champ of CHAMPION_CATALOG) {
      for (const role of champ.roles) {
        const seed = hashString(`${champ.id}:${role}:${rank}:v2026`);
        const rand = createPrng(seed);

        const rawWr = wrSpread.min + rand() * (wrSpread.max - wrSpread.min);
        const winRate = Number(rawWr.toFixed(1));

        const rawChange = (rand() - 0.48) * 4.8;
        const patchWrChange = Number(rawChange.toFixed(1));

        const pickBias = champ.basePickBias ?? 1.0;
        const rawPick = (0.4 + rand() * 5.2) * pickBias;
        const pickRate = Number(Math.min(24.5, Math.max(0.1, rawPick)).toFixed(1));

        const banBias = champ.baseBanBias ?? 1.0;
        const rawBan = (0.2 + Math.pow(rand(), 2.2) * 9.5) * banBias;
        const banRate = Number(Math.min(48.0, Math.max(0.1, rawBan)).toFixed(1));

        const matchNoise = 0.85 + rand() * 0.3;
        const matches = Math.max(
          450,
          Math.round((totalSample * (pickRate / 100) * matchNoise) / 10) * 10
        );

        const tier = calculateTierGrade(winRate);
        const avatarUrl = `${DDRAGON_BASE_URL}/cdn/${patchVersion}/img/champion/${champ.id}.png`;

        recordsToInsert.push({
          championId: champ.id,
          name: champ.name,
          role,
          rank,
          tier,
          winRate,
          patchWrChange,
          banRate,
          pickRate,
          matches,
          avatarUrl,
          patch: patchVersion,
        });
      }
    }
  }

  console.log(`Prepared ${recordsToInsert.length} records. Writing to PostgreSQL...`);

  // Use createMany with skipDuplicates for high performance batch insertion
  const batchSize = 500;
  for (let i = 0; i < recordsToInsert.length; i += batchSize) {
    const batch = recordsToInsert.slice(i, i + batchSize);
    await (prisma as any).championTierStat.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }

  console.log(`Successfully seeded ${recordsToInsert.length} champion tier records into PostgreSQL!`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
