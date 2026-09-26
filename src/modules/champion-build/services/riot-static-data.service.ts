import redisClient from "../../../config/redis";
import { DDRAGON_CDN, DDRAGON_VERSION } from "../constants/champion-build.constants";
import { ChampionAbilities } from "../interfaces/champion-build.interface";

export interface RiotChampionData {
  id: string;      // e.g. "Ahri", "Aatrox", "LeeSin", "Quinn"
  key: string;     // e.g. "103", "266", "64", "133"
  name: string;    // e.g. "Ahri", "Aatrox", "Quinn"
  title: string;   // e.g. "Demacia's Wings"
  tags: string[];  // e.g. ["Marksman", "Assassin"]
  partype: string; // e.g. "Mana"
}

interface RiotDDragonListResponse {
  type: string;
  format: string;
  version: string;
  data: Record<string, RiotChampionData>;
}

interface RiotSpellDetail {
  id: string;
  name: string;
  description: string;
  image: { full: string };
}

interface RiotPassiveDetail {
  name: string;
  description: string;
  image: { full: string };
}

interface RiotChampionDetailResponse {
  data: Record<
    string,
    {
      id: string;
      name: string;
      title: string;
      spells: RiotSpellDetail[];
      passive: RiotPassiveDetail;
    }
  >;
}

export class RiotStaticDataService {
  private static readonly CACHE_TTL_SECONDS = 86400; // 24 hours
  private static readonly IN_MEMORY_CACHE = new Map<string, RiotChampionData>();
  private static readonly IN_MEMORY_ABILITIES_CACHE = new Map<string, ChampionAbilities>();
  private static isInitialized = false;
  private static initPromise: Promise<void> | null = null;

  private normalizePatch(patch: string): string {
    if (!patch || patch === "latest") return DDRAGON_VERSION;
    const parts = patch.trim().split(".");
    if (parts.length === 2) {
      return `${parts[0]}.${parts[1]}.1`;
    }
    return patch.trim();
  }

  private normalizeChampionKey(rawKey: string): string {
    const cleaned = rawKey.toLowerCase().replace(/[^a-z0-9]/g, "");
    const aliases: Record<string, string> = {
      wukong: "monkeyking",
      renataglasc: "renata",
      nunuwillump: "nunu",
    };
    return aliases[cleaned] || cleaned;
  }

  public getCurrentPatch(): string {
    return DDRAGON_VERSION;
  }

  public async getChampion(championKey: string, patch = DDRAGON_VERSION): Promise<RiotChampionData | null> {
    const semverPatch = this.normalizePatch(patch);
    await this.ensureInitialized(semverPatch);

    const normalized = this.normalizeChampionKey(championKey);
    return RiotStaticDataService.IN_MEMORY_CACHE.get(normalized) || null;
  }

  public async getAllChampions(patch = DDRAGON_VERSION): Promise<RiotChampionData[]> {
    const semverPatch = this.normalizePatch(patch);
    await this.ensureInitialized(semverPatch);
    const uniqueMap = new Map<string, RiotChampionData>();
    for (const champ of RiotStaticDataService.IN_MEMORY_CACHE.values()) {
      uniqueMap.set(champ.id, champ);
    }
    return Array.from(uniqueMap.values());
  }

  public async getChampionAbilities(
    championId: string,
    patch = DDRAGON_VERSION
  ): Promise<ChampionAbilities> {
    const semverPatch = this.normalizePatch(patch);
    const normalized = this.normalizeChampionKey(championId);

    // 1. Check in-memory
    const memoryHit = RiotStaticDataService.IN_MEMORY_ABILITIES_CACHE.get(normalized);
    if (memoryHit) return memoryHit;

    const cacheKey = `lol:ddragon:abilities:${semverPatch}:${normalized}`;

    // 2. Check Redis
    try {
      if (redisClient.isOpen) {
        const raw = await redisClient.get(cacheKey);
        if (raw) {
          const parsed = JSON.parse(raw) as ChampionAbilities;
          RiotStaticDataService.IN_MEMORY_ABILITIES_CACHE.set(normalized, parsed);
          return parsed;
        }
      }
    } catch (err) {
      console.warn("[RiotStaticDataService] Redis read failed for abilities:", err);
    }

    // 3. Fetch champion detail from DDragon
    try {
      const url = `https://ddragon.leagueoflegends.com/cdn/${semverPatch}/data/en_US/champion/${championId}.json`;
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const json = (await response.json()) as RiotChampionDetailResponse;
        const champDetail = json.data[championId] || Object.values(json.data)[0];

        if (champDetail && champDetail.spells && champDetail.spells.length >= 4) {
          const abilities: ChampionAbilities = {
            passive: {
              key: "P",
              name: champDetail.passive.name,
              description: champDetail.passive.description,
              iconUrl: `${DDRAGON_CDN}/img/passive/${champDetail.passive.image.full}`,
            },
            q: {
              key: "Q",
              name: champDetail.spells[0].name,
              description: champDetail.spells[0].description,
              iconUrl: `${DDRAGON_CDN}/img/spell/${champDetail.spells[0].image.full}`,
            },
            w: {
              key: "W",
              name: champDetail.spells[1].name,
              description: champDetail.spells[1].description,
              iconUrl: `${DDRAGON_CDN}/img/spell/${champDetail.spells[1].image.full}`,
            },
            e: {
              key: "E",
              name: champDetail.spells[2].name,
              description: champDetail.spells[2].description,
              iconUrl: `${DDRAGON_CDN}/img/spell/${champDetail.spells[2].image.full}`,
            },
            r: {
              key: "R",
              name: champDetail.spells[3].name,
              description: champDetail.spells[3].description,
              iconUrl: `${DDRAGON_CDN}/img/spell/${champDetail.spells[3].image.full}`,
            },
          };

          RiotStaticDataService.IN_MEMORY_ABILITIES_CACHE.set(normalized, abilities);

          if (redisClient.isOpen) {
            await redisClient.set(cacheKey, JSON.stringify(abilities), {
              EX: RiotStaticDataService.CACHE_TTL_SECONDS,
            });
          }

          return abilities;
        }
      }
    } catch (err) {
      console.warn(`[RiotStaticDataService] DDragon fetch failed for ${championId} abilities:`, err);
    }

    // 4. Fallback abilities generator
    const fallback = this.generateFallbackAbilities(championId);
    RiotStaticDataService.IN_MEMORY_ABILITIES_CACHE.set(normalized, fallback);
    return fallback;
  }

  private generateFallbackAbilities(championId: string): ChampionAbilities {
    const formatted = championId.charAt(0).toUpperCase() + championId.slice(1);
    if (formatted.toLowerCase() === "quinn") {
      return {
        passive: {
          key: "P",
          name: "Harrier",
          description: "Valor periodically marks nearby enemies as Vulnerable.",
          iconUrl: `${DDRAGON_CDN}/img/passive/Quinn_Passive.png`,
        },
        q: {
          key: "Q",
          name: "Blinding Assault",
          description: "Valor flies in a line, dealing damage and nearsighting the first enemy hit.",
          iconUrl: `${DDRAGON_CDN}/img/spell/QuinnQ.png`,
        },
        w: {
          key: "W",
          name: "Heightened Senses",
          description: "Passively grants attack speed and movement speed upon attacking Vulnerable targets. Actively reveals surrounding area.",
          iconUrl: `${DDRAGON_CDN}/img/spell/QuinnW.png`,
        },
        e: {
          key: "E",
          name: "Vault",
          description: "Quinn dashes to an enemy, knocking them back, marking them as Vulnerable, and leaping away.",
          iconUrl: `${DDRAGON_CDN}/img/spell/QuinnE.png`,
        },
        r: {
          key: "R",
          name: "Behind Enemy Lines",
          description: "Quinn and Valor unite to fly around the map at immense movement speed.",
          iconUrl: `${DDRAGON_CDN}/img/spell/QuinnR.png`,
        },
      };
    }

    return {
      passive: {
        key: "P",
        name: `${formatted} Passive`,
        description: `Innate passive ability of ${formatted}.`,
        iconUrl: `${DDRAGON_CDN}/img/passive/${formatted}_P.png`,
      },
      q: {
        key: "Q",
        name: `${formatted} Q Ability`,
        description: `Primary Q skill of ${formatted}.`,
        iconUrl: `${DDRAGON_CDN}/img/spell/${formatted}Q.png`,
      },
      w: {
        key: "W",
        name: `${formatted} W Ability`,
        description: `Secondary W skill of ${formatted}.`,
        iconUrl: `${DDRAGON_CDN}/img/spell/${formatted}W.png`,
      },
      e: {
        key: "E",
        name: `${formatted} E Ability`,
        description: `Mobility or utility E skill of ${formatted}.`,
        iconUrl: `${DDRAGON_CDN}/img/spell/${formatted}E.png`,
      },
      r: {
        key: "R",
        name: `${formatted} Ultimate`,
        description: `Ultimate R ability of ${formatted}.`,
        iconUrl: `${DDRAGON_CDN}/img/spell/${formatted}R.png`,
      },
    };
  }

  private async ensureInitialized(patch: string): Promise<void> {
    if (RiotStaticDataService.isInitialized && RiotStaticDataService.IN_MEMORY_CACHE.size > 0) {
      return;
    }

    if (RiotStaticDataService.initPromise) {
      return RiotStaticDataService.initPromise;
    }

    RiotStaticDataService.initPromise = (async () => {
      const cacheKey = `lol:ddragon:champions:${patch}`;

      // 1. Try Redis Cache
      try {
        if (redisClient.isOpen) {
          const raw = await redisClient.get(cacheKey);
          if (raw) {
            const parsed = JSON.parse(raw) as Record<string, RiotChampionData>;
            this.populateMemoryCache(parsed);
            RiotStaticDataService.isInitialized = true;
            return;
          }
        }
      } catch (err) {
        console.warn("[RiotStaticDataService] Redis read failed:", err);
      }

      // 2. Fetch from Riot Data Dragon CDN
      try {
        const url = `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`;
        const response = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) {
          throw new Error(`DDragon HTTP error: ${response.status}`);
        }

        const json = (await response.json()) as RiotDDragonListResponse;
        this.populateMemoryCache(json.data);
        RiotStaticDataService.isInitialized = true;

        // Save to Redis
        if (redisClient.isOpen) {
          await redisClient.set(cacheKey, JSON.stringify(json.data), {
            EX: RiotStaticDataService.CACHE_TTL_SECONDS,
          });
        }
        return;
      } catch (fetchErr) {
        console.warn("[RiotStaticDataService] DDragon fetch failed, using fallback catalogue:", fetchErr);
      }

      // 3. Fallback to bundled catalogue if network is restricted
      this.populateMemoryCache(FALLBACK_CHAMPIONS);
      RiotStaticDataService.isInitialized = true;
    })().finally(() => {
      RiotStaticDataService.initPromise = null;
    });

    return RiotStaticDataService.initPromise;
  }

  private populateMemoryCache(data: Record<string, RiotChampionData>): void {
    for (const champ of Object.values(data)) {
      const normalizedId = champ.id.toLowerCase().replace(/[^a-z0-9]/g, "");
      const normalizedName = champ.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      RiotStaticDataService.IN_MEMORY_CACHE.set(normalizedId, champ);
      RiotStaticDataService.IN_MEMORY_CACHE.set(normalizedName, champ);
    }
  }
}

export const riotStaticDataService = new RiotStaticDataService();

const FALLBACK_CHAMPIONS: Record<string, RiotChampionData> = {
  Quinn: { id: "Quinn", key: "133", name: "Quinn", title: "Demacia's Wings", tags: ["Marksman", "Assassin"], partype: "Mana" },
  Ahri: { id: "Ahri", key: "103", name: "Ahri", title: "the Nine-Tailed Fox", tags: ["Mage", "Assassin"], partype: "Mana" },
  Aatrox: { id: "Aatrox", key: "266", name: "Aatrox", title: "the Darkin Blade", tags: ["Fighter", "Tank"], partype: "Blood Well" },
  LeeSin: { id: "LeeSin", key: "64", name: "Lee Sin", title: "the Blind Monk", tags: ["Fighter", "Assassin"], partype: "Energy" },
  Yasuo: { id: "Yasuo", key: "157", name: "Yasuo", title: "the Unforgiven", tags: ["Fighter", "Assassin"], partype: "Flow" },
  Yone: { id: "Yone", key: "777", name: "Yone", title: "the Unforgotten", tags: ["Assassin", "Fighter"], partype: "Soul" },
  Zed: { id: "Zed", key: "238", name: "Zed", title: "the Master of Shadows", tags: ["Assassin"], partype: "Energy" },
  Jinx: { id: "Jinx", key: "222", name: "Jinx", title: "the Loose Cannon", tags: ["Marksman"], partype: "Mana" },
  Thresh: { id: "Thresh", key: "412", name: "Thresh", title: "the Chain Warden", tags: ["Support", "Fighter"], partype: "Mana" },
  Lux: { id: "Lux", key: "99", name: "Lux", title: "the Lady of Luminosity", tags: ["Mage", "Support"], partype: "Mana" },
  Syndra: { id: "Syndra", key: "134", name: "Syndra", title: "the Dark Sovereign", tags: ["Mage"], partype: "Mana" },
  Malzahar: { id: "Malzahar", key: "90", name: "Malzahar", title: "the Prophet of the Void", tags: ["Mage", "Assassin"], partype: "Mana" },
  Kaisa: { id: "Kaisa", key: "145", name: "Kai'Sa", title: "Daughter of the Void", tags: ["Marksman", "Assassin"], partype: "Mana" },
};
