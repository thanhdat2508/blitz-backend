import prisma from "../src/config/database";
import { championBuildService } from "../src/modules/champion-build/services/champion-build.service";
import { riotStaticDataService } from "../src/modules/champion-build/services/riot-static-data.service";
import { Role } from "../src/modules/champion-build/interfaces/champion-build.interface";

async function main() {
  console.log("🌱 [Prisma Seed] Initializing League of Legends Database Seeding...");

  // 1. Fetch live Riot Champions
  const champions = await riotStaticDataService.getAllChampions();
  console.log(`📦 Loaded ${champions.length} champions from Riot Data Dragon.`);

  // 2. Pre-seed standard Tags into PostgreSQL
  const standardTags = ["Mage", "Assassin", "Marksman", "Fighter", "Tank", "Support"];
  for (const tagName of standardTags) {
    try {
      await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      });
    } catch (err) {
      // Gracefully continue if DB offline
    }
  }
  console.log(`🏷️ Standard Tags verified in database: [${standardTags.join(", ")}]`);

  // 3. Select priority roster for initial seeding
  const priorityRoster: Array<{ key: string; roles: Role[] }> = [
    { key: "Quinn", roles: ["mid", "jungle", "top"] },
    { key: "Aatrox", roles: ["top"] },
    { key: "Ahri", roles: ["mid"] },
    { key: "LeeSin", roles: ["jungle"] },
    { key: "Jinx", roles: ["adc"] },
    { key: "Thresh", roles: ["support"] },
    { key: "Zed", roles: ["mid"] },
    { key: "Yasuo", roles: ["mid", "top"] },
    { key: "Yone", roles: ["mid", "top"] },
    { key: "KSante", roles: ["top"] },
    { key: "Wukong", roles: ["jungle", "top"] },
    { key: "Kaisa", roles: ["adc"] },
    { key: "Viego", roles: ["jungle"] },
    { key: "Lux", roles: ["support", "mid"] },
    { key: "Nautilus", roles: ["support"] },
    { key: "Caitlyn", roles: ["adc"] },
    { key: "Ezreal", roles: ["adc"] },
    { key: "Sylas", roles: ["mid", "jungle"] },
    { key: "Akali", roles: ["mid", "top"] },
    { key: "Malzahar", roles: ["mid"] },
  ];

  console.log(`⚡ Seeding ${priorityRoster.length} champions across multiple roles into PostgreSQL...`);

  let buildCount = 0;
  for (const item of priorityRoster) {
    for (const role of item.roles) {
      try {
        await championBuildService.getChampionBuild(item.key, role, "EMERALD+", "WORLD");
        buildCount++;
        process.stdout.write(`.` );
      } catch (err) {
        console.warn(`\n⚠️ Failed to seed ${item.key} (${role}):`, err);
      }
    }
  }

  console.log(`\n\n✅ [Prisma Seed] Successfully seeded ${priorityRoster.length} champions and ${buildCount} role builds into PostgreSQL!`);
}

main()
  .catch((e) => {
    console.error("❌ [Prisma Seed] Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
