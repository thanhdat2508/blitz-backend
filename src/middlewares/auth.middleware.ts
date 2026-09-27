import { Request, Response, NextFunction } from "express";
import { SessionService } from "../services/session.service";
import prisma from "../config/database";
import redisClient from "../config/redis";

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  username: string | null;
  name: string | null;
  sessionId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token =
      req.cookies?._at ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      res.status(401).json({ error: "Access token is missing" });
      return;
    }

    const payload = SessionService.verifyAccessToken(token);
    if (!payload || !payload.id || !payload.sessionId) {
      res.status(401).json({ error: "Access token is invalid or expired" });
      return;
    }

    // 1. Try Redis session cache first
    const cacheKey = `session:${payload.id}`;
    if (redisClient.isOpen) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.sessionId === payload.sessionId) {
          const { password, ...safeUser } = parsed;
          req.user = safeUser;
          next();
          return;
        }
      }
    }

    // 2. Fallback to DB check
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: { user: true },
    });

    if (!session || session.isRevoked || !session.user) {
      res.status(401).json({ error: "Session has been revoked or expired" });
      return;
    }

    const authUser: AuthenticatedUser = {
      id: session.user.id,
      email: session.user.email,
      username: session.user.username,
      name: session.user.name,
      sessionId: session.id,
    };

    // Cache back to Redis
    if (redisClient.isOpen) {
      await redisClient.set(cacheKey, JSON.stringify(authUser), {
        expiration: { type: "EX", value: 900 },
      });
    }

    req.user = authUser;
    next();
  } catch (error: any) {
    res.status(500).json({ error: "Authentication failure", details: error.message });
  }
};

export const optionalAuthenticateJwt = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token =
      req.cookies?._at ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (token) {
      const payload = SessionService.verifyAccessToken(token);
      if (payload?.id && payload?.sessionId) {
        req.user = {
          id: payload.id,
          sessionId: payload.sessionId,
          email: payload.email || null,
          username: payload.username || null,
          name: null,
        };
      }
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
};

export default authenticateJwt;