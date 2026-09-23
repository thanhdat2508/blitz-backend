import crypto from "node:crypto";

/**
 * Generate a cryptographically secure random token (hex)
 */
export const generateRandomToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString("hex");
};

/**
 * Generate a SHA-256 hash string
 */
export const sha256 = (data: string): string => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

/**
 * Generate a secure UUID v4
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};

const ALGORITHM = "aes-256-cbc";

/**
 * Encrypt a text string using AES-256-CBC
 */
export const encryptAES = (
  text: string,
  secretKey: string
): { iv: string; encryptedData: string } => {
  const iv = crypto.randomBytes(16);
  // Ensure 32 bytes key length with SHA-256
  const key = crypto.createHash("sha256").update(secretKey).digest();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted,
  };
};

/**
 * Decrypt AES-256-CBC encrypted text
 */
export const decryptAES = (
  encryptedData: string,
  ivHex: string,
  secretKey: string
): string => {
  const iv = Buffer.from(ivHex, "hex");
  const key = crypto.createHash("sha256").update(secretKey).digest();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
