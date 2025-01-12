import { NextResponse } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import prisma from "@/db/prisma";
import { dropsToXrp } from "xrpl";

export const GET = withWallet(async ({ wallet }) => {
  try {
    const { address } = wallet;
    const walletDetails = await prisma.wallet.findUnique({ where: { address } });
    if (!walletDetails) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // get total amount of referrals in xrp
    const referrals = await prisma.tx.findMany({ where: { feesCollectedBy: address } });
    const totalReferralsInDrops = referrals.reduce((acc, referral) => {
      return acc + Number(referral.feesCollectedByReferralInDrops);
    }, 0);
    const totalReferralsInXrp = dropsToXrp(totalReferralsInDrops);

    const { referralKey, referralTitle, referralImage, referralFee } = walletDetails;
    return NextResponse.json({
      referralKey,
      referralTitle,
      referralImage,
      referralFee,
      totalReferralsInXrp,
    });
  } catch (e) {
    console.error("Error fetching referral data:", e);
    return NextResponse.json({ error: "Error fetching referral data" }, { status: 500 });
  }
});
