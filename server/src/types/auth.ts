import { Request } from "express";
import { Wallet } from "xrpl";

export type AuthRequest = Request & {
  wallet: Wallet;
};
