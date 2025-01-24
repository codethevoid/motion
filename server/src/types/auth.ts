import { Request } from "express";
import { Wallet } from "xrpl";

export type AuthRequest = Request & {
  wallet: Wallet;
};

export type WalletRequest = Request & {
  address: string;
};
