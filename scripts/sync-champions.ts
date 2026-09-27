import fs from "fs";
import path from "path";
import { generateChampionUUID } from "../src/utils/crypto";

interface RiotChampionData {
  id: string;      // e.g. "Quinn", "MonkeyKing"
  key: string;     // e.g. "133", "62"
  name: string;    // e.g. "Quinn", "Wukong"
  title: string;   // e.g. "Demacia's Wings"
  tags: string[];  // e.g. ["Marksman", "Assassin"]
  partype: string; // e.g. "Mana"
}

interface RiotDDragonResponse {
  version: string;
  data: Record<string, RiotChampionData>;
}

export interface PrebakedChampion {
  id: string; // Deterministic UUID v5
  riotKey: string;
  key: string;
  name: string;
  title: string;
  primaryClass: string;
  tags: string[];
  partype: string;
  avatarUrl: string;
  splashUrl: string;
  roles: string[];
}

const VALID_CLASSES = ["Mage", "Assassin", "Marksman", "Fighter", "Tank", "Support"];

function resolveRoles(tags: string[], champId: string): string[] {
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
      return tags.includes("Support") ? ["mid", "support"] : ["mid"];
    case "Assassin":
      return tags.includes("Fighter") ? ["mid", "jungle"] : ["mid"];
    case "Tank":
      return tags.includes("Support") ? ["top", "support"] : ["top"];
    case "Support":
      return ["support"];
    case "Fighter":
    default:
      return ["top"];
  }
}

import { DEFAULT_DDRAGON_VERSION } from "../src/config/riot";

async function syncChampions() {
  console.log("🚀 [Sync Champions] Fetching live metadata from Riot Games Data Dragon...");
  let patch = DEFAULT_DDRAGON_VERSION;
  try {
    const versionsRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json", {
      signal: AbortSignal.timeout(5000),
    });
    if (versionsRes.ok) {
      const versions = (await versionsRes.json()) as string[];
      if (versions.length > 0) {
        patch = versions[0];
      }
    }
  } catch {
    console.log(`Using fallback patch: ${patch}`);
  }

  console.log(`Using Data Dragon patch: ${patch}`);
  const url = `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`;

  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Data Dragon: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as RiotDDragonResponse;
  const rawList = Object.values(json.data);
  console.log(`📦 Fetched ${rawList.length} champions from Riot Data Dragon.`);

  const champions: PrebakedChampion[] = rawList.map((champ) => {
    const primaryClass = VALID_CLASSES.includes(champ.tags[0]) ? champ.tags[0] : "Fighter";
    const uuid = generateChampionUUID(champ.key);
    const roles = resolveRoles(champ.tags, champ.id);

    return {
      id: uuid,
      riotKey: champ.key,
      key: champ.id,
      name: champ.name,
      title: champ.title,
      primaryClass,
      tags: champ.tags.length > 0 ? champ.tags : [primaryClass],
      partype: champ.partype || "Mana",
      avatarUrl: `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${champ.id}.png`,
      splashUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_0.jpg`,
      roles,
    };
  });

  // Sort alphabetically by name
  champions.sort((a, b) => a.name.localeCompare(b.name));

  const outputDir = path.resolve(__dirname, "../prisma/data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "champions.json");
  fs.writeFileSync(outputPath, JSON.stringify(champions, null, 2), "utf-8");

  console.log(`✅ [Sync Champions] Successfully prebaked ${champions.length} champions with deterministic UUIDs to:`);
  console.log(`   ${outputPath}`);
}

syncChampions().catch((err) => {
  console.error("❌ [Sync Champions] Error:", err);
  process.exit(1);
});
