import dotenv from "dotenv";
dotenv.config();

// League of Legends platform region codes
export type PlatformRegion = 
  | "vn2" 
  | "kr" 
  | "na1" 
  | "euw1" 
  | "eun1" 
  | "jp1" 
  | "br1" 
  | "la1" 
  | "la2" 
  | "oc1" 
  | "ph2" 
  | "sg2" 
  | "th2" 
  | "tw2"
  | "tr1"
  | "ru"
  | "me1";

// Continental routing values for Riot Account-V1 and Match-V5
export type RegionalRouting = "sea" | "asia" | "americas" | "europe";

export interface RegionConfig {
  platform: string;
  regional: string;
  displayName: string;
}

// Mapping between League Platform (per server) and Continental Regional Routing
export const REGION_MAPPING: Record<string, RegionConfig> = {
  vn2: {
    platform: "vn2.api.riotgames.com",
    regional: "sea.api.riotgames.com",
    displayName: "Vietnam",
  },
  kr: {
    platform: "kr.api.riotgames.com",
    regional: "asia.api.riotgames.com",
    displayName: "Korea",
  },
  na1: {
    platform: "na1.api.riotgames.com",
    regional: "americas.api.riotgames.com",
    displayName: "North America",
  },
  euw1: {
    platform: "euw1.api.riotgames.com",
    regional: "europe.api.riotgames.com",
    displayName: "Europe West",
  },
  eun1: {
    platform: "eun1.api.riotgames.com",
    regional: "europe.api.riotgames.com",
    displayName: "Europe Nordic & East",
  },
  jp1: {
    platform: "jp1.api.riotgames.com",
    regional: "asia.api.riotgames.com",
    displayName: "Japan",
  },
  tw2: {
    platform: "tw2.api.riotgames.com",
    regional: "sea.api.riotgames.com",
    displayName: "Taiwan",
  },
  sg2: {
    platform: "sg2.api.riotgames.com",
    regional: "sea.api.riotgames.com",
    displayName: "Singapore",
  },
  ph2: {
    platform: "ph2.api.riotgames.com",
    regional: "sea.api.riotgames.com",
    displayName: "Philippines",
  },
  th2: {
    platform: "th2.api.riotgames.com",
    regional: "sea.api.riotgames.com",
    displayName: "Thailand",
  },
  br1: {
    platform: "br1.api.riotgames.com",
    regional: "americas.api.riotgames.com",
    displayName: "Brazil",
  },
  la1: {
    platform: "la1.api.riotgames.com",
    regional: "americas.api.riotgames.com",
    displayName: "Latin America North",
  },
  la2: {
    platform: "la2.api.riotgames.com",
    regional: "americas.api.riotgames.com",
    displayName: "Latin America South",
  },
  oc1: {
    platform: "oc1.api.riotgames.com",
    regional: "sea.api.riotgames.com",
    displayName: "Oceania",
  },
  tr1: {
    platform: "tr1.api.riotgames.com",
    regional: "europe.api.riotgames.com",
    displayName: "Turkey",
  },
  ru: {
    platform: "ru.api.riotgames.com",
    regional: "europe.api.riotgames.com",
    displayName: "Russia",
  },
  me1: {
    platform: "me1.api.riotgames.com",
    regional: "europe.api.riotgames.com",
    displayName: "Middle East",
  },
};

// Redis Cache TTL configuration (in seconds)
export const CACHE_TTL = {
  PLAYER_PROFILE: 300,       // 5 minutes for dynamic summoner profile & rank
  MATCH_DETAILS: 86400 * 30, // 30 days for completed matches (immutable data)
  DDRAGON_VERSION: 86400,    // 24 hours for Data Dragon patch version
};

export const DDRAGON_BASE_URL = "https://ddragon.leagueoflegends.com";
export const DEFAULT_DDRAGON_VERSION = "16.19.1";

