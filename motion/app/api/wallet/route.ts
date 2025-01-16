import { NextResponse } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import { getXrpValueInUsd } from "@/lib/xrp/get-xrp-value-in-usd";
import { xrpMeta } from "@/lib/xrp/meta";
import { xrpClient } from "@/lib/xrp/http-client";
import prisma from "@/db/prisma";
import { formatCurrency } from "@/utils/format-currency";

export const GET = withWallet(async ({ wallet }) => {
  const { address } = wallet;

  try {
    const walletInfo = await xrpClient.getAccountInfo(address);
    if ("error" in walletInfo.result) {
      const error = walletInfo.result.error;
      console.log(error);
      if (error === "actNotFound") {
        throw new Error("Account not found.");
      }
    }

    const serverState = await xrpClient.getServerState();

    const ownerCount = Number(walletInfo.result?.account_data?.OwnerCount) || 0;
    const baseReserve = Number(serverState.result?.state?.validated_ledger?.reserve_base) || 0;
    const countReserve = Number(serverState.result?.state?.validated_ledger?.reserve_inc) || 0;
    const ownerReserve = ownerCount * countReserve;
    const totalReserve = ownerReserve + baseReserve;

    const balance = Number(walletInfo.result?.account_data?.Balance) / 1_000_000 || 0;
    const availableBalance = Math.max(0, balance - totalReserve / 1_000_000);
    const xrpPrice = (await getXrpValueInUsd()) || 0;

    const tokens: {
      currency: string;
      issuer: string;
      icon: string | undefined;
      name: string | undefined;
      balance: number;
      balanceInUsd: number;
      rawCurrency: string;
    }[] = [];

    const balances = await xrpClient.getBalances(address);
    console.log("balances", balances);

    for (const token of balances) {
      // skip xrp
      if (token.currency === "XRP" && !token.issuer) {
        tokens.push({ ...xrpMeta, balance: balance, balanceInUsd: balance * xrpPrice });
        continue;
      }

      if (token.value === "0") continue;

      // convert raw currency to string
      let currencyStr = token.currency;
      currencyStr = formatCurrency(currencyStr);

      // fetch the token metadata
      let icon: string | undefined = undefined;
      let name: string | undefined = undefined;
      let price: number = 0;

      try {
        const metadataRes = await fetch(
          `https://s1.xrplmeta.org/token/${currencyStr}:${token.issuer}`,
        );

        if (metadataRes.ok) {
          const data = await metadataRes.json();
          icon = typeof data.meta?.token?.icon === "string" ? data.meta.token.icon : null;
          name = typeof data.meta?.token?.name === "string" ? data.meta.token.name : null;
          price = !isNaN(Number(data.metrics?.price)) ? Number(data.metrics.price) : 0;
        }
      } catch (error) {
        console.error("Error fetching token metadata:", error);
      }

      // fetch the token info from the db
      const tokenInfo = await prisma.token.findFirst({
        where: {
          currency: currencyStr,
          issuer: token.issuer,
        },
      });

      const tokenBalance = Number(token.value) || 0;
      const priceInUsd = price * xrpPrice;

      tokens.push({
        issuer: String(token.issuer || ""),
        currency: String(currencyStr || ""),
        rawCurrency: String(token.currency || ""),
        balance: tokenBalance,
        balanceInUsd: priceInUsd * tokenBalance,
        icon: tokenInfo?.icon || icon,
        name: tokenInfo?.name || name,
      });
    }

    const accountNfts = await xrpClient.getAccountNfts(address);

    const nfts = accountNfts.result?.account_nfts?.map((nft) => {
      let uri: string | null = null;
      try {
        uri = nft.URI ? decodeURI(String(nft.URI)) : null;
        if (uri && uri.startsWith("ipfs://")) {
          uri = uri
            .replace("ipfs://ipfs/", "https://ipfs.io/ipfs/")
            .replace("ipfs://", "https://ipfs.io/ipfs/");
        }
      } catch (error) {
        console.error("Error processing NFT URI:", error);
      }

      const isDirectImage = uri ? /\.(jpeg|jpg|png|gif|webp|svg)$/i.test(uri) : false;

      return {
        id: String(nft.NFTokenID || ""),
        taxon: Number(nft.NFTokenTaxon) || 0,
        uri,
        isDirectImage,
        issuer: String(nft.Issuer || ""),
        flags: Number(nft.Flags) || 0,
      };
    });

    return NextResponse.json({
      address,
      isFunded: true,
      balance,
      availableBalance,
      balanceInUsd: balance * xrpPrice || 0,
      balanceInUsdIncludingTokens: tokens.reduce((acc, token) => acc + token.balanceInUsd, 0),
      xrpPrice,
      tokens,
      nfts,
      baseReserve: baseReserve ? baseReserve / 1_000_000 : 0,
      countReserve: countReserve ? countReserve / 1_000_000 : 0,
      ownerReserve: ownerReserve ? ownerReserve / 1_000_000 : 0,
      totalReserve: totalReserve ? totalReserve / 1_000_000 : 0,
      totalReserveInUsd: totalReserve ? (totalReserve / 1_000_000) * xrpPrice : 0,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Account not found.") {
      return NextResponse.json({
        address,
        isFunded: false,
        balance: 0,
        availableBalance: 0,
        balanceInUsd: 0,
        balanceInUsdIncludingTokens: 0,
        xrpPrice: 0,
        baseReserve: 0,
        countReserve: 0,
        ownerReserve: 0,
        totalReserve: 0,
        totalReserveInUsd: 0,
        nfts: [],
        tokens: [
          {
            ...xrpMeta,
            balance: 0,
            balanceInUsd: 0,
          },
        ],
      });
    }
    console.error(e);
    return NextResponse.json({ error: "an error occured" }, { status: 500 });
  }
});
