import fs from "fs";
import path from "path";
import prisma from "../src/config/database";
import { CHAMPION_CATALOG } from "../src/data/champion-catalog";
import { PRO_PLAYERS_DATA } from "../src/data/pro-players.data";
import { ChampionRole, RankTier } from "../src/types/tierlist.types";
import { DDRAGON_BASE_URL, DEFAULT_DDRAGON_VERSION } from "../src/config/riot";
import { championBuildService } from "../src/modules/champion-build/services/champion-build.service";
import { riotStaticDataService } from "../src/modules/champion-build/services/riot-static-data.service";
import { Role } from "../src/modules/champion-build/interfaces/champion-build.interface";
import { PrebakedChampion } from "../scripts/sync-champions";
import PostService from "../src/services/post.service";

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

async function seedChampionTierStats() {
  console.log("Starting Champion Tier Stats database seed...");

  // 1. Seed master roles into Role table (N-N lookup table)
  const ROLES_DATA = [
    { id: "top", name: "TOP", displayName: "Top" },
    { id: "jungle", name: "JUNGLE", displayName: "Jungle" },
    { id: "mid", name: "MID", displayName: "Mid" },
    { id: "ad", name: "AD", displayName: "ADC" },
    { id: "sp", name: "SP", displayName: "Support" },
  ];

  for (const r of ROLES_DATA) {
    try {
      await (prisma as any).role.upsert({
        where: { id: r.id },
        update: { displayName: r.displayName },
        create: r,
      });
    } catch (roleErr) {
      console.warn(`Role upsert warning (${r.id}):`, roleErr);
    }
  }
  console.log("Master roles verified in database: [top, jungle, mid, ad, sp]");

  const patchVersion = DEFAULT_DDRAGON_VERSION;
  const recordsToInsert: Array<{
    championId: string;
    name: string;
    roleId: string;
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
          roleId: role,
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

  console.log(`Prepared ${recordsToInsert.length} tier records. Writing to PostgreSQL...`);

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

async function seedChampionBuilds() {
  console.log("Initializing Champion Builds and Tags Seeding...");

  // 1. Pre-seed standard Tags into PostgreSQL
  const standardTags = ["Mage", "Assassin", "Marksman", "Fighter", "Tank", "Support"];
  for (const tagName of standardTags) {
    try {
      await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      });
    } catch {
      // Gracefully continue if DB offline
    }
  }
  console.log(`Standard Tags verified: [${standardTags.join(", ")}]`);

  // 2. Load prebaked champions from JSON file (or fallback to live sync if missing)
  const jsonPath = path.resolve(__dirname, "./data/champions.json");
  let champions: PrebakedChampion[] = [];

  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    champions = JSON.parse(raw) as PrebakedChampion[];
    console.log(`Loaded ${champions.length} prebaked champions from champions.json.`);
  } else {
    try {
      console.log("champions.json not found, fetching live from Riot Data Dragon...");
      const liveChamps = await riotStaticDataService.getAllChampions();
      champions = liveChamps.map((c) => ({
        id: c.key,
        riotKey: c.key,
        key: c.id,
        name: c.name,
        title: c.title,
        primaryClass: c.tags[0] || "Fighter",
        tags: c.tags,
        partype: c.partype,
        avatarUrl: "",
        splashUrl: "",
        roles: ["mid"],
      }));
    } catch {
      console.log("Skipping live champions fetch.");
    }
  }

  let buildCount = 0;
  for (const champ of champions) {
    for (const role of champ.roles) {
      try {
        await championBuildService.getChampionBuild(champ.key, role as Role, "EMERALD+", "WORLD");
        buildCount++;
      } catch (err) {
        console.warn(`Failed to seed ${champ.name} (${role}):`, err);
      }
    }
  }

  console.log(`Successfully seeded ${champions.length} champions and ${buildCount} dynamic role builds!`);
}

async function seedProPlayers() {
  console.log("Seeding Pro Players into PostgreSQL...");
  for (const player of PRO_PLAYERS_DATA) {
    try {
      await (prisma as any).proPlayer.upsert({
        where: { slug: player.slug },
        update: {
          gameId: player.gameId,
          name: player.name,
          nickname: player.nickname,
          description: player.description,
          avatar: player.avatar,
          playerImageUrl: player.playerImageUrl,
          role: player.role,
          team: player.team,
          themeColor: player.themeColor,
          displayOrder: player.displayOrder,
          lastMatch: player.lastMatch as any,
        },
        create: {
          id: player.id,
          slug: player.slug,
          gameId: player.gameId,
          name: player.name,
          nickname: player.nickname,
          description: player.description,
          avatar: player.avatar,
          playerImageUrl: player.playerImageUrl,
          role: player.role,
          team: player.team,
          themeColor: player.themeColor,
          displayOrder: player.displayOrder,
          lastMatch: player.lastMatch as any,
        },
      });
    } catch (err) {
      console.warn(`Failed to seed player ${player.name}:`, err);
    }
  }
  console.log("Pro Players seeded successfully!");
}

async function seedPosts() {
  console.log("Seeding sample Posts & Tags into PostgreSQL...");

  // 1. Create or get admin author
  const author = await prisma.user.upsert({
    where: { email: "admin@blitz.gg" },
    update: {},
    create: {
      email: "admin@blitz.gg",
      username: "BlitzStaff",
      name: "Blitz Editorial Team",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      isEmailVerified: true,
    },
  });

  const samplePosts = [
    {
      title: "Patch 26.19 Notes: Champions Balance and Mid Scope Updates",
      content:
        "Welcome to Patch 26.19! In this update, our primary focus is addressing power outliers in Solo Queue following the mid-season systemic updates, while adjusting cross-map objective pressure in professional play.\n\nHIGHLIGHTS & SYSTEMIC UPDATES\n• Teleport: Channel cooldown reduced from 360s to 330s when targeting allied towers before the 14-minute mark. This adjustment provides top laners greater agency to contest cross-map skirmishes without sacrificing their entire wave state.\n• Lost Chapter Items: Total combine cost reduced by 100 gold, smoothing out power spikes for traditional control mages in the mid lane.\n\nCHAMPION BUFFS\n• Ahri:\n  - Q (Orb of Deception): AP scaling increased from 45% to 50% on both the outward and return passes.\n  - Base Armor: Increased from 21 to 23 to enhance durability against AD burst assassins.\n• Janna:\n  - W (Zephyr): Passive bonus movement speed increased from 6/7/8/9/10% to 7/8/9/10/11%.\n  - E (Eye of the Storm): Shield amount increased by 15 across all ranks.\n\nCHAMPION NERFS\n• Sylas:\n  - W (Kingslayer): Base minimum heal reduced from 65-145 to 50-130. Cooldown increased from 12/10.5/9/7.5/6s to 13/11.5/10/8.5/7s.\n  - Developer Note: Sylas has enjoyed excessive sustain during extended trades, making him oppressive when ahead.\n• Ambessa:\n  - Passive (Drakehound's Step): Bonus physical damage on basic attacks slightly adjusted in the early game (ratio down by 3%).\n\nCheck out your match history and champion tier analytics on Blitz to adjust your runes and builds for 26.19!",
      tags: ["patch-notes"],
      coverImageUrl:
        "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/janna/skins/skin67/images/janna_splash_centered_67.skins_janna_skin67.jpg",
      status: "PUBLISHED" as const,
    },
    {
      title: "Worlds 2026 Meta Report: LCK and LPL Strategies",
      content:
        "As international contenders finalize their bootcamps for the World Championship, distinct strategic philosophies have emerged between Eastern powerhouses. Here is our data-backed breakdown of how the tournament meta is shaping up.\n\nDRAFT PRIORITIES & CONVERGENCE\n• Mid Lane Hierarchy: Control mages (Orianna, Azir, Mel) remain premier blind picks with a combined 82% pick/ban presence. Teams that secure mid-lane push consistently win the vision war around neutral objectives.\n• Support Meta: Engage supports like Nautilus, Rell, and Leona continue to outshine enchanters in competitive scrims due to their reliable flanking tools and ability to initiate around Drake river choke points.\n\nEARLY GAME TEMPO & VOIDGRUBS\n• Fast 3-camp into lane dive: LPL rosters continue their trademark aggression, prioritizing level 3 top-lane dives to completely shut down opposing scaling picks.\n• Objective Trades: LCK squads favor cross-mapping Voidgrubs in exchange for early Dragon control, stacking neutral buffs methodically into 20-minute Baron setups.\n\nKEY PLAYERS & PICKS TO WATCH\nTop laners who command carry champions with cross-map teleport presence are dictating game pacing. Expect aggressive carry matchups like Jax, Camille, and Renekton to take center stage in the bracket stage.",
      tags: ["esports"],
      coverImageUrl:
        "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/mel/skins/skin12/images/mel_splash_centered_12.skins_mel_skin12.jpg",
      status: "PUBLISHED" as const,
    },
    {
      title: "Mastering Jungle Pathing: How to Counter-Jungle in Season 2026",
      content:
        "Clearing jungle camps efficiently is only half the battle. In modern League of Legends, pathing with intent and anticipating enemy jungle routes separates Diamond players from Master+ tier junglers.\n\n1. THE FIRST THREE MINUTES: ROUTE WITH INTENT\n• The 3-Camp Spike: Champions with high dueling potential (Xin Zhao, Lee Sin, Elise) should clear Buff -> Buff -> Gromp to reach Level 3 with full health before 2:35, looking for an early lane gank or invade.\n• The Full Clear: Power-farming junglers (Karthus, Shyvana, Hecarim) should sequence camps towards their desired lane to contest the 3:30 Scuttle Crab with lane priority.\n\n2. TRACKING THE ENEMY JUNGLER\n• Watch enemy laner arrival: Determine which side the opposing jungler started by checking who was late to lane to leash.\n• CS Counting: Each jungle camp grants 4 CS. When the enemy jungler appears on vision with 16 CS, you know exactly which quadrants remain up for invades.\n\n3. BALANCING VOIDGRUBS VS. INFERNAL/OCEAN DRAKE\n• If enemy jungler commits to early Dragon, do not hesitate to cross-map for all 3 Voidgrubs. Securing turret damage amplification will accelerate your team's tower plate gold significantly before the 14-minute plate fall.",
      tags: ["gameplay"],
      coverImageUrl:
        "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/characters/anivia/skins/skin56/images/anivia_splash_centered_56.skins_anivia_skin56.jpg",
      status: "PUBLISHED" as const,
    },
    {
      title: "Community Spotlight: Top Community Builds and Creative Strategies",
      content:
        "Every patch, dedicated one-tricks and creative theorycrafters discover unconventional builds that defy the standard meta. Here are three high-winrate innovations currently making waves in Master and Grandmaster tiers.\n\n1. ARTILLERY AP KOG'MAW MID (53.8% WIN RATE)\n• Core Items: Tear -> Malignance -> Archangel's Staff -> Horizon Focus.\n• Playstyle: Maximize R (Living Artillery) poke from unprecedented range. Malignance creates an MR-shredding pool on impact, allowing Kog'Maw to single-handedly stall neutral objective dances.\n\n2. COLOSSAL SWAIN SUPPORT (52.6% WIN RATE)\n• Core Items: Heartsteel -> Rylai's Crystal Scepter -> Unending Despair.\n• Playstyle: Stacking infinite maximum health alongside his Demonic Ascension (R) turns Swain into an unkillable front-line disruptor for bot-lane 2v2 skirmishes.\n\n3. LETHALITY CAITLYN TOP (OFF-META PICK)\n• Core Items: Opportunity -> Collector -> Lord Dominik's Regards.\n• Playstyle: Utilizing long-range headshots and First Strike to punish melee top laners without gap closers. Extremely high risk, but devastating when paired with roaming junglers.\n\nHave a unique off-meta build climbing the ranks? Share your stats and match breakdowns on the Blitz community forums!",
      tags: ["community"],
      coverImageUrl:
        "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg",
      status: "PUBLISHED" as const,
    },
  ];

  for (const postInput of samplePosts) {
    const existing = await prisma.post.findFirst({
      where: { title: postInput.title },
    });
    if (!existing) {
      await PostService.createPost(author.id, postInput);
      console.log(`Created post: "${postInput.title}"`);
    } else {
      await PostService.updatePost(author.id, existing.id, {
        content: postInput.content,
        coverImageUrl: postInput.coverImageUrl,
        tags: postInput.tags,
      });
      console.log(`Updated post: "${postInput.title}"`);
    }
  }

  console.log("Sample Posts seeded successfully!");
}

async function main() {
  await seedPosts();
  await seedProPlayers();
  await seedChampionTierStats();
  try {
    await seedChampionBuilds();
  } catch (err) {
    console.warn("Champion builds seed completed with warnings:", err);
  }
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
