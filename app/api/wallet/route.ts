import { NextResponse } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import xrplClient from "@/lib/xrp/xrp-client";
import { getXrpValueInUsd } from "@/lib/xrp/get-xrp-value-in-usd";

export const GET = withWallet(async ({ wallet }) => {
  const { address } = wallet;

  try {
    const walletInfo = await xrplClient.request({
      command: "account_info",
      account: address,
      ledger_index: "validated",
    });

    const serverState = await xrplClient.request({ command: "server_state" });

    const ownerCount = walletInfo.result.account_data.OwnerCount;
    const baseReserve = serverState.result.state.validated_ledger?.reserve_base;
    const countReserve = serverState.result.state.validated_ledger?.reserve_inc;
    const ownerReserve = ownerCount * (countReserve || 0);
    const totalReserve = ownerReserve + (baseReserve || 0);

    const balance = Number(walletInfo.result.account_data.Balance) / 1_000_000;
    const availableBalance = balance - totalReserve / 1_000_000;
    const xrpPrice = await getXrpValueInUsd();

    const tokens = [
      {
        key: "XRP",
        issuer: "", // XRP has no issuer since it's the native currency
        currency: "XRP",
        balance: Number(balance),
        balanceInUsd: balance * xrpPrice,
      },
    ];

    const balances = await xrplClient.getBalances(address, {});

    for (const token of balances) {
      // skip xrp
      if (token.currency === "XRP" && !token.issuer) {
        continue;
      }

      // get book info and calculate price
      const offers = await xrplClient.request({
        command: "book_offers",
        taker_gets: {
          currency: token.currency,
          issuer: token.issuer,
        },
        taker_pays: {
          currency: "XRP",
        },
      });

      if (offers.result.offers.length > 0) {
        const bestOffer = offers.result.offers[0];
        const xrpAmount = Number(bestOffer.TakerPays) / 1_000_000;
        const tokenAmount =
          typeof bestOffer.TakerGets === "object"
            ? Number(bestOffer.TakerGets.value)
            : Number(bestOffer.TakerGets) / 1_000_000;
        const priceInXrp = xrpAmount / tokenAmount;
        const priceInUsd = priceInXrp * xrpPrice;
        const balanceInUsd = priceInUsd * Number(token.value);
        tokens.push({
          key: `${token.currency}-${token.issuer}`,
          issuer: token.issuer as string,
          currency: token.currency,
          balance: Number(token.value),
          balanceInUsd,
        });
      } else {
        tokens.push({
          key: `${token.currency}-${token.issuer}`,
          issuer: token.issuer as string,
          currency: token.currency,
          balance: Number(token.value),
          balanceInUsd: 0,
        });
      }
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
  } catch (e: any) {
    if (e?.message === "Account not found.") {
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
