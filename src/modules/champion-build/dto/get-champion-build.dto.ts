import { Role, Tier } from "../interfaces/champion-build.interface";

export const VALID_ROLES: readonly Role[] = [
  "top",
  "jungle",
  "mid",
  "adc",
  "support",
] as const;

export const VALID_TIERS: readonly Tier[] = [
  "ALL",
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD+",
  "DIAMOND+",
  "MASTER+",
] as const;

export interface GetChampionBuildQueryInput {
  tier?: string;
  region?: string;
  patch?: string;
}

export interface GetChampionBuildParamsInput {
  champion?: string;
  role?: string;
}

export interface ValidatedChampionBuildRequest {
  champion: string;
  role: Role;
  tier: Tier;
  region: string;
  patch: string;
}

export class ChampionBuildValidator {
  private static readonly DEFAULT_TIER: Tier = "EMERALD+";
  private static readonly DEFAULT_REGION = "WORLD";
  private static readonly DEFAULT_PATCH = "14.24";

  public static validate(
    params: GetChampionBuildParamsInput,
    query: GetChampionBuildQueryInput
  ): ValidatedChampionBuildRequest {
    const rawChampion = params.champion?.trim();
    if (!rawChampion) {
      throw new BadRequestException("Champion parameter is required and cannot be empty.");
    }

    // Whitelist champion name format (alphanumeric, spaces, apostrophes, hyphens, and ampersands)
    if (!/^[a-zA-Z0-9' .&_-]+$/.test(rawChampion)) {
      throw new BadRequestException("Invalid champion name format.");
    }

    const rawRole = (params.role?.trim().toLowerCase() || "mid") as Role;
    if (!VALID_ROLES.includes(rawRole)) {
      throw new BadRequestException(
        `Invalid role '${params.role}'. Must be one of: ${VALID_ROLES.join(", ")}`
      );
    }

    let tier: Tier = this.DEFAULT_TIER;
    if (query.tier) {
      const normalizedTier = query.tier.trim().toUpperCase() as Tier;
      if (!VALID_TIERS.includes(normalizedTier)) {
        throw new BadRequestException(
          `Invalid tier '${query.tier}'. Allowed tiers: ${VALID_TIERS.join(", ")}`
        );
      }
      tier = normalizedTier;
    }

    let region = this.DEFAULT_REGION;
    if (query.region) {
      const normalizedRegion = query.region.trim().toUpperCase();
      if (!/^[a-zA-Z0-9_]{2,10}$/.test(normalizedRegion)) {
        throw new BadRequestException("Invalid region format.");
      }
      region = normalizedRegion;
    }

    let patch = this.DEFAULT_PATCH;
    if (query.patch) {
      const normalizedPatch = query.patch.trim();
      if (!/^([0-9]+(\.[0-9]+)*|latest)$/.test(normalizedPatch)) {
        throw new BadRequestException("Invalid patch format.");
      }
      patch = normalizedPatch;
    }

    return {
      champion: rawChampion,
      role: rawRole,
      tier,
      region,
      patch,
    };
  }
}

export class BadRequestException extends Error {
  public readonly statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = "BadRequestException";
  }
}
