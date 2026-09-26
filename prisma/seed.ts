import prisma from "../src/config/database";
import { championBuildService } from "../src/modules/champion-build/services/champion-build.service";
import { riotStaticDataService } from "../src/modules/champion-build/services/riot-static-data.service";
import { Role } from "../src/modules/champion-build/interfaces/champion-build.interface";

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

  // 2. Fetch live Riot Champions dynamically (All 168+ champions)
  const champions = await riotStaticDataService.getAllChampions();
  console.log(`📦 Loaded ${champions.length} champions dynamically from Riot Data Dragon.`);

  // 3. Dynamically determine primary roles for each champion based on Riot tags & class archetype
  const resolveRolesForChampion = (tags: string[], champId: string): Role[] => {
    // Specific jungle specialists
    const jungleChampions = new Set([
      "LeeSin", "Viego", "Kayn", "Khazix", "Elise", "Nocturne", "JarvanIV",
      "XinZhao", "Kindred", "Graves", "Evelynn", "Hecarim", "Nidalee", "Rengar",
      "Shaco", "Fiddlesticks", "Udyr", "Warwick", "Zac", "Amumu", "Rammus",
      "Sejuani", "Skarner", "Ivern", "MasterYi", "Belveth", "Briar"
    ]);
    if (jungleChampions.has(champId)) {
      return ["jungle"];
    }

    const primaryTag = tags[0] || "Fighter";
    switch (primaryTag) {
      case "Marksman":
        return ["adc"];
      case "Mage":
        return tags.includes("Support") ? ["support", "mid"] : ["mid"];
      case "Assassin":
        return tags.includes("Fighter") ? ["jungle", "mid"] : ["mid"];
      case "Tank":
        return tags.includes("Support") ? ["support", "top"] : ["top"];
      case "Support":
        return ["support"];
      case "Fighter":
      default:
        return ["top"];
    }
  };

  console.log(`⚡ Dynamically seeding builds for all ${champions.length} champions into PostgreSQL...`);

  let buildCount = 0;
  for (const champ of champions) {
    const roles = resolveRolesForChampion(champ.tags, champ.id);
    for (const role of roles) {
      try {
        await championBuildService.getChampionBuild(champ.id, role, "EMERALD+", "WORLD");
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
