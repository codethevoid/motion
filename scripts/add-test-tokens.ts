import { Wallet, Client } from "xrpl";

const ISSUER_SEED = "sEd78uEQu1WFiFtfpQzLBk4jdZNwj6Z";
const issuerWallet = Wallet.fromSeed(ISSUER_SEED);

const receiverWallet = Wallet.fromSeed("sEdSK7iA3pvR1oeHDgT9DBjDK11rw4N");

const TESTNET_TOKENS = {
  TST: {
    currency: "TST",
    issuer: issuerWallet.address,
  },
  ABC: {
    currency: "ABC",
    issuer: issuerWallet.address,
  },
};

const xrplClient = new Client("wss://s.altnet.rippletest.net:51233");

async function addTestTokens() {
  try {
    await xrplClient.connect();

    for (const [tokenName, tokenInfo] of Object.entries(TESTNET_TOKENS)) {
      console.log(`Setting up trust line for ${tokenName}...`);

      const trustSet = {
        TransactionType: "TrustSet" as const,
        Account: receiverWallet.address,
        LimitAmount: {
          currency: tokenInfo.currency,
          issuer: issuerWallet.address,
          value: "1000000000",
        },
      };
      const trustSetResult = await xrplClient.submit(trustSet, { wallet: receiverWallet });

      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Get the next valid sequence number for the issuer account
      const accountInfo = await xrplClient.request({
        command: "account_info",
        account: tokenInfo.issuer,
      });

      const payment = {
        TransactionType: "Payment" as const,
        Account: issuerWallet.address,
        Destination: receiverWallet.address,
        Sequence: accountInfo.result.account_data.Sequence,
        Amount: {
          currency: tokenInfo.currency,
          issuer: issuerWallet.address,
          value: (Math.random() * 100).toFixed(2),
        },
        SourceTag: Math.floor(Math.random() * 100000),
        LastLedgerSequence: (await xrplClient.getLedgerIndex()) + 10,
      };
      const paymentResult = await xrplClient.submit(payment, { wallet: issuerWallet });

      console.log(`Submitting payment for ${tokenName}:`, JSON.stringify(payment, null, 2));
      console.log(
        `Full payment result for ${tokenName}:`,
        JSON.stringify(paymentResult.result, null, 2),
      );

      // Longer wait
      await new Promise((resolve) => setTimeout(resolve, 20000)); // 20 seconds
      const balances = await xrplClient.request({
        command: "account_lines",
        account: issuerWallet.address,
      });
      console.log(
        `Balances after payment for ${tokenName}:`,
        JSON.stringify(balances.result.lines, null, 2),
      );
    }
  } finally {
    await xrplClient.disconnect();
  }

  console.log("Done! Check your wallet in a few seconds to see the new tokens.");
}

addTestTokens().catch(console.error);
