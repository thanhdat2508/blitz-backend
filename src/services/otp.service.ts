import redisClient from "../config/redis";
import { generateOtp, hashOtp, verifyOtp } from "../utils/otp";
import { MailService } from "./mail.service";

export type OtpType = "REGISTER" | "FORGOT_PASSWORD";

export interface OtpData {
  email: string;
  code: string; // hashed OTP
  attempts: number;
  type: OtpType;
  recoveryCode?: string;
  isVerified?: boolean;
}

export class OtpService {
  private static TTL_SECONDS = 300; // 5 minutes

  static getKey(email: string, type: OtpType, recoveryCode?: string): string {
    const normalizedEmail = email.toLowerCase().trim();
    if (recoveryCode && recoveryCode !== "Unknown") {
      return `otp-code:${normalizedEmail}:${type}:${recoveryCode}`;
    }
    return `otp-code:${normalizedEmail}:${type}`;
  }

  static async sendOtp(options: {
    email: string;
    type: OtpType;
    recoveryCode?: string;
  }): Promise<{ success: boolean; code?: string; recoveryCode?: string }> {
    const normalizedEmail = options.email.toLowerCase().trim();
    const code = generateOtp(6);
    const hashedCode = await hashOtp(code);

    const otpData: OtpData = {
      email: normalizedEmail,
      code: hashedCode,
      attempts: 0,
      type: options.type,
      recoveryCode: options.recoveryCode,
      isVerified: false,
    };

    const key = this.getKey(normalizedEmail, options.type, options.recoveryCode);

    if (redisClient.isOpen) {
      await redisClient.set(key, JSON.stringify(otpData), {
        expiration: { type: "EX", value: this.TTL_SECONDS },
      });
      // Backward compatibility fallback key for REGISTER
      if (options.type === "REGISTER" && !options.recoveryCode) {
        await redisClient.set(`otp:${normalizedEmail}:REGISTER`, JSON.stringify(otpData), {
          expiration: { type: "EX", value: this.TTL_SECONDS },
        });
      }
    }

    // Send email via Resend with configured template
    if (options.type === "REGISTER") {
      await MailService.sendVerificationEmail({
        email: normalizedEmail,
        otpCode: code,
      });
    } else if (options.type === "FORGOT_PASSWORD") {
      await MailService.sendPasswordResetEmail({
        email: normalizedEmail,
        otpCode: code,
      });
    }

    return {
      success: true,
      recoveryCode: options.recoveryCode,
    };
  }

  static async sendRegisterOtp(email: string, recoveryCode?: string) {
    return this.sendOtp({ email, type: "REGISTER", recoveryCode });
  }

  static async sendForgotPasswordOtp(email: string, recoveryCode: string) {
    return this.sendOtp({ email, type: "FORGOT_PASSWORD", recoveryCode });
  }

  static async verifyOtp(options: {
    email: string;
    type: OtpType;
    inputCode: string;
    recoveryCode?: string;
    keepIfVerified?: boolean;
  }): Promise<{ valid: boolean; message?: string }> {
    const normalizedEmail = options.email.toLowerCase().trim();
    const key = this.getKey(normalizedEmail, options.type, options.recoveryCode);

    if (!redisClient.isOpen) {
      return { valid: false, message: "Redis cache is unavailable" };
    }

    let rawData = await redisClient.get(key);
    // Fallback for older register format
    if (!rawData && options.type === "REGISTER") {
      rawData = await redisClient.get(`otp:${normalizedEmail}:REGISTER`);
    }

    if (!rawData) {
      return {
        valid: false,
        message: "OTP code expired or does not exist. Please request a new code.",
      };
    }

    const data: OtpData = JSON.parse(rawData);

    if (data.attempts >= (options.type === "FORGOT_PASSWORD" ? 3 : 5)) {
      await this.deleteOtp(normalizedEmail, options.type, options.recoveryCode);
      return {
        valid: false,
        message: "Too many failed attempts. Please request a new OTP code.",
      };
    }

    const isMatch = await verifyOtp(options.inputCode, data.code);
    if (!isMatch) {
      data.attempts += 1;
      const ttl = await redisClient.ttl(key);
      const remainingAttempts = (options.type === "FORGOT_PASSWORD" ? 3 : 5) - data.attempts;

      if (ttl > 0) {
        await redisClient.set(key, JSON.stringify(data), {
          expiration: { type: "EX", value: ttl },
        });
      }
      return {
        valid: false,
        message: `Invalid OTP code. Attempts remaining: ${Math.max(0, remainingAttempts)}`,
      };
    }

    // Valid
    if (options.keepIfVerified) {
      data.isVerified = true;
      const ttl = await redisClient.ttl(key);
      await redisClient.set(key, JSON.stringify(data), {
        expiration: { type: "EX", value: Math.max(ttl, 600) }, // keep at least 10 minutes for reset step
      });
    } else {
      await this.deleteOtp(normalizedEmail, options.type, options.recoveryCode);
    }

    return { valid: true };
  }

  static async verifyRegisterOtp(email: string, inputCode: string, recoveryCode?: string) {
    return this.verifyOtp({
      email,
      type: "REGISTER",
      inputCode,
      recoveryCode,
      keepIfVerified: false,
    });
  }

  static async verifyForgotPasswordOtp(email: string, inputCode: string, recoveryCode?: string) {
    return this.verifyOtp({
      email,
      type: "FORGOT_PASSWORD",
      inputCode,
      recoveryCode,
      keepIfVerified: true,
    });
  }

  static async isForgotPasswordVerified(
    email: string,
    recoveryCode?: string
  ): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const key = this.getKey(normalizedEmail, "FORGOT_PASSWORD", recoveryCode);

    if (!redisClient.isOpen) return false;

    const rawData = await redisClient.get(key);
    if (!rawData) return false;

    const data: OtpData = JSON.parse(rawData);
    return data.isVerified === true;
  }

  static async deleteOtp(
    email: string,
    type: OtpType,
    recoveryCode?: string
  ): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const key = this.getKey(normalizedEmail, type, recoveryCode);
    if (redisClient.isOpen) {
      await redisClient.del(key);
      if (type === "REGISTER") {
        await redisClient.del(`otp:${normalizedEmail}:REGISTER`);
      }
    }
  }
}

export default OtpService;