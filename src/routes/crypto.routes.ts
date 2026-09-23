import { Router, Request, Response } from "express";
import { generateRandomToken, sha256, encryptAES, decryptAES, generateUUID } from "../utils/crypto";

const router = Router();

// Demo: Generate random token or UUID
router.get("/generate", (req: Request, res: Response) => {
  const token = generateRandomToken(32);
  const uuid = generateUUID();
  res.json({ token, uuid });
});

// Demo: Hash string with SHA-256
router.post("/hash", (req: Request, res: Response): void => {
  const { text } = req.body;
  if (!text) {
    res.status(400).json({ error: "text is required" });
    return;
  }
  const hash = sha256(text);
  res.json({ text, hash });
});

// Demo: Encrypt text with AES-256-CBC
router.post("/encrypt", (req: Request, res: Response): void => {
  const { text, secretKey } = req.body;
  if (!text || !secretKey) {
    res.status(400).json({ error: "text and secretKey are required" });
    return;
  }
  const encrypted = encryptAES(text, secretKey);
  res.json(encrypted);
});

// Demo: Decrypt text with AES-256-CBC
router.post("/decrypt", (req: Request, res: Response): void => {
  const { encryptedData, iv, secretKey } = req.body;
  if (!encryptedData || !iv || !secretKey) {
    res.status(400).json({ error: "encryptedData, iv and secretKey are required" });
    return;
  }
  try {
    const decrypted = decryptAES(encryptedData, iv, secretKey);
    res.json({ decrypted });
  } catch (error: any) {
    res.status(400).json({ error: "Failed to decrypt. Ensure key and IV are correct." });
  }
});

export default router;
