import { Request, Response } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";
import prisma from "../config/database";
import redisClient from "../config/redis";
import { MailService } from "./mail.service";

export interface TokenPayload {
  id: string;
  sessionId: string;
  email?: string | null;
  username?: string | null;
}

export class SessionService {
  private static ACCESS_SECRET: Secret = process.env.JWT_ACCESS_SECRET || "blitz_jwt_access_secret_key_12345";
  private static REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET || "blitz_jwt_refresh_secret_key_12345";
  private static ACCESS_EXPIRES: SignOptions["expiresIn"] = "1d";
  private static REFRESH_EXPIRES: SignOptions["expiresIn"] = "7d";

  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.ACCESS_SECRET, { expiresIn: this.ACCESS_EXPIRES });
  }

  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.REFRESH_SECRET, { expiresIn: this.REFRESH_EXPIRES });
  }

  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.ACCESS_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  static verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.REFRESH_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  static parseDeviceInfo(req: Request) {
    const rawIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      req.ip ||
      "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "Unknown Agent";
    const deviceId =
      (req.headers["x-device-id"] as string) ||
      `${rawIp}_${Buffer.from(userAgent).toString("base64").slice(0, 16)}`;

    const parser = new UAParser(userAgent);
    const os = parser.getOS().name || "Unknown OS";
    const browserName = parser.getBrowser().name || "Unknown Browser";
    const deviceType = parser.getDevice().type || "desktop";

    const geo = geoip.lookup(rawIp);
    const country = geo?.country || "Unknown";
    const city = geo?.city || "Unknown";

    return {
      clientIp: rawIp,
      userAgent,
      deviceId,
      country,
      city,
      os,
      browserName,
      deviceType,
    };
  }

  static async createSession(
    user: { id: string; email?: string | null; username?: string | null },
    req: Request,
    res: Response
  ) {
    const { clientIp, userAgent, deviceId, country, city, os, browserName, deviceType } =
      this.parseDeviceInfo(req);

    // Detect abnormal login from another IP/location (matching requin-backend)
    const latestActiveSession = await prisma.session.findFirst({
      where: { userId: user.id, isRevoked: false },
      orderBy: { lastUsedAt: "desc" },
    });

    if (latestActiveSession) {
      const isDiffIp = latestActiveSession.ipAddress !== clientIp;
      const isDiffLocation =
        (latestActiveSession.country !== "Unknown" && latestActiveSession.country !== country) ||
        (latestActiveSession.city !== "Unknown" && latestActiveSession.city !== city);

      if (isDiffIp || isDiffLocation) {
        console.warn(
          `[SECURITY WARNING] User ${user.email || user.id} logged in from different IP/Location! ` +
          `Current: ${clientIp} (${city}, ${country}) vs Previous: ${latestActiveSession.ipAddress} ` +
          `(${latestActiveSession.city}, ${latestActiveSession.country})`
        );

        if (user.email) {
          MailService.sendLoginWarningEmail({
            email: user.email,
            ip: clientIp,
            os,
            country,
            city,
          }).catch((err) => console.warn("Failed to send login warning:", err.message));
        }
      }
    }

    const sessionId = uuidv4();
    const tokenPayload: TokenPayload = {
      id: user.id,
      sessionId,
      email: user.email,
      username: user.username,
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // Save session in DB
    await prisma.session.upsert({
      where: {
        userId_deviceId: {
          userId: user.id,
          deviceId,
        },
      },
      update: {
        id: sessionId,
        refreshToken: hashedRefreshToken,
        ipAddress: clientIp,
        userAgent,
        country,
        city,
        deviceType,
        os,
        browserName,
        isRevoked: false,
        lastUsedAt: new Date(),
      },
      create: {
        id: sessionId,
        userId: user.id,
        deviceId,
        refreshToken: hashedRefreshToken,
        ipAddress: clientIp,
        userAgent,
        country,
        city,
        deviceType,
        os,
        browserName,
        isRevoked: false,
        lastUsedAt: new Date(),
      },
    });

    // Invalidate old cache and set new user cache in Redis (TTL 15m) - exclude password
    if (redisClient.isOpen) {
      const { password, ...safeUser } = user as any;
      await redisClient.set(
        `session:${user.id}`,
        JSON.stringify({ ...safeUser, sessionId }),
        { expiration: { type: "EX", value: 900 } }
      );
    }

    // Set secure HTTP-only cookies
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("_at", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("_rt", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("_sid", sessionId, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken, refreshToken, sessionId };
  }

  static clearCookies(res: Response) {
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax" as const,
      path: "/",
    };

    res.clearCookie("_at", cookieOptions);
    res.clearCookie("_rt", cookieOptions);
    res.clearCookie("_sid", cookieOptions);
    res.clearCookie("_rc", cookieOptions);
  }

  static async revokeSession(sessionId: string, userId?: string) {
    let resolvedUserId = userId;

    if (!resolvedUserId) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { userId: true },
      });
      if (session) {
        resolvedUserId = session.userId;
      }
    }

    await prisma.session.updateMany({
      where: { id: sessionId },
      data: { isRevoked: true },
    });

    if (resolvedUserId && redisClient.isOpen) {
      await redisClient.del(`session:${resolvedUserId}`);
    }
  }

  static async revokeAllSessions(userId: string) {
    await prisma.session.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    if (redisClient.isOpen) {
      await redisClient.del(`session:${userId}`);
    }
  }
}

export default SessionService;