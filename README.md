# Motion

A browser wallet and decentralized exchange on the XRP Ledger.

## What it does

- **Wallet**: Create a new wallet or import an existing one from a recovery phrase. The wallet's seed is encrypted with the user's password and stored in an encrypted cookie, so every transaction needs that password to sign.
- **Trading**: Swap any token on the ledger for another, with live balances, network fees, and reserve requirements calculated before you confirm.
- **Token pages**: Price charts, recent trades, and top holders for every token, built from Motion's own index of on-ledger trades.
- **Token launch**: Issue a new token in a few steps. Motion configures the issuing account, creates the token supply, opens an AMM pool, and permanently disables the issuer's keys so no more tokens can ever be minted.
- **Trustlines**: Add and manage the trustlines a wallet needs before it can hold a token.
- **Referrals**: Affiliate links that tie new wallets to the person who referred them.

## How it works

Motion was split into three packages in one pnpm workspace:

- **`motion`**: The Next.js app. It handles the UI and also has API routes that sign and submit transactions with xrpl.js.
- **`server`**: An Express service and background worker. It reads every ledger from October 2024 onward to backfill trade history, turns trades into price-chart data, and syncs token images to S3 on a daily schedule.
- **`shared`**: Types and utilities used by both.

## Stack

Next.js, TypeScript, Tailwind CSS, Radix UI, Framer Motion, TradingView Lightweight Charts, Express, Postgres, Prisma, xrpl.js, jose, AWS S3, Resend, Vercel
