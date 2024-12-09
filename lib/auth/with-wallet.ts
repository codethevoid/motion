import { NextResponse, NextRequest } from "next/server";
import { getWallet } from "../token";
import { getToken } from "../middleware/utils/get-token";

type Wallet = {
  address: string;
  salt: string;
};

type WithSessionHandler = {
  ({
    req,
    params,
    wallet,
  }: {
    req: NextRequest;
    params: Record<string, string>;
    wallet: Wallet;
  }): Promise<NextResponse>;
};

export const withWallet = (handler: WithSessionHandler) => {
  return async (req: NextRequest, { params = {} }: { params: Record<string, string> }) => {
    const token = await getToken();
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const wallet = await getWallet(token);
    if (!wallet) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return await handler({ req, params, wallet });
  };
};
