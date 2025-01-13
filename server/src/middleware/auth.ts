import { Request, Response, NextFunction } from "express";
import { decryptToken } from "../lib/token.js";
import { Wallet } from "xrpl";
import { type AuthRequest } from "../types/auth.js";

export const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const password = req.body?.password;
    if (!password) {
      res.status(401).json({ error: "Password is required" });
      return;
    }

    const payload = await decryptToken(token, password);

    delete req.body.password;

    const wallet = new Wallet(payload.publicKey, payload.privateKey);
    (req as AuthRequest).wallet = wallet;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token or password" });
  }
};
