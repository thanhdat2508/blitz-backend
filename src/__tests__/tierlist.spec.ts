import { tierListService } from "../services/tierlist.service";
import { CHAMPION_CATALOG } from "../data/champion-catalog";

async function runTierListVerification() {
  console.log("=== RUNNING TIERLIST UNIQUE CHAMPION MODEL (173 CHAMPIONS) VERIFICATION ===\n");

  // [TEST 1] Role 'all' must return strictly 173 unique champions
  console.log("[TEST 1] Unique Champion Model Verification (role='all')");
  const allRes = await tierListService.getTierList({ role: "all", rank: "emerald" });

  if (!allRes.success) {
    throw new Error("Expected allRes.success to be true");
  }

  if (allRes.total !== 173) {
    throw new Error(`Expected exactly 173 total champions, got ${allRes.total}`);
  }

  if (allRes.data.length !== 173) {
    throw new Error(`Expected exactly 173 items in data array, got ${allRes.data.length}`);
  }

  const championIdSet = new Set<string>();
  const duplicates: string[] = [];

  for (const item of allRes.data) {
    const lowerId = item.championId.toLowerCase();
    if (championIdSet.has(lowerId)) {
      duplicates.push(item.championId);
    }
    championIdSet.add(lowerId);
  }

  if (duplicates.length > 0) {
    throw new Error(`Duplicate champions detected in role='all': ${duplicates.join(", ")}`);
  }

  console.log(`✅ PASSED: Exactly 173 unique champions returned with 0 duplicates.`);

  // [TEST 2] Ranks must be consecutive from 1 to 173
  console.log("\n[TEST 2] Consecutive Ranking Verification (1 to 173)");
  for (let i = 0; i < allRes.data.length; i++) {
    const expectedRank = i + 1;
    if (allRes.data[i].rank !== expectedRank) {
      throw new Error(`Rank mismatch at index ${i}: expected ${expectedRank}, got ${allRes.data[i].rank}`);
    }
  }
  console.log("✅ PASSED: Ranks are strictly consecutive from 1 to 173.");

  // [TEST 3] Signature champions must match their Catalog Primary Role
  console.log("\n[TEST 3] Primary Role Matching Verification");
  const championMap = new Map(allRes.data.map((c) => [c.championId.toLowerCase(), c]));

  const ahri = championMap.get("ahri");
  if (!ahri || ahri.role !== "mid") {
    throw new Error(`Expected Ahri to be mid, got ${ahri?.role}`);
  }

  const darius = championMap.get("darius");
  if (!darius || darius.role !== "top") {
    throw new Error(`Expected Darius to be top, got ${darius?.role}`);
  }

  const jinx = championMap.get("jinx");
  if (!jinx || jinx.role !== "ad") {
    throw new Error(`Expected Jinx to be ad, got ${jinx?.role}`);
  }

  const leona = championMap.get("leona");
  if (!leona || leona.role !== "sp") {
    throw new Error(`Expected Leona to be sp, got ${leona?.role}`);
  }

  const leeSin = championMap.get("leesin");
  if (!leeSin || leeSin.role !== "jungle") {
    throw new Error(`Expected Lee Sin to be jungle, got ${leeSin?.role}`);
  }

  console.log("✅ PASSED: Key champions accurately matched to their primary competitive role:");
  console.log(`   - Ahri: ${ahri.role} (Win Rate: ${ahri.winRate}%, Tier: ${ahri.tier})`);
  console.log(`   - Darius: ${darius.role} (Win Rate: ${darius.winRate}%, Tier: ${darius.tier})`);
  console.log(`   - Jinx: ${jinx.role} (Win Rate: ${jinx.winRate}%, Tier: ${jinx.tier})`);
  console.log(`   - Leona: ${leona.role} (Win Rate: ${leona.winRate}%, Tier: ${leona.tier})`);
  console.log(`   - Lee Sin: ${leeSin.role} (Win Rate: ${leeSin.winRate}%, Tier: ${leeSin.tier})`);

  // [TEST 4] Individual Role Filtering Integrity
  console.log("\n[TEST 4] Individual Role Filtering Integrity");
  const rolesToTest = ["top", "mid", "sp", "jungle", "ad"] as const;
  const expectedCounts: Record<string, number> = {
    top: 71,
    mid: 81,
    sp: 51,
    jungle: 57,
    ad: 33,
  };

  for (const r of rolesToTest) {
    const roleRes = await tierListService.getTierList({ role: r, rank: "emerald" });
    const wrongRoles = roleRes.data.filter((item) => item.role !== r);
    if (wrongRoles.length > 0) {
      throw new Error(`Role leak in role='${r}': found items with role '${wrongRoles[0].role}'`);
    }

    if (roleRes.total !== expectedCounts[r]) {
      throw new Error(`Expected ${expectedCounts[r]} champions for role '${r}', got ${roleRes.total}`);
    }

    console.log(`✅ PASSED: Role '${r}' verified: strictly ${roleRes.total} champions, 0 role leaks.`);
  }

  // [TEST 5] Search & Boundary Safety
  console.log("\n[TEST 5] Search & Boundary Safety");
  const searchRes = await tierListService.getTierList({ role: "all", search: "quinn" });
  if (searchRes.total !== 1 || searchRes.data[0].championId !== "Quinn") {
    throw new Error(`Search for 'quinn' failed, expected 1 item, got ${searchRes.total}`);
  }
  console.log(`✅ PASSED: Search for 'quinn' returned exact 1 match: ${searchRes.data[0].name} (${searchRes.data[0].role})`);

  console.log("\n🎉 ALL 5 TIER LIST VERIFICATION SUITES PASSED! 173 UNIQUE CHAMPIONS CONFIRMED!");
}

runTierListVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ VERIFICATION FAILED:", err);
    process.exit(1);
  });
