import { Router, Request, Response } from "express";
import prisma from "../config/database";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateRandomToken, sha256 } from "../utils/crypto";

const router = Router();

// Demo: Register user (Prisma + bcrypt)
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({ error: "Email already exists" });
      return;
    }
    res.status(500).json({ error: error.message });
  }
});

// Demo: Login user (Prisma + bcrypt verify + crypto session token)
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Demo: Generate a random secure token using crypto
    const sessionToken = generateRandomToken(32);
    const tokenHash = sha256(sessionToken);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token: sessionToken,
      tokenFingerprint: tokenHash,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Demo: List all users (Prisma query)
router.get("/users", async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
