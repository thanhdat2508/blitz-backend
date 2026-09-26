import prisma from "../config/database";

export interface GoogleProfile {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface RiotProfile {
  puuid: string;
  gameName?: string;
  tagLine?: string;
  email?: string;
}

export class OAuthService {
  // ================= GOOGLE =================
  static getGoogleAuthUrl(): string {
    const clientId = process.env.GOOGLE_CLIENT_ID || "";
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback";
    const scope = encodeURIComponent("openid email profile");

    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  }

  static async exchangeGoogleCode(code: string): Promise<GoogleProfile> {
    const clientId = process.env.GOOGLE_CLIENT_ID || "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback";

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Google token exchange failed: ${err}`);
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };

    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      throw new Error("Failed to fetch Google userinfo");
    }

    const userData = (await userRes.json()) as any;
    return {
      sub: userData.sub,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
    };
  }

  static async handleGoogleLogin(profile: GoogleProfile) {
    // 1. Search by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: profile.sub }, { email: profile.email }],
      },
    });

    if (user) {
      // Update googleId & login method
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.sub,
          avatarUrl: profile.picture || user.avatarUrl,
          lastLoginMethod: "GOOGLE",
          isEmailVerified: true,
        },
      });
    } else {
      // 2. Create new user
      const baseUsername = profile.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
      const username = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

      user = await prisma.user.create({
        data: {
          email: profile.email,
          googleId: profile.sub,
          name: profile.name || baseUsername,
          username,
          avatarUrl: profile.picture,
          isEmailVerified: true,
          lastLoginMethod: "GOOGLE",
        },
      });
    }

    return user;
  }

  // ================= RIOT GAMES =================
  static getRiotAuthUrl(): string {
    const clientId = process.env.RIOT_CLIENT_ID || "";
    const redirectUri = process.env.RIOT_CALLBACK_URL || "http://localhost:3000/api/auth/riot/callback";

    return `https://auth.riotgames.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20cpid`;
  }

  static async exchangeRiotCode(code: string): Promise<RiotProfile> {
    const clientId = process.env.RIOT_CLIENT_ID || "";
    const clientSecret = process.env.RIOT_CLIENT_SECRET || "";
    const redirectUri = process.env.RIOT_CALLBACK_URL || "http://localhost:3000/api/auth/riot/callback";

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const tokenRes = await fetch("https://auth.riotgames.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Riot token exchange failed: ${err}`);
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };

    const userRes = await fetch("https://auth.riotgames.com/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      throw new Error("Failed to fetch Riot userinfo");
    }

    const data = (await userRes.json()) as any;
    return {
      puuid: data.sub,
      gameName: data.acct?.game_name,
      tagLine: data.acct?.tag_line,
      email: data.email,
    };
  }

  static async handleRiotLogin(profile: RiotProfile) {
    let user = await prisma.user.findUnique({
      where: { riotPuuid: profile.puuid },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          riotGameName: profile.gameName || user.riotGameName,
          riotTagLine: profile.tagLine || user.riotTagLine,
          lastLoginMethod: "RIOT",
        },
      });
    } else {
      const riotName = profile.gameName
        ? `${profile.gameName}#${profile.tagLine || "RIOT"}`
        : `riot_${profile.puuid.slice(0, 8)}`;

      const sanitizedUsername = riotName.toLowerCase().replace(/[^a-z0-9_#]/g, "");

      user = await prisma.user.create({
        data: {
          riotPuuid: profile.puuid,
          riotGameName: profile.gameName,
          riotTagLine: profile.tagLine,
          username: sanitizedUsername,
          name: profile.gameName || "Riot Player",
          email: profile.email || `${profile.puuid.slice(0, 12)}@riot.internal`,
          isEmailVerified: true,
          lastLoginMethod: "RIOT",
        },
      });
    }

    return user;
  }
}

export default OAuthService;