import { Resend } from "resend";

export interface MailVerificationDto {
  email: string;
  otpCode: string;
}

export interface MailResetPasswordDto {
  email: string;
  otpCode: string;
}

export interface MailWelcomeDto {
  email: string;
  name?: string;
}

export interface MailLoginWarningDto {
  email: string;
  firstName?: string;
  lastName?: string;
  ip: string;
  os?: string;
  country?: string;
  city?: string;
}

export class MailService {
  private static resendClient: Resend | null = null;

  private static getClient(): Resend | null {
    if (!this.resendClient && process.env.RESEND_API_KEY) {
      this.resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return this.resendClient;
  }

  private static getFromAddress(): string {
    const fromName = process.env.MAIL_FROM_NAME || "RequinBase";
    const fromAddress = process.env.MAIL_FROM_ADDRESS || "noreply@requinbase.com";
    return `${fromName} <${fromAddress}>`;
  }

  /**
   * Send email verification code via Resend template
   */
  static async sendVerificationEmail(payload: MailVerificationDto): Promise<boolean> {
    const { email, otpCode } = payload;
    const resend = this.getClient();

    if (!resend) {
      console.warn("[MAIL] RESEND_API_KEY not configured, skipping sending email.");
      return false;
    }

    const from = this.getFromAddress();
    const templateId = process.env.RESEND_VERIFY_TEMPLATE_ID || "account-verify";

    try {
      console.log(`[MAIL] Sending verification email via Resend template '${templateId}' to ${email}...`);
      const { data, error } = await resend.emails.send({
        from,
        to: email,
        subject: "Verify your email",
        template: {
          id: templateId,
          variables: {
            email,
            otp_code: otpCode,
          },
        } as any,
      });

      if (error) {
        console.error(`[MAIL ERROR] Resend failed to send verification email to ${email}:`, error);
        return false;
      }

      console.log(`[MAIL SUCCESS] Verification email sent to ${email}. ID: ${data?.id}`);
      return true;
    } catch (err: any) {
      console.error(`[MAIL EXCEPTION] Failed to send verification email to ${email}:`, err.message);
      return false;
    }
  }

  /**
   * Send password reset code via Resend template
   */
  static async sendPasswordResetEmail(payload: MailResetPasswordDto): Promise<boolean> {
    const { email, otpCode } = payload;
    const resend = this.getClient();

    if (!resend) {
      console.warn("[MAIL] RESEND_API_KEY not configured, skipping sending email.");
      return false;
    }

    const from = this.getFromAddress();
    const templateId = process.env.RESEND_RESET_TEMPLATE_ID || "password-reset";

    try {
      console.log(`[MAIL] Sending password reset email via Resend template '${templateId}' to ${email}...`);
      const { data, error } = await resend.emails.send({
        from,
        to: email,
        subject: "Reset your password",
        template: {
          id: templateId,
          variables: {
            email,
            otp_code: otpCode,
          },
        } as any,
      });

      if (error) {
        console.error(`[MAIL ERROR] Resend failed to send password reset email to ${email}:`, error);
        return false;
      }

      console.log(`[MAIL SUCCESS] Password reset email sent to ${email}. ID: ${data?.id}`);
      return true;
    } catch (err: any) {
      console.error(`[MAIL EXCEPTION] Failed to send password reset email to ${email}:`, err.message);
      return false;
    }
  }

  /**
   * Send welcome email after account verification
   */
  static async sendWelcomeEmail(payload: MailWelcomeDto): Promise<boolean> {
    const { email } = payload;
    const resend = this.getClient();

    if (!resend) return false;

    const from = this.getFromAddress();
    const templateId = process.env.RESEND_WELCOME_TEMPLATE_ID || "welcome-email";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    try {
      const { data, error } = await resend.emails.send({
        from,
        to: email,
        subject: "Welcome to Blitz",
        template: {
          id: templateId,
          variables: {
            email,
            dashboard_url: frontendUrl,
          },
        } as any,
      });

      if (error) {
        console.warn(`[MAIL] Welcome email notice for ${email}:`, error.message);
        return false;
      }

      console.log(`[MAIL SUCCESS] Welcome email sent to ${email}. ID: ${data?.id}`);
      return true;
    } catch (err: any) {
      console.warn(`[MAIL] Welcome email exception for ${email}:`, err.message);
      return false;
    }
  }

  /**
   * Send warning email on suspicious login (different IP/location)
   */
  static async sendLoginWarningEmail(payload: MailLoginWarningDto): Promise<boolean> {
    const { email, ip, os, country, city, firstName, lastName } = payload;
    const resend = this.getClient();

    if (!resend) return false;

    const from = this.getFromAddress();
    const templateId = process.env.RESEND_LOGIN_WARNING_TEMPLATE_ID || "suspicious-login";
    const companyName = process.env.MAIL_FROM_NAME || "RequinBase";
    const supportEmail = process.env.MAIL_SUPPORT_ADDRESS || "support@requinbase.com";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    try {
      const { data, error } = await resend.emails.send({
        from,
        to: email,
        subject: "Suspicious login detected",
        template: {
          id: templateId,
          variables: {
            first_name: firstName || email.split("@")[0],
            last_name: lastName || "",
            login_ip: ip,
            login_location: `${city || "Unknown"}, ${country || "Unknown"}`,
            location: `${city || "Unknown"}, ${country || "Unknown"}`,
            os: os || "Unknown Device",
            login_device: os || "Unknown Device",
            login_time: new Date().toLocaleString(),
            company_name: companyName,
            support_email: supportEmail,
            support_url: `${frontendUrl}/support`,
            secure_account_url: frontendUrl,
          },
        } as any,
      });

      if (error) {
        console.warn(`[MAIL] Login warning email notice for ${email}:`, error.message);
        return false;
      }

      console.log(`[MAIL SUCCESS] Login warning email sent to ${email}. ID: ${data?.id}`);
      return true;
    } catch (err: any) {
      console.warn(`[MAIL] Login warning email exception for ${email}:`, err.message);
      return false;
    }
  }
}

export default MailService;
