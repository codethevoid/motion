import { Request, Response, NextFunction } from "express";
import { decryptToken, getWallet } from "../lib/token.js";
import { Wallet } from "xrpl";
import { type AuthRequest, WalletRequest } from "../types/auth.js";

// Use this middleware for actions that require the full wallet
export const withWalletAction = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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

    if (!payload || !payload.publicKey || !payload.privateKey) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    delete req.body.password;

    const wallet = new Wallet(payload.publicKey, payload.privateKey);

    if (!wallet) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    (req as AuthRequest).wallet = wallet;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token or password" });
  }
};

// Use this middleware for non-action routes that require just the wallet address
export const withWallet = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const { address } = await getWallet(token);
    if (!address) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    (req as WalletRequest).address = address;
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
};
