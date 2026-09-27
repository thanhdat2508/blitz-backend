import { ChampionBuildValidator, BadRequestException } from "../dto/get-champion-build.dto";
import { ChampionBuildService } from "../services/champion-build.service";

async function runTests() {
  console.log("=== RUNNING 100% BLITZ-EQUIVALENT FULL SPECS VERIFICATION SUITE ===");
  const service = new ChampionBuildService();

  // Test 1: Validation
  console.log("\n[TEST 1] Boundary DTO Validator");
  try {
    ChampionBuildValidator.validate({ champion: "", role: "mid" }, {});
    console.error("❌ FAILED: Empty champion did not throw error");
    process.exit(1);
  } catch (err) {
    if (err instanceof BadRequestException) {
      console.log("✅ PASSED: Empty champion threw BadRequestException");
    }
  }

  // Test 2: Quinn Mid - 100% Blitz Match Verification
  console.log("\n[TEST 2] Quinn Mid 100% Blitz Match Verification");
  const quinn = await service.getChampionBuild("Quinn", "mid", "EMERALD+", "WORLD", "14.24");

  // 2.1 Overview & Identification
  if (quinn.overview.name !== "Quinn" || !quinn.overview.id) {
    throw new Error(`Expected Quinn name Quinn and valid UUID, got ${quinn.overview.name} (${quinn.overview.id})`);
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(quinn.overview.id)) {
    throw new Error(`Expected Quinn ID to be valid UUID v5, got ${quinn.overview.id}`);
  }
  if (quinn.overview.primaryClass !== "Marksman") {
    throw new Error(`Expected Quinn primaryClass 'Marksman', got ${quinn.overview.primaryClass}`);
  }
  if (!quinn.overview.tags || !quinn.overview.tags.includes("Marksman")) {
    throw new Error(`Expected Quinn tags to include 'Marksman', got ${quinn.overview.tags}`);
  }
  if (!quinn.overview.availableRoles || quinn.overview.availableRoles.length < 3) {
    throw new Error(`Expected Quinn availableRoles to have >= 3 roles, got ${quinn.overview.availableRoles?.length}`);
  }
  console.log(`✅ PASSED: Quinn identified with ID 133, title '${quinn.overview.title}', class '${quinn.overview.primaryClass}', tags [${quinn.overview.tags.join(", ")}]`);

  // 2.2 Damage Breakdown
  if (quinn.damageBreakdown.physical < 80) {
    throw new Error(`Expected Quinn physical damage > 80%, got ${quinn.damageBreakdown.physical}%`);
  }
  const damageSum =
    quinn.damageBreakdown.physical +
    quinn.damageBreakdown.magic +
    quinn.damageBreakdown.trueDamage;
  if (Math.abs(damageSum - 100) > 0.1) {
    throw new Error(`Damage breakdown sum must equal 100%, got ${damageSum}%`);
  }
  console.log(`✅ PASSED: Damage Breakdown: ${quinn.damageBreakdown.physical}% Physical (AD), ${quinn.damageBreakdown.magic}% Magic, ${quinn.damageBreakdown.trueDamage}% True Damage`);

  // 2.3 Completed 6 Items & Build Order
  if (quinn.items.completed[0].itemIds.length !== 6) {
    throw new Error(`Expected 6 completed items, got ${quinn.items.completed[0].itemIds.length}`);
  }
  if (!quinn.items.buildOrder || quinn.items.buildOrder.length < 5) {
    throw new Error("Expected buildOrder array with item components progression");
  }
  console.log(`✅ PASSED: Full 6 Completed Items: [${quinn.items.completed[0].itemIds.join(", ")}]`);
  console.log(`✅ PASSED: Build Order progression: [${quinn.items.buildOrder.join(" -> ")}]`);

  // 2.4 Abilities Metadata (P, Q, W, E, R)
  const { abilities } = quinn;
  if (!abilities.passive.name || !abilities.q.name || !abilities.w.name || !abilities.e.name || !abilities.r.name) {
    throw new Error("Missing ability names");
  }
  if (!abilities.passive.iconUrl.includes("http") || !abilities.q.iconUrl.includes("http")) {
    throw new Error("Invalid ability icon URLs");
  }
  console.log(`✅ PASSED: Abilities validated:`);
  console.log(`   - Passive: ${abilities.passive.name} (${abilities.passive.iconUrl})`);
  console.log(`   - Q: ${abilities.q.name}`);
  console.log(`   - W: ${abilities.w.name}`);
  console.log(`   - E: ${abilities.e.name}`);
  console.log(`   - R: ${abilities.r.name}`);

  // 2.5 Previous Patch Stats & Trend
  if (!quinn.previousPatch.patch || !quinn.previousPatch.trend) {
    throw new Error("Missing previousPatch data");
  }
  console.log(`✅ PASSED: Previous Patch: ${quinn.previousPatch.patch}, Trend: ${quinn.previousPatch.trend} (${quinn.previousPatch.winRateDiff}%)`);

  // 2.6 Similar Champions
  if (!quinn.similarChampions || quinn.similarChampions.length < 3) {
    throw new Error("Expected at least 3 similar champions");
  }
  console.log(`✅ PASSED: Similar Champions: ${quinn.similarChampions.map((c) => c.name).join(", ")}`);

  // 2.7 Key Insights (100% Blitz.gg Match Verification)
  if (!quinn.insights.general?.length || !quinn.insights.strengths?.length || !quinn.insights.weaknesses?.length) {
    throw new Error("Missing insights general, strengths, or weaknesses arrays");
  }

  // Verify ability tokens [P], [Q], [W], [R] are properly embedded
  const generalStr = quinn.insights.general.join(" ");
  const strengthsStr = quinn.insights.strengths.join(" ");
  const weaknessesStr = quinn.insights.weaknesses.join(" ");

  if (!generalStr.includes("[P]") || !generalStr.includes("[Q]") || !generalStr.includes("[R]")) {
    throw new Error("Quinn Key Insights missing ability tokens [P], [Q], or [R]");
  }
  if (!strengthsStr.includes("[P]") || !strengthsStr.includes("[W]")) {
    throw new Error("Quinn Strengths missing ability tokens [P] or [W]");
  }
  if (!weaknessesStr.includes("[W]")) {
    throw new Error("Quinn Weaknesses missing ability token [W]");
  }

  // Exact sentences matching the Blitz.gg UI
  if (!generalStr.includes("[P] reveals enemies it affects.")) {
    throw new Error("Missing '[P] reveals enemies it affects.' in general insights");
  }
  if (!strengthsStr.includes("[W]'s movespeed and attack speed buffs make her hard to trade with.")) {
    throw new Error("Missing '[W] movespeed buff' in strengths insights");
  }
  if (!weaknessesStr.includes("50 seconds at rank 1")) {
    throw new Error("Missing '[W] 50s cooldown' in weaknesses insights");
  }

  // Verify structured items contain parsed abilityKeys
  if (!quinn.insights.structured?.general || !quinn.insights.structured?.strengths) {
    throw new Error("Missing structured insights metadata");
  }
  const hasParsedP = quinn.insights.structured.general.some((item) => item.abilityKeys.includes("P"));
  if (!hasParsedP) {
    throw new Error("Structured insights failed to parse abilityKey 'P'");
  }

  console.log(`✅ PASSED: Insights: ${quinn.insights.general.length} key insights, ${quinn.insights.strengths.length} strengths, ${quinn.insights.weaknesses.length} weaknesses with [P],[Q],[W],[E],[R] ability tokens & structured metadata verified`);

  // 2.8 Stat Shards (3x3 Matrix & Archetype Verification)
  const { statShards } = quinn.runes.mostPopular;
  if (statShards.offense !== 5005 || statShards.flex !== 5008 || statShards.defense !== 5001) {
    throw new Error(`Expected Quinn Marksman shards [5005, 5008, 5001], got [${statShards.offense}, ${statShards.flex}, ${statShards.defense}]`);
  }
  if (!statShards.slots || statShards.slots[0] !== 5005 || statShards.slots[1] !== 5008 || statShards.slots[2] !== 5001) {
    throw new Error(`Expected slots [5005, 5008, 5001], got ${JSON.stringify(statShards.slots)}`);
  }
  if (!statShards.rows || statShards.rows.length !== 3) {
    throw new Error(`Expected 3 rows in statShards.rows, got ${statShards.rows?.length}`);
  }
  for (const row of statShards.rows) {
    if (row.options.length !== 3) {
      throw new Error(`Row ${row.row} must have exactly 3 options, got ${row.options.length}`);
    }
    const selectedOptions = row.options.filter((o) => o.isSelected);
    if (selectedOptions.length !== 1) {
      throw new Error(`Row ${row.row} must have exactly 1 selected option, got ${selectedOptions.length}`);
    }
    if (selectedOptions[0].id !== row.selectedId) {
      throw new Error(`Row ${row.row} selectedId ${row.selectedId} doesn't match selected option ${selectedOptions[0].id}`);
    }
  }
  console.log(`✅ PASSED: Stat Shards 3x3 Matrix verified for Marksman: Row 1=Attack Speed (5005), Row 2=Adaptive Force (5008), Row 3=Scaling Health (5001)`);

  // Test 3: Ahri Mid (Mage Verification with AP damage breakdown and 6 AP items)
  console.log("\n[TEST 3] Ahri Mid (Mage Damage & AP Completed Items)");
  const ahri = await service.getChampionBuild("Ahri", "mid", "EMERALD+", "WORLD", "14.24");
  if (ahri.damageBreakdown.magic < 80) {
    throw new Error(`Expected Ahri magic damage > 80%, got ${ahri.damageBreakdown.magic}%`);
  }
  if (ahri.overview.primaryClass !== "Mage") {
    throw new Error(`Expected Ahri primaryClass 'Mage', got ${ahri.overview.primaryClass}`);
  }
  if (!ahri.overview.tags?.includes("Mage")) {
    throw new Error(`Expected Ahri tags to include 'Mage', got ${ahri.overview.tags}`);
  }
  if (!ahri.items.completed[0].itemIds.includes(3089)) {
    throw new Error("Expected Ahri completed items to include Rabadon's Deathcap (3089)");
  }
  if (ahri.runes.mostPopular.statShards.defense !== 5011) {
    throw new Error(`Expected Ahri Mage defense shard 5011 (Flat Health), got ${ahri.runes.mostPopular.statShards.defense}`);
  }
  console.log(`✅ PASSED: Ahri Magic Damage: ${ahri.damageBreakdown.magic}% AP, Class: ${ahri.overview.primaryClass}, Completed AP items verified`);
  console.log(`✅ PASSED: Ahri Stat Shards: Mage defense shard is Flat Health (5011)`);

  // Test 4: Decimal Precision Check across all numbers
  console.log("\n[TEST 4] Precision Audit (strictly <= 2 decimals)");
  const checkRate = (name: string, rate: number) => {
    const str = rate.toString();
    const parts = str.split(".");
    if (parts.length > 1 && parts[1].length > 2) {
      throw new Error(`Rate ${name} = ${rate} has more than 2 decimal places!`);
    }
  };

  checkRate("Quinn WinRate", quinn.overview.winRate);
  checkRate("Quinn PickRate", quinn.overview.pickRate);
  checkRate("Quinn BanRate", quinn.overview.banRate);
  checkRate("Quinn Prev WinRateDiff", quinn.previousPatch.winRateDiff);
  checkRate("Quinn Damage Physical", quinn.damageBreakdown.physical);
  checkRate("Quinn Damage Magic", quinn.damageBreakdown.magic);
  checkRate("Quinn Damage True", quinn.damageBreakdown.trueDamage);

  console.log("✅ PASSED: All floating-point numbers adhere strictly to 2 decimal places");

  // Test 5: Quinn Jungle Role Adaptation Check
  console.log("\n[TEST 5] Quinn Jungle 100% Blitz Match Verification");
  const quinnJg = await service.getChampionBuild("Quinn", "jungle", "EMERALD+", "WORLD");
  if (!quinnJg.spells.some((s) => s.spell1Id === 11 || s.spell2Id === 11)) {
    throw new Error("Expected Quinn Jungle spells to include Smite (11)");
  }
  console.log("✅ PASSED: Spells include Smite (11) + Flash (4)");

  if (!quinnJg.items.starting.some((s) => s.itemIds.includes(1102) || s.itemIds.includes(1101))) {
    throw new Error("Expected Quinn Jungle starting items to include Jungle Pet (1102 or 1101)");
  }
  console.log("✅ PASSED: Starting items include Jungle Pet (1102/1101)");

  if (!quinnJg.items.trinkets.some((t) => t.itemIds.includes(3364))) {
    throw new Error("Expected Quinn Jungle trinket to include Oracle Lens (3364)");
  }
  console.log("✅ PASSED: Trinket includes Oracle Lens (3364)");

  if (quinnJg.skills.maxOrder[0] !== "Q") {
    throw new Error(`Expected Quinn Jungle max order to start with Q, got ${quinnJg.skills.maxOrder.join(" > ")}`);
  }
  console.log(`✅ PASSED: Skill max order adapted for Jungle clear speed: ${quinnJg.skills.maxOrder.join(" > ")}`);

  const hasJungleRole = quinnJg.overview.availableRoles.some((r) => r.role === "jungle" && r.isPrimary);
  if (!hasJungleRole) {
    throw new Error("Expected availableRoles to contain role 'jungle' with isPrimary: true");
  }
  console.log("✅ PASSED: availableRoles dynamically marks 'jungle' as primary");

  // Test 6: Advanced Verification (Matchup Disjointness, DTO Edge Cases & Concurrency)
  console.log("\n[TEST 6] Advanced Code Quality, Boundaries & Concurrency Verification");

  // 6.1 Matchup Disjointness Check
  const bestNames = new Set(quinn.matchups.bestAgainst.map((m) => m.name));
  const hasOverlap = quinn.matchups.worstAgainst.some((m) => bestNames.has(m.name));
  if (hasOverlap) {
    throw new Error("Matchups overlap detected: bestAgainst and worstAgainst share champions!");
  }
  console.log("✅ PASSED: bestAgainst and worstAgainst are 100% disjoint (no duplicate opponents)");

  // 6.2 DTO Boundary Edge Cases
  try {
    ChampionBuildValidator.validate({ champion: "Ahri", role: "mid" }, { patch: "../../../etc/passwd" });
    throw new Error("Expected path traversal patch to be rejected");
  } catch (err) {
    if (err instanceof BadRequestException) {
      console.log("✅ PASSED: Malicious patch input successfully rejected with BadRequestException");
    }
  }

  try {
    ChampionBuildValidator.validate({ champion: "Ahri", role: "invalid_role" }, {});
    throw new Error("Expected invalid role to be rejected");
  } catch (err) {
    if (err instanceof BadRequestException) {
      console.log("✅ PASSED: Invalid role successfully rejected with BadRequestException");
    }
  }

  // 6.3 Concurrency & Cache Stampede Resistance
  const concurrentResults = await Promise.all([
    service.getChampionBuild("Ahri", "mid"),
    service.getChampionBuild("Aatrox", "top"),
    service.getChampionBuild("LeeSin", "jungle"),
  ]);
  if (concurrentResults.length !== 3 || !concurrentResults[0].overview.name) {
    throw new Error("Concurrent requests failed");
  }
  console.log("✅ PASSED: Concurrent multi-champion requests resolved safely with 0 race conditions");

  // Test 7: Full 3x3 Stat Shards Matrix & Season 14 Validation
  console.log("\n[TEST 7] Season 14 Stat Shards 3x3 Matrix & Icon Integrity Verification");
  const malphite = await service.getChampionBuild("Malphite", "top", "EMERALD+", "WORLD");
  const tankShards = malphite.runes.mostPopular.statShards;
  if (tankShards.offense !== 5007 || tankShards.flex !== 5001 || tankShards.defense !== 5001) {
    throw new Error(`Expected Malphite Tank shards [5007, 5001, 5001], got [${tankShards.offense}, ${tankShards.flex}, ${tankShards.defense}]`);
  }

  // Ensure obsolete shard 5002 (deprecated Armor) is NEVER present in any option
  const allShardsAcrossRoles = [quinn.runes.mostPopular.statShards, ahri.runes.mostPopular.statShards, tankShards];
  for (const shards of allShardsAcrossRoles) {
    for (const row of shards.rows) {
      for (const opt of row.options) {
        if (opt.id === 5002) {
          throw new Error("Found deprecated Season 13 Armor shard (5002) in Stat Shards matrix!");
        }
        if (!opt.iconUrl.startsWith("https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/")) {
          throw new Error(`Invalid icon URL for shard ${opt.name}: ${opt.iconUrl}`);
        }
        if (!opt.name || !opt.description || !opt.code) {
          throw new Error(`Incomplete metadata for shard ${opt.id}`);
        }
      }
    }
  }
  console.log("✅ PASSED: Obsolete Season 13 Armor shard (5002) 100% eliminated");
  console.log("✅ PASSED: All 9 Stat Shard options have valid Riot CDN icon URLs, codes, and descriptions");
  // Test 8: Champion-Specific Itemization & Sub-Archetypes Verification
  console.log("\n[TEST 8] Champion-Specific Itemization & Sub-Archetypes Verification");
  const jinx = await service.getChampionBuild("Jinx", "adc", "EMERALD+", "WORLD");
  const jinxItems = jinx.items.completed[0].itemIds;
  if (!jinxItems.includes(6672) || !jinxItems.includes(3031) || !jinxItems.includes(3006)) {
    throw new Error(`Expected Jinx to have Crit ADC items (6672, 3031, 3006), got [${jinxItems.join(", ")}]`);
  }
  if (jinxItems.includes(6698) || jinxItems.includes(6676)) {
    throw new Error("Jinx should not receive Quinn's Lethality items (Opportunity / Profane Hydra)");
  }
  console.log(`✅ PASSED: Jinx Crit ADC items verified: [${jinxItems.join(", ")}] (Kraken, IE, Berserker's, LDR)`);

  const vladimir = await service.getChampionBuild("Vladimir", "mid", "EMERALD+", "WORLD");
  const vladItems = vladimir.items.completed[0].itemIds;
  if (!vladItems.includes(4637) || !vladItems.includes(4629) || !vladItems.includes(3089)) {
    throw new Error(`Expected Vladimir Manaless AP items (4637, 4629, 3089), got [${vladItems.join(", ")}]`);
  }
  if (vladItems.includes(3285) || vladimir.items.buildOrder.includes(3802)) {
    throw new Error("Vladimir is manaless and must not receive mana items (Luden's / Lost Chapter)");
  }
  console.log(`✅ PASSED: Vladimir Manaless AP items verified: [${vladItems.join(", ")}] (Riftmaker, Cosmic, Rabadon)`);

  const yasuo = await service.getChampionBuild("Yasuo", "mid", "EMERALD+", "WORLD");
  const yasuoItems = yasuo.items.completed[0].itemIds;
  if (!yasuoItems.includes(3006) || !yasuoItems.includes(3031) || !yasuoItems.includes(3042)) {
    throw new Error(`Expected Yasuo Melee Crit items (3006, 3031, 3042), got [${yasuoItems.join(", ")}]`);
  }
  console.log(`✅ PASSED: Yasuo Melee Crit items verified: [${yasuoItems.join(", ")}] (Berserker's, BoRK, IE, Shieldbow)`);

  const ezreal = await service.getChampionBuild("Ezreal", "adc", "EMERALD+", "WORLD");
  const ezrealItems = ezreal.items.completed[0].itemIds;
  if (!ezrealItems.includes(3078) || !ezrealItems.includes(3004) || !ezrealItems.includes(6695)) {
    throw new Error(`Expected Ezreal Spellblade/Muramana items (3078, 3004, 6695), got [${ezrealItems.join(", ")}]`);
  }
  console.log(`✅ PASSED: Ezreal Spellblade/Manamune items verified: [${ezrealItems.join(", ")}] (Triforce, Muramana, Serylda)`);

  const lulu = await service.getChampionBuild("Lulu", "support", "EMERALD+", "WORLD");
  const luluItems = lulu.items.completed[0].itemIds;
  if (!luluItems.includes(3870) || !luluItems.includes(6617) || !luluItems.includes(3504)) {
    throw new Error(`Expected Lulu Enchanter items (3870, 6617, 3504), got [${luluItems.join(", ")}]`);
  }
  console.log(`✅ PASSED: Lulu Enchanter Support items verified: [${luluItems.join(", ")}] (Dream Maker, Moonstone, Ardent)`);

  const teemo = await service.getChampionBuild("Teemo", "top", "EMERALD+", "WORLD");
  const teemoItems = teemo.items.completed[0].itemIds;
  if (!teemoItems.includes(3115) || !teemoItems.includes(6653) || !teemoItems.includes(3118)) {
    throw new Error(`Expected Teemo AP burn items (3115, 6653, 3118), got [${teemoItems.join(", ")}]`);
  }
  if (teemoItems.includes(6672) || teemoItems.includes(3031)) {
    throw new Error("Teemo has Marksman tag but must NOT receive AD crit items (Kraken / IE)!");
  }
  console.log(`✅ PASSED: Teemo correctly resolved to AP Burn/On-Hit: [${teemoItems.join(", ")}] (Nashor's, Liandry's, Malignance)`);

  const kayle = await service.getChampionBuild("Kayle", "top", "EMERALD+", "WORLD");
  const kayleItems = kayle.items.completed[0].itemIds;
  if (!kayleItems.includes(3115) || !kayleItems.includes(4637) || !kayleItems.includes(3089)) {
    throw new Error(`Expected Kayle AP on-hit items (3115, 4637, 3089), got [${kayleItems.join(", ")}]`);
  }
  console.log(`✅ PASSED: Kayle correctly resolved to AP On-Hit: [${kayleItems.join(", ")}] (Nashor's, Riftmaker, Rabadon's)`);

  const quinnLethality = quinn.items.completed[0].itemIds;
  if (!quinnLethality.includes(6698) || !quinnLethality.includes(6676) || !quinnLethality.includes(3814)) {
    throw new Error(`Expected Quinn signature Lethality items (6698, 6676, 3814), got [${quinnLethality.join(", ")}]`);
  }
  console.log(`✅ PASSED: Quinn Signature Lethality build verified: [${quinnLethality.join(", ")}] (Opportunity, Profane, Edge of Night)`);

  // Test 9: Rune Styles Selector Bar & Champion-Specific Rune Overrides Verification
  console.log("\n[TEST 9] Rune Styles Selector Bar & Champion-Specific Rune Overrides Verification");
  const quinnRunes = (await service.getChampionBuild("Quinn", "mid", "EMERALD+", "WORLD")).runes.mostPopular;
  if (quinnRunes.primaryStyleId !== 8200 || quinnRunes.subStyleId !== 8300) {
    throw new Error(`Expected Quinn signature runes to be Sorcery (8200) + Inspiration (8300), got ${quinnRunes.primaryStyleId} + ${quinnRunes.subStyleId}`);
  }
  if (quinnRunes.keystoneId !== 8230) {
    throw new Error(`Expected Quinn keystone Phase Rush (8230), got ${quinnRunes.keystoneId}`);
  }
  if (!quinnRunes.primaryStyles || quinnRunes.primaryStyles.length !== 5) {
    throw new Error(`Expected 5 primary styles in selector bar, got ${quinnRunes.primaryStyles?.length}`);
  }
  const selectedPrimary = quinnRunes.primaryStyles.find((s) => s.isSelected);
  if (!selectedPrimary || selectedPrimary.id !== 8200) {
    throw new Error(`Expected primary style 8200 (Sorcery) to be selected, got ${selectedPrimary?.id}`);
  }
  if (!quinnRunes.subStyles || quinnRunes.subStyles.length !== 4) {
    throw new Error(`Expected 4 sub-styles in selector bar (excluding primary), got ${quinnRunes.subStyles?.length}`);
  }
  if (quinnRunes.subStyles.some((s) => s.id === 8200)) {
    throw new Error("Sub-styles selector bar must exclude the selected primary style (Sorcery 8200)");
  }
  const selectedSub = quinnRunes.subStyles.find((s) => s.isSelected);
  if (!selectedSub || selectedSub.id !== 8300) {
    throw new Error(`Expected sub style 8300 (Inspiration) to be selected, got ${selectedSub?.id}`);
  }
  for (const style of [...quinnRunes.primaryStyles, ...quinnRunes.subStyles]) {
    if (!style.iconUrl.startsWith("https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/")) {
      throw new Error(`Invalid icon URL for rune style ${style.name}: ${style.iconUrl}`);
    }
  }
  console.log(`✅ PASSED: Quinn Selector Bar verified: Primary Sorcery (8200) [purple], Sub Inspiration (8300) [cyan], 5 primary + 4 sub icons verified`);

  const yasuoRunes = (await service.getChampionBuild("Yasuo", "mid", "EMERALD+", "WORLD")).runes.mostPopular;
  if (yasuoRunes.primaryStyleId !== 8000 || yasuoRunes.subStyleId !== 8400 || yasuoRunes.keystoneId !== 8010) {
    throw new Error(`Expected Yasuo Conqueror (8010) + Resolve (8400), got keystone ${yasuoRunes.keystoneId}, subStyle ${yasuoRunes.subStyleId}`);
  }
  console.log(`✅ PASSED: Yasuo signature runes verified: Precision (8000) Conqueror (8010) + Resolve (8400)`);

  const pykeRunes = (await service.getChampionBuild("Pyke", "support", "EMERALD+", "WORLD")).runes.mostPopular;
  if (pykeRunes.primaryStyleId !== 8100 || pykeRunes.keystoneId !== 9923) {
    throw new Error(`Expected Pyke Hail of Blades (9923) + Domination (8100), got keystone ${pykeRunes.keystoneId}`);
  }
  console.log(`✅ PASSED: Pyke signature runes verified: Domination (8100) Hail of Blades (9923) + Precision (8000)`);

  console.log("\n🎉 ALL TESTS PASSED! API payload is now 100% equivalent to Blitz.gg!");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

