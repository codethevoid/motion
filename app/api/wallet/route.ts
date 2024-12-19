import { NextResponse } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import { getXrpClient } from "@/lib/xrp/connect";
import { getXrpValueInUsd } from "@/lib/xrp/get-xrp-value-in-usd";
import { xrpMeta } from "@/lib/xrp/meta";

export const GET = withWallet(async ({ wallet }) => {
  const { address } = wallet;
  const xrplClient = await getXrpClient();

  try {
    const walletInfo = await xrplClient.request({
      command: "account_info",
      account: address,
      ledger_index: "validated",
    });

    const serverState = await xrplClient.request({
      command: "server_state",
      ledger_index: "validated",
    });

    const accountLines = await xrplClient.request({
      command: "account_lines",
      account: address,
      ledger_index: "validated",
    });

    console.log(accountLines.result?.lines);

    const ownerCount = walletInfo.result.account_data.OwnerCount;
    const baseReserve = serverState.result.state.validated_ledger?.reserve_base;
    const countReserve = serverState.result.state.validated_ledger?.reserve_inc;
    const ownerReserve = ownerCount * (countReserve || 0);
    const totalReserve = ownerReserve + (baseReserve || 0);

    const balance = Number(walletInfo.result.account_data.Balance) / 1_000_000;
    const availableBalance = balance - totalReserve / 1_000_000;
    const xrpPrice = await getXrpValueInUsd();

    const tokens: {
      currency: string;
      issuer: string;
      icon: string | undefined;
      name: string | undefined;
      balance: number;
      balanceInUsd: number;
    }[] = [];

    const balances = await xrplClient.getBalances(address, {});

    for (const token of balances) {
      // skip xrp
      if (token.currency === "XRP" && !token.issuer) {
        tokens.push({ ...xrpMeta, balance: balance, balanceInUsd: balance * xrpPrice });
        continue;
      }

      // convert raw currency to string
      if (token.currency.length === 40) {
        token.currency = Buffer.from(token.currency, "hex").toString("utf-8").replace(/\0/g, "");
      }

      // fetch the token metadata
      const metadataRes = await fetch(
        `https://s1.xrplmeta.org/token/${token.currency}:${token.issuer}`,
      );

      let icon;
      let name;
      let price;
      if (metadataRes.ok) {
        const data = await metadataRes.json();
        icon = data.meta?.token?.icon;
        name = data.meta?.token?.name;
        price = data.metrics?.price;
      }

      const priceInUsd = price * xrpPrice || 0;

      tokens.push({
        issuer: token.issuer as string,
        currency: token.currency,
        balance: Number(token.value),
        balanceInUsd: priceInUsd * Number(token.value),
        icon,
        name,
      });
    }

    const accountNfts = await xrplClient.request({
      command: "account_nfts",
      // account: process.env.NODE_ENV === "development" ? testAddress : address,
      account: address,
      ledger_index: "validated",
    });

    const nfts = accountNfts.result.account_nfts.map((nft) => {
      let uri = nft.URI ? decodeURI(nft.URI) : null;
      if (uri) {
        // Handle IPFS URIs (including redundant ipfs/ in path)
        if (uri.startsWith("ipfs://")) {
          uri = uri
            .replace("ipfs://ipfs/", "https://ipfs.io/ipfs/")
            .replace("ipfs://", "https://ipfs.io/ipfs/");
        }
      }
      const isDirectImage = uri?.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i) !== null;

      return {
        id: nft.NFTokenID,
        taxon: nft.NFTokenTaxon,
        uri,
        isDirectImage,
        issuer: nft.Issuer,
        flags: nft.Flags,
      };
    });

    await xrplClient.disconnect();

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
            key: "XRP",
            currency: "XRP",
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
