import {
  RiotAccountDTO,
  RiotSummonerDTO,
  RiotLeagueEntryDTO,
  RiotMatchDTO,
  RiotChampionMasteryDTO,
  RiotApiError
} from "../types/riot.types";
import { DDRAGON_BASE_URL, DEFAULT_DDRAGON_VERSION } from "../config/riot";

export class RiotClientService {
  private get apiKey(): string {
    const key = process.env.RIOT_API_KEY?.trim() || "";
    if (!key) {
      console.warn("WARNING: RIOT_API_KEY is not configured in .env!");
    }
    return key;
  }

  // Internal HTTP client that attaches the Riot API token and handles rate limits/errors
  private async fetchRiot<T>(url: string, retries = 1): Promise<T> {
    if (!this.apiKey) {
      throw new RiotApiError(500, "RIOT_API_KEY is not configured on the server");
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Riot-Token": this.apiKey,
        "Accept": "application/json",
      },
    });

    // 1. Handle Rate Limit (HTTP 429) with Retry-After backoff
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after")) || 1;
      console.warn(`[Riot Rate Limit 429] Rate limit hit. Waiting ${retryAfter}s before retrying...`);

      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        return this.fetchRiot<T>(url, retries - 1);
      }

      throw new RiotApiError(
        429,
        `Riot API rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter
      );
    }

    // 2. Handle invalid or expired API Key (HTTP 401 / 403)
    if (response.status === 401 || response.status === 403) {
      throw new RiotApiError(
        response.status,
        "Riot API Key has expired or is invalid. Please update your API Key at developer.riotgames.com"
      );
    }

    // 3. Handle Resource Not Found (HTTP 404)
    if (response.status === 404) {
      throw new RiotApiError(404, "Player profile not found on Riot Games servers");
    }

    // 4. Handle other upstream server errors
    if (!response.ok) {
      throw new RiotApiError(
        response.status,
        `Riot Games API error: ${response.status} ${response.statusText}`
      );
    }

    return (await response.json()) as T;
  }

  //Step 1: Look up account PUUID by Riot ID (Account-V1 via Regional Host)
  async getAccountByRiotId(
    gameName: string,
    tagLine: string,
    regionalHost: string
  ): Promise<RiotAccountDTO> {
    // Note: Account-V1 is only deployed on 'asia', 'americas', and 'europe'.
    // 'sea.api.riotgames.com' is only for Match-V5 and does not host Account-V1.
    const host = regionalHost.startsWith("sea.") ? "asia.api.riotgames.com" : regionalHost;
    const encodedName = encodeURIComponent(gameName.trim());
    const encodedTag = encodeURIComponent(tagLine.trim());
    const url = `https://${host}/riot/account/v1/accounts/by-riot-id/${encodedName}/${encodedTag}`;
    return this.fetchRiot<RiotAccountDTO>(url);
  }

  //Step 2: Retrieve summoner level and icon by PUUID (Summoner-V4 via Platform Host)
  async getSummonerByPuuid(
    puuid: string,
    platformHost: string
  ): Promise<RiotSummonerDTO> {
    const url = `https://${platformHost}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    return this.fetchRiot<RiotSummonerDTO>(url);
  }

  //Step 3: Retrieve ranked tier and queue stats by PUUID (League-V4 via Platform Host)
  async getLeagueEntriesByPuuid(
    puuid: string,
    platformHost: string
  ): Promise<RiotLeagueEntryDTO[]> {
    const url = `https://${platformHost}/lol/league/v4/entries/by-puuid/${puuid}`;
    return this.fetchRiot<RiotLeagueEntryDTO[]>(url);
  }

  //Step 4: Retrieve recent match IDs by PUUID (Match-V5 via Regional Host)
  async getMatchIdsByPuuid(
    puuid: string,
    regionalHost: string,
    count = 10
  ): Promise<string[]> {
    const url = `https://${regionalHost}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
    return this.fetchRiot<string[]>(url);
  }

  //Step 5: Retrieve full match details by Match ID (Match-V5 via Regional Host)
  async getMatchById(
    matchId: string,
    regionalHost: string
  ): Promise<RiotMatchDTO> {
    const url = `https://${regionalHost}/lol/match/v5/matches/${matchId}`;
    return this.fetchRiot<RiotMatchDTO>(url);
  }

  //Step 6: Retrieve top champion masteries by PUUID (Champion-Mastery-V4 via Platform Host)
  async getTopChampionMasteries(
    puuid: string,
    platformHost: string,
    count = 4
  ): Promise<RiotChampionMasteryDTO[]> {
    const url = `https://${platformHost}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=${count}`;
    return this.fetchRiot<RiotChampionMasteryDTO[]>(url);
  }

  // Retrieve mapping of champion ID -> champion Name from Data Dragon with static fallback support
  private championMapCache: Record<string, string> | null = null;
  private readonly staticChampionFallback: Record<string, string> = {
    "799": "Ambessa",
    "897": "KSante",
    "233": "Briar",
    "901": "Smolder",
    "893": "Aurora",
    "800": "Mel",
    "122": "Darius",
    "126": "Jayce",
    "68": "Rumble",
    "266": "Aatrox",
    "517": "Sylas",
    "777": "Yone",
    "24": "Jax",
  };

  async getChampionMap(version?: string): Promise<Record<string, string>> {
    if (this.championMapCache && Object.keys(this.championMapCache).length > 100) {
      return this.championMapCache;
    }
    const resolvedVersion = version || DEFAULT_DDRAGON_VERSION;
    try {
      const res = await fetch(`${DDRAGON_BASE_URL}/cdn/${resolvedVersion}/data/en_US/champion.json`);
      if (res.ok) {
        const data = (await res.json()) as { data: Record<string, { key: string; id: string }> };
        const map: Record<string, string> = { ...this.staticChampionFallback };
        for (const champ of Object.values(data.data)) {
          map[champ.key] = champ.id;
        }
        this.championMapCache = map;
        return map;
      }
    } catch {
      // Graceful fallback to static dictionary on network interruption
    }
    return { ...this.staticChampionFallback };
  }

  //Fetch current League of Legends Data Dragon patch version from Riot CDN
  async getLatestDDragonVersion(): Promise<string> {
    try {
      const res = await fetch(`${DDRAGON_BASE_URL}/api/versions.json`);
      if (res.ok) {
        const versions = (await res.json()) as string[];
        return versions[0] || DEFAULT_DDRAGON_VERSION;
      }
    } catch {
      // Graceful fallback to default version on network interruption
    }
    return DEFAULT_DDRAGON_VERSION;
  }
}

export const riotClientService = new RiotClientService();
