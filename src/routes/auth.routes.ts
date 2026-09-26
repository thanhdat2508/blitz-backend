import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../config/database";
import { hashPassword, comparePassword } from "../utils/hash";
import OtpService from "../services/otp.service";
import SessionService from "../services/session.service";
import OAuthService from "../services/oauth.service";
import authenticateJwt from "../middlewares/auth.middleware";

const router = Router();

const setRecoveryCookie = (res: Response, recoveryCode: string) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("_rc", recoveryCode, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 10 * 60 * 1000, // 10 minutes
    path: "/",
  });
};

// ==========================================
// 1. SIGN UP (Email & Password + OTP)
// ==========================================

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const recoveryCode = uuidv4();

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        res.status(409).json({ error: "An account with this email already exists" });
        return;
      }

      // User exists but hasn't verified: update password and resend OTP
      const hashedPassword = await hashPassword(password);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          name: name || existingUser.name,
        },
      });

      const otpResult = await OtpService.sendRegisterOtp(normalizedEmail, recoveryCode);
      setRecoveryCookie(res, recoveryCode);

      res.status(200).json({
        message: "Account exists but is unverified. A new verification OTP has been sent.",
        email: normalizedEmail,
        recoveryCode,
        devOtp: otpResult.code,
      });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const baseUsername = normalizedEmail.split("@")[0].replace(/[^a-z0-9_]/g, "");
    const username = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name || baseUsername,
        username,
        isEmailVerified: false,
        lastLoginMethod: "LOCAL",
      },
    });

    const otpResult = await OtpService.sendRegisterOtp(newUser.email!, recoveryCode);
    setRecoveryCookie(res, recoveryCode);

    res.status(201).json({
      message: "Registration successful. Please verify the OTP sent to your email.",
      userId: newUser.id,
      email: newUser.email,
      recoveryCode,
      devOtp: otpResult.code,
    });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
});

// Verify OTP for registration
router.post("/verify", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otpCode, recoveryCode: bodyRecoveryCode } = req.body;
    const recoveryCode = bodyRecoveryCode || req.cookies?._rc;

    if (!email || !otpCode) {
      res.status(400).json({ error: "Email and OTP code are required" });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const verifyResult = await OtpService.verifyRegisterOtp(
      normalizedEmail,
      String(otpCode).trim(),
      recoveryCode
    );

    if (!verifyResult.valid) {
      res.status(400).json({ error: verifyResult.message || "Invalid OTP code" });
      return;
    }

    const user = await prisma.user.update({
      where: { email: normalizedEmail },
      data: { isEmailVerified: true },
    });

    // Auto-login upon successful verification
    await SessionService.createSession(user, req, res);

    // Clear recovery cookie
    res.clearCookie("_rc", { path: "/" });

    res.status(200).json({
      message: "Email verified successfully. You are now logged in.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error: any) {
    console.error("Verify error:", error);
    res.status(500).json({ error: "Verification failed", details: error.message });
  }
});

// Resend OTP for registration (supports both /resend-otp and /resend/otp-register)
const handleResendRegisterOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ error: "Email is already verified" });
      return;
    }

    const recoveryCode = uuidv4();
    const otpResult = await OtpService.sendRegisterOtp(user.email!, recoveryCode);
    setRecoveryCookie(res, recoveryCode);

    res.status(200).json({
      message: "OTP code resent successfully",
      recoveryCode,
      devOtp: otpResult.code,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to resend OTP", details: error.message });
  }
};

router.post("/resend-otp", handleResendRegisterOtp);
router.post("/resend/otp-register", handleResendRegisterOtp);

// ==========================================
// 2. SIGN IN (Email & Password)
// ==========================================

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || !user.password) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    if (!user.isEmailVerified) {
      res.status(403).json({
        error: "Your email has not been verified. Please verify your OTP before logging in.",
        isEmailVerified: false,
      });
      return;
    }

    await SessionService.createSession(user, req, res);

    res.status(200).json({
      message: "Logged in successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        lastLoginMethod: user.lastLoginMethod,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});

// ==========================================
// 3. GOOGLE OAUTH2
// ==========================================

router.get("/google", (_req: Request, res: Response): void => {
  const authUrl = OAuthService.getGoogleAuthUrl();
  res.redirect(authUrl);
});

router.get("/google/callback", async (req: Request, res: Response): Promise<void> => {
  try {
    const code = req.query.code as string;
    if (!code) {
      res.status(400).json({ error: "Missing authorization code from Google" });
      return;
    }

    const profile = await OAuthService.exchangeGoogleCode(code);
    const user = await OAuthService.handleGoogleLogin(profile);

    await SessionService.createSession(user, req, res);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/auth/callback?provider=google`);
  } catch (error: any) {
    console.error("Google OAuth error:", error);
    res.status(500).json({ error: "Google authentication failed", details: error.message });
  }
});

// ==========================================
// 4. RIOT GAMES OAUTH2 (RSO)
// ==========================================

router.get("/riot", (_req: Request, res: Response): void => {
  const authUrl = OAuthService.getRiotAuthUrl();
  res.redirect(authUrl);
});

router.get("/riot/callback", async (req: Request, res: Response): Promise<void> => {
  try {
    const code = req.query.code as string;
    if (!code) {
      res.status(400).json({ error: "Missing authorization code from Riot Games" });
      return;
    }

    const profile = await OAuthService.exchangeRiotCode(code);
    const user = await OAuthService.handleRiotLogin(profile);

    await SessionService.createSession(user, req, res);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/auth/callback?provider=riot`);
  } catch (error: any) {
    console.error("Riot OAuth error:", error);
    res.status(500).json({ error: "Riot authentication failed", details: error.message });
  }
});

// ==========================================
// 5. SESSION MANAGEMENT & LOGOUT
// ==========================================

// Validate current access token (matches requin-backend /auth/validate)
router.post("/validate", async (req: Request, res: Response): Promise<void> => {
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

    res.status(200).json({ message: "Access token is valid", user: payload });
  } catch (error: any) {
    res.status(500).json({ error: "Token validation failed", details: error.message });
  }
});

router.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?._rt;
    if (!refreshToken) {
      res.status(401).json({ error: "Refresh token is missing" });
      return;
    }

    const payload = SessionService.verifyRefreshToken(refreshToken);
    if (!payload || !payload.id || !payload.sessionId) {
      SessionService.clearCookies(res);
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: { user: true },
    });

    if (!session || session.isRevoked || !session.user) {
      SessionService.clearCookies(res);
      res.status(401).json({ error: "Session has been revoked" });
      return;
    }

    await SessionService.createSession(session.user, req, res);

    res.status(200).json({ message: "Session refreshed successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Token refresh failed", details: error.message });
  }
});

// Logout endpoint with support for isLogoutAll or target sessionId
router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  try {
    const { isLogoutAll, sessionId: targetSessionId } = req.body || {};
    const cookieSessionId = req.cookies?._sid;
    const at = req.cookies?._at || req.headers.authorization?.replace(/^Bearer\s+/i, "");
    let userId = "";

    if (at) {
      const payload = SessionService.verifyAccessToken(at);
      if (payload?.id) userId = payload.id;
    }

    // Fallback: lookup userId from session in DB if not available in accessToken
    if (!userId && (cookieSessionId || targetSessionId)) {
      const sid = targetSessionId || cookieSessionId;
      const foundSession = await prisma.session.findUnique({
        where: { id: sid },
        select: { userId: true },
      });
      if (foundSession) {
        userId = foundSession.userId;
      }
    }

    const shouldLogoutAll =
      String(isLogoutAll).toLowerCase() === "true" || isLogoutAll === true;

    if (shouldLogoutAll && userId) {
      await SessionService.revokeAllSessions(userId);
    } else if (targetSessionId) {
      await SessionService.revokeSession(targetSessionId, userId);
    } else if (cookieSessionId) {
      await SessionService.revokeSession(cookieSessionId, userId);
    }

    SessionService.clearCookies(res);

    res.status(200).json({
      message: shouldLogoutAll
        ? "Logout from all sessions successful"
        : "User logged out successfully",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    SessionService.clearCookies(res);
    res.status(500).json({ error: "Logout failed", details: error.message });
  }
});

// ==========================================
// 6. FORGOT & RESET PASSWORD FLOW
// ==========================================

// Step 6.1: Request password reset (sends OTP, returns recoveryCode and sets _rc cookie)
router.post("/reset-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    const recoveryCode = uuidv4();

    if (!user) {
      // Safe response matching requin-backend
      res.status(200).json({
        message: "You'll receive an email if an account associated with the email address exists",
      });
      return;
    }

    const otpResult = await OtpService.sendForgotPasswordOtp(normalizedEmail, recoveryCode);
    setRecoveryCookie(res, recoveryCode);

    res.status(200).json({
      message: "Password reset email sent successfully",
      recoveryCode,
      devOtp: otpResult.code,
    });
  } catch (error: any) {
    console.error("Reset password request error:", error);
    res.status(500).json({ error: "Failed to request password reset", details: error.message });
  }
});

// Step 6.2: Verify OTP for reset password
router.post("/reset-password/verify", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otpCode, recoveryCode: bodyRecoveryCode } = req.body;
    const recoveryCode = bodyRecoveryCode || req.cookies?._rc;

    if (!email || !otpCode) {
      res.status(400).json({ error: "Email and OTP code are required" });
      return;
    }

    if (!recoveryCode) {
      res.status(403).json({ error: "NO_RECOVERY_CODE", message: "Recovery code is required" });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const verifyResult = await OtpService.verifyForgotPasswordOtp(
      normalizedEmail,
      String(otpCode).trim(),
      recoveryCode
    );

    if (!verifyResult.valid) {
      res.status(400).json({ error: verifyResult.message || "Invalid OTP code" });
      return;
    }

    res.status(200).json({
      message: "OTP code validated successfully",
      recoveryCode,
      verified: true,
    });
  } catch (error: any) {
    console.error("Reset password verify error:", error);
    res.status(500).json({ error: "Failed to verify OTP code", details: error.message });
  }
});

// Step 6.3: Resend OTP for reset password (supports both paths)
const handleResendForgotPasswordOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      res.status(400).json({ error: "User not found with this email" });
      return;
    }

    const recoveryCode = uuidv4();
    const otpResult = await OtpService.sendForgotPasswordOtp(normalizedEmail, recoveryCode);
    setRecoveryCookie(res, recoveryCode);

    res.status(200).json({
      message: "OTP code resent successfully",
      recoveryCode,
      devOtp: otpResult.code,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to resend OTP", details: error.message });
  }
};

router.post("/resend/otp-reset-password", handleResendForgotPasswordOtp);
router.post("/resend-otp-reset-password", handleResendForgotPasswordOtp);

// Step 6.4: Update password using verified recoveryCode
router.post("/update-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword, recoveryCode: bodyRecoveryCode } = req.body;
    const recoveryCode = bodyRecoveryCode || req.cookies?._rc;

    if (!email || !newPassword) {
      res.status(400).json({ error: "Email and new password are required" });
      return;
    }

    if (!recoveryCode) {
      res.status(403).json({
        error: "NO_RECOVERY_CODE",
        message: "No recovery code provided or recovery session expired",
      });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Verify that the OTP was validated in step 6.2
    const isVerified = await OtpService.isForgotPasswordVerified(normalizedEmail, recoveryCode);
    if (!isVerified) {
      res.status(403).json({
        error: "NO_UPDATE_REQUEST",
        message: "OTP verification required before password update",
      });
      return;
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword },
    });

    // Cleanup OTP session and cookie
    await OtpService.deleteOtp(normalizedEmail, "FORGOT_PASSWORD", recoveryCode);
    res.clearCookie("_rc", { path: "/" });

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error: any) {
    console.error("Update password error:", error);
    res.status(500).json({ error: "Failed to update password", details: error.message });
  }
});

// ==========================================
// 7. CURRENT USER PROFILE
// ==========================================

router.get("/me", authenticateJwt, (req: Request, res: Response): void => {
  res.status(200).json({
    user: req.user,
  });
});

export default router;