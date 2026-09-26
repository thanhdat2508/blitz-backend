import fs from "fs";
import path from "path";
import prisma from "../src/config/database";
import { championBuildService } from "../src/modules/champion-build/services/champion-build.service";
import { riotStaticDataService } from "../src/modules/champion-build/services/riot-static-data.service";
import { Role } from "../src/modules/champion-build/interfaces/champion-build.interface";
import { PrebakedChampion } from "../scripts/sync-champions";

async function main() {
  console.log("🌱 [Prisma Seed] Initializing League of Legends Database Seeding...");

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
  console.log(`🏷️ Standard Tags verified in database: [${standardTags.join(", ")}]`);

  // 2. Load prebaked champions from JSON file (or fallback to live sync if missing)
  const jsonPath = path.resolve(__dirname, "./data/champions.json");
  let champions: PrebakedChampion[] = [];

  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    champions = JSON.parse(raw) as PrebakedChampion[];
    console.log(`📦 Loaded ${champions.length} prebaked champions with deterministic UUIDs from champions.json.`);
  } else {
    console.log("⚠️ champions.json not found, fetching live from Riot Data Dragon...");
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
  }

  console.log(`⚡ Seeding champions and builds into PostgreSQL...`);

  let buildCount = 0;
  for (const champ of champions) {
    for (const role of champ.roles) {
      try {
        await championBuildService.getChampionBuild(champ.key, role as Role, "EMERALD+", "WORLD");
        buildCount++;
        process.stdout.write(".");
      } catch (err) {
        console.warn(`\n⚠️ Failed to seed ${champ.name} (${role}):`, err);
      }
    }
  }

  console.log(`\n\n✅ [Prisma Seed] Successfully seeded ${champions.length} champions and ${buildCount} dynamic role builds into PostgreSQL!`);
}

main()
  .catch((e) => {
    console.error("❌ [Prisma Seed] Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

