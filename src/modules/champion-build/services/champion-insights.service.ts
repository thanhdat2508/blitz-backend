import {
  ChampionAbilities,
  ChampionInsights,
  InsightItem,
} from "../interfaces/champion-build.interface";
import { ChampionClass } from "../constants/champion-build.constants";
import {
  COMMON_OPPONENT_TIPS,
  CURATED_CHAMPION_INSIGHTS,
} from "../data/champion-insights.data";
import { ChampionGameplayTips } from "./riot-static-data.service";

export class ChampionInsightsService {
  private static extractAbilityKeys(text: string): ("P" | "Q" | "W" | "E" | "R")[] {
    const matches = text.match(/\[([PQWER])\]/g);
    if (!matches) return [];
    const keys = matches.map((m) => m.replace(/\[|\]/g, "") as "P" | "Q" | "W" | "E" | "R");
    return Array.from(new Set(keys));
  }

  private static toStructuredItems(
    lines: string[],
    targetChampionKey?: string
  ): InsightItem[] {
    return lines.map((text) => ({
      text,
      abilityKeys: ChampionInsightsService.extractAbilityKeys(text),
      targetChampionKey,
    }));
  }

  private static cleanAndInjectAbilityTokens(
    text: string,
    abilities: ChampionAbilities
  ): string {
    let cleaned = text
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Replace ability names with tokens if not already tagged
    const abilityMappings: Array<{ key: "P" | "Q" | "W" | "E" | "R"; name?: string }> = [
      { key: "P", name: abilities.passive?.name },
      { key: "Q", name: abilities.q?.name },
      { key: "W", name: abilities.w?.name },
      { key: "E", name: abilities.e?.name },
      { key: "R", name: abilities.r?.name },
    ];

    for (const mapping of abilityMappings) {
      if (mapping.name && mapping.name.length > 2 && !cleaned.includes(`[${mapping.key}]`)) {
        const regex = new RegExp(`\\b${mapping.name}\\b`, "i");
        cleaned = cleaned.replace(regex, `[${mapping.key}] ${mapping.name}`);
      }
    }

    return cleaned;
  }

  public generateInsights(
    championKey: string,
    championName: string,
    primaryClass: ChampionClass,
    abilities: ChampionAbilities,
    partype?: string,
    opponentKey?: string,
    gameplayTips?: ChampionGameplayTips
  ): ChampionInsights {
    const curated = CURATED_CHAMPION_INSIGHTS[championKey];

    let general: string[];
    let strengths: string[];
    let weaknesses: string[];

    if (curated) {
      general = [...curated.general];
      strengths = [...curated.strengths];
      weaknesses = [...curated.weaknesses];

      // Inject matchup-specific tips if opponent is known and not already present
      if (opponentKey) {
        const specificMatchupTips = curated.matchupTipsAgainstOpponent?.[opponentKey];
        const commonOpponentTips = COMMON_OPPONENT_TIPS[opponentKey];
        const tipsToAdd = (specificMatchupTips || commonOpponentTips || []).filter(
          (tip) => !general.includes(tip)
        );
        if (tipsToAdd.length > 0) {
          general.unshift(...tipsToAdd);
        }
      }
    } else if (
      gameplayTips &&
      (gameplayTips.allytips.length > 0 || gameplayTips.enemytips.length > 0)
    ) {
      // Dynamic synthesis from Riot Games official champion gameplay tips
      const processedAllyTips = gameplayTips.allytips
        .map((tip) => ChampionInsightsService.cleanAndInjectAbilityTokens(tip, abilities))
        .filter((tip) => tip.length > 10);

      const processedEnemyTips = gameplayTips.enemytips
        .map((tip) => ChampionInsightsService.cleanAndInjectAbilityTokens(tip, abilities))
        .filter((tip) => tip.length > 10);

      // Key Insights
      general = [...processedAllyTips.slice(0, 3)];
      if (general.length === 0) {
        general.push(
          `[P] ${abilities.passive?.name || "Passive"} provides unique scaling and utility throughout trades.`,
          `[Q] ${abilities.q?.name || "Q"} serves as the primary combat tool; optimal cooldown tracking is essential.`,
          `[R] ${abilities.r?.name || "R"} creates decisive teamfight influence when coordinated with teammates.`
        );
      }

      // Check for long-cooldown abilities (e.g. W or E >= 18s at rank 1)
      const wCdFirst = parseInt((gameplayTips.spellsCooldowns.W || "0").split("/")[0], 10);
      const eCdFirst = parseInt((gameplayTips.spellsCooldowns.E || "0").split("/")[0], 10);

      weaknesses = [...processedEnemyTips.slice(0, 2)];
      if (wCdFirst >= 18) {
        weaknesses.push(
          `[W] has a high cooldown of ${wCdFirst} seconds at rank 1. Once used, ${championName} can be punished.`
        );
      } else if (eCdFirst >= 18) {
        weaknesses.push(
          `[E] has a high cooldown of ${eCdFirst} seconds at rank 1. Once used, ${championName} can be punished.`
        );
      } else {
        const resourceText =
          partype === "Mana"
            ? "High early-game mana costs necessitate deliberate ability pacing."
            : "Precision cooldown management is required to avoid vulnerability windows.";
        weaknesses.push(resourceText);
      }

      // Strengths
      strengths = [
        `High burst and trading synergy when chaining [Q] into [E].`,
        `Excellent power curve with core ${primaryClass} items amplifying key stats.`,
        `Can proc [P] effectively during skirmishes to gain combat superiority.`,
        `Strong map presence and lane pressure when [R] is available.`,
      ];

      // Inject opponent tip if present
      if (opponentKey && COMMON_OPPONENT_TIPS[opponentKey]) {
        const oppTips = COMMON_OPPONENT_TIPS[opponentKey].filter((tip) => !general.includes(tip));
        if (oppTips.length > 0) {
          general.unshift(...oppTips);
        }
      }
    } else {
      // Dynamic ability-aware fallback for any League champion without raw tips
      const pName = abilities.passive?.name || "Passive";
      const qName = abilities.q?.name || "Q";
      const wName = abilities.w?.name || "W";
      const eName = abilities.e?.name || "E";
      const rName = abilities.r?.name || "R";

      general = [
        `[P] ${pName} provides unique scaling and utility throughout lane trades.`,
        `[Q] ${qName} serves as the primary combat tool; optimal cooldown tracking is essential.`,
        `[R] ${rName} creates decisive teamfight influence when coordinated with teammates.`,
      ];

      // Inject opponent tip if present
      if (opponentKey && COMMON_OPPONENT_TIPS[opponentKey]) {
        general.unshift(...COMMON_OPPONENT_TIPS[opponentKey]);
      }

      strengths = [
        `High burst and trading synergy when chaining [Q] into [E].`,
        `Excellent power curve with core ${primaryClass} items amplifying key stats.`,
        `Can proc [P] effectively during skirmishes to gain combat superiority.`,
        `Strong map presence and lane pressure when [R] is available.`,
      ];

      const resourceText =
        partype === "Mana"
          ? "High early-game mana costs necessitate deliberate ability pacing."
          : "Precision cooldown management is required to avoid vulnerability windows.";

      weaknesses = [
        `Vulnerable to focused engagements when [W] defensive utility is on cooldown.`,
        resourceText,
        `Positioning errors during teamfights can be quickly punished by heavy crowd control.`,
      ];
    }

    return {
      general,
      strengths,
      weaknesses,
      structured: {
        general: ChampionInsightsService.toStructuredItems(general, opponentKey),
        strengths: ChampionInsightsService.toStructuredItems(strengths),
        weaknesses: ChampionInsightsService.toStructuredItems(weaknesses),
      },
    };
  }
}

export const championInsightsService = new ChampionInsightsService();
