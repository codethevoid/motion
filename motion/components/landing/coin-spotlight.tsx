"use client";

import Marquee from "../ui/marquee";
import { Card } from "../ui/card";
import { useEffect, useMemo } from "react";
import { formatCurrency } from "@/utils/format-currency";
import NextLink from "next/link";
import { RainbowButton } from "../ui/rainbow-button";
import { useWindowWidth } from "@react-hook/window-size";
import { useState } from "react";
import { TokenIcon } from "../ui/custom/token-icon";

export type MetaToken = {
  name?: string;
  currency: string;
  issuer: string;
  icon: string;
  description: string;
};

// const data = [
//   {
//     name: "SOLO",
//     currency: "534F4C4F00000000000000000000000000000000",
//     issuer: "rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz",
//     icon: "https://s1.xrplmeta.org/icon/C40439709A.png",
//     description:
//       "SOLO is the utility token for the Sologenic ecosystem. It can be used for covering fees when minting NFTs on their platform.",
//   },
//   {
//     name: "Elysian",
//     currency: "ELS",
//     issuer: "rHXuEaRYnnJHbDeuBH5w8yPh5uwNVh5zAg",
//     icon: "https://s1.xrplmeta.org/icon/EF0D1B81E5.png",
//     description: "The first Token for the Art and NFT Industry running on the XRPL.",
//   },
//   {
//     name: "CasinoCoin",
//     currency: "CSC",
//     issuer: "rCSCManTZ8ME9EoLrSHHYKW8PPwWMgkwr",
//     icon: "https://s1.xrplmeta.org/icon/36FDF2E660.png",
//     description:
//       "CasinoCoin (CSC) is a digital currency, developed specifically for the regulated gaming industry.",
//   },
//   {
//     name: "Ripple USD",
//     currency: "524C555344000000000000000000000000000000",
//     issuer: "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De",
//     icon: "https://s1.xrplmeta.org/icon/71710E6395.png",
//     description:
//       "Ripple USD (RLUSD) is natively issued on the XRP Ledger and Ethereum blockchains and is enabled with a number of features to ensure strict adherence to compliance standards, flexibility for developers, and security for holders.",
//   },
//   {
//     name: "XBARBERS",
//     currency: "4252425200000000000000000000000000000000",
//     issuer: "rGGrJaZZrj4SwgeqhcQ4W2LKv5TTe6yKvo",
//     icon: "https://s1.xrplmeta.org/icon/1DF1030379.webp",
//     description:
//       "xBarbers is essentially the digital currency for all those who believe that a good haircut can solve the world's problems.",
//   },
//   {
//     name: "XRMine",
//     currency: "58524D696E650000000000000000000000000000",
//     issuer: "rfXMq3BMX2dTzJtG4pnhr49u6sHkVQXpWL",
//     icon: "https://s1.xrplmeta.org/icon/B3C987C856.png",
//     description: "XRMine is a platform to reward the xrpl community for their engagement",
//   },
//   {
//     name: "Equilibrium",
//     currency: "457175696C69627269756D000000000000000000",
//     issuer: "rpakCr61Q92abPXJnVboKENmpKssWyHpwu",
//     icon: "https://s1.xrplmeta.org/icon/4A4BD9F554.jpg",
//     description: "Gaming Token for the Equilibrium Games Ecosystem.",
//   },
//   {
//     name: "XRdoge",
//     currency: "5852646F67650000000000000000000000000000",
//     issuer: "rLqUC2eCPohYvJCEBJ77eCCqVL2uEiczjA",
//     icon: "https://s1.xrplmeta.org/icon/CD55E5ACAC.png",
//     description:
//       "XRdoge is the first meme token launched on the XRP Ledger (XRPL), blending the viral charm of meme culture with the fast, cost-effective transactions of XRPL. \nCreated as a fun yet functional project, XRdoge aims to bring the beloved 'doge' meme to the blockchain, engaging both the XRP community and meme enthusiasts worldwide. \nBuilt on the XRPL as an IOU, XRdoge takes advantage of near-instant transaction speeds and minimal fees, making it accessible and efficient for every user.\n\nIn true meme fashion, XRdoge doesn’t just aim to be a token—it’s about fostering a lively community and building a unique identity on the XRPL. \nBy bringing an established internet icon into the blockchain world, XRdoge is not only pioneering meme culture on the XRPL but also creating a space for holders \nto be part of an enthusiastic, growing community that values fun, innovation, and the spirit of digital freedom.\n",
//   },
//   {
//     name: "US Dollar",
//     currency: "USD",
//     issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
//     icon: "https://s1.xrplmeta.org/icon/C676A0DE05.png",
//     description:
//       "Bitstamp's USD is a fully backed U.S. Dollar IOU on the XRPL. It can be redeemed into real Dollars on bitstamp.net. For support, visit their website or Twitter @BitstampSupport",
//   },
//   {
//     name: "XDX",
//     currency: "XDX",
//     issuer: "rMJAXYsbNzhwp7FfYnAsYP5ty3R9XnurPo",
//     icon: "https://s1.xrplmeta.org/icon/D39ED7C01D.jpg",
//     description:
//       "XDX is a digital currency, developed to be utilised to specific mobile applications.",
//   },
//   {
//     name: "TRSRY",
//     currency: "5452535259000000000000000000000000000000",
//     issuer: "rLBnhMjV6ifEHYeV4gaS6jPKerZhQddFxW",
//     icon: "https://s1.xrplmeta.org/icon/ED4EB48784.png",
//     description: "Asset issued by eolas",
//   },
//   {
//     name: "Reaper",
//     currency: "RPR",
//     issuer: "r3qWgpz2ry3BhcRJ8JE6rxM8esrfhuKp4R",
//     icon: "https://s1.xrplmeta.org/icon/9AC754AF51.png",
//     description:
//       "Reaper Financial and RPR Token serve the digital ecosystem as a natural market regulation tool for a decentralized economy. By unleashing the natural aspect of death upon an artificially created universe we serve to preserve the value of every entity within.",
//   },
//   {
//     name: "ALL THE MONEY",
//     currency: "ATM",
//     issuer: "raDZ4t8WPXkmDfJWMLBcNZmmSHmBC523NZ",
//     icon: "https://s1.xrplmeta.org/icon/A5259CB73C.webp",
//     description:
//       "All The Money will flow through our ATMs - #AllTheMoney on the #XRPLedger is a community driven memecoin, all about fun, no promises, no utility 🏧  - Supported by @xSPECTAR 🧬 - Now trading live on BITRUE (ticker $ATMX)\r\nhttps://www.bitrue.com/nl/trade/atmx_usdt - FIAT onboarding: http://get.allthe.money/",
//   },
//   {
//     name: "FaithToken",
//     currency: "4641495448000000000000000000000000000000",
//     issuer: "rfeSrMKMvyb3MSMnQRFZ1Dwd9KHS6g49ZT",
//     icon: "https://s1.xrplmeta.org/icon/280919F705.jpg",
//     description:
//       "FaithToken is an attempt to create a genuinely decentralized and organically produced digital currency.",
//   },
//   {
//     name: "Bitcoin",
//     currency: "BTC",
//     issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
//     icon: "https://s1.xrplmeta.org/icon/03DDEF3C9D.png",
//     description:
//       "Bitstamp's BTC is a fully backed Bitcoin IOU on the XRPL. It can be redeemed into real Bitcoins on bitstamp.net. For support, visit their website or Twitter @BitstampSupport",
//   },
//   {
//     name: "BEAR",
//     currency: "4245415200000000000000000000000000000000",
//     issuer: "rBEARGUAsyu7tUw53rufQzFdWmJHpJEqFW",
//     icon: "https://s1.xrplmeta.org/icon/42B244281D.png",
//     description: "BEAR is a digital currency, developed specifically for degenerate gamblers.",
//   },
//   {
//     name: "xSTIK",
//     currency: "785354494B000000000000000000000000000000",
//     issuer: "rJNV9i4Q6zvRhpE2zjxgkvff3eGHQohZht",
//     icon: "https://s1.xrplmeta.org/icon/A04CD425CE.png",
//     description: "xSTIK Deflationary Token behind the world famous xSTIK figure",
//   },
//   {
//     name: "ARMY CTO",
//     currency: "41524D5900000000000000000000000000000000",
//     issuer: "rGG3wQ4kUzd7Jnmk1n5NWPZjjut62kCBfC",
//     icon: "https://s1.xrplmeta.org/icon/F092CB5202.webp",
//     description:
//       "In a world dominated by fleeting trends and fragile communities, the XRP $ARMY stands as an unshakable force.\r\n\r\nBold. Timeless. Fearless. The XRP ARMY will lead the charge as $XRP skyrockets to the top. The haters will see it. The doubters will hear it. But those who join will experience it.  The strongest army in crypto has spoken. \r\n\r\nWe shall prevail. For Ripple. For XRP. For the XRP ARMY ⚔️🪖",
//   },
//   {
//     name: "Phoenix",
//     currency: "50484E4958000000000000000000000000000000",
//     issuer: "rDFXbW2ZZCG5WgPtqwNiA2xZokLMm9ivmN",
//     icon: "https://s1.xrplmeta.org/icon/16966ADEF7.webp",
//     description:
//       "$PHNIX is the ultimate symbol of XRP's resilience in the face of adversity, as well as its unofficial yet widely recognized mascot.",
//   },
//   {
//     currency: "TPR",
//     issuer: "rht98AstPWmLPQMrwd9YDrcDoTjw9Tiu4B",
//     icon: "https://s1.xrplmeta.org/icon/D8B994DE4B.png",
//     description:
//       "Tipper was launched to fulfill the rewarding segment of the XRP community and to provide advanced reward integrations for P2E games, NFT projects.",
//   },
//   {
//     name: "Schmeckles",
//     currency: "5363686D65636B6C657300000000000000000000",
//     issuer: "rPxw83ZP6thv7KmG5DpAW4cDW55DZRZ9wu",
//     icon: "https://s1.xrplmeta.org/icon/7A030508B6.png",
//     description: "Schmeckles is a token on the XRP Ledger for Rick and Morty fans.",
//   },
//   {
//     name: "Magnetic",
//     currency: "MAG",
//     issuer: "rXmagwMmnFtVet3uL26Q2iwk287SRvVMJ",
//     icon: "https://s1.xrplmeta.org/icon/DD42FF3E91.png",
//     description: "Magnetic - a unified platform for all your needs on XRPL.",
//   },
//   {
//     name: "SwissTech",
//     currency: "5377697373546563680000000000000000000000",
//     issuer: "raq7pGaYrLZRa88v6Py9V5oWMYEqPYr8Tz",
//     icon: "https://s1.xrplmeta.org/icon/11B24C0E0C.png",
//     description:
//       "The SwissTech token transcends its role as a transactional medium, evolving into a cornerstone asset within our ecosystem. Functioning as the primary currency fueling interactions and transactions, it assumes a pivotal position rather than being relegated to a mere monetary instrument. Users recognize the SwissTech token as a vital asset due to its indispensable function, granting access to a tailored suite of tools, platforms, and services meticulously crafted to address diverse needs.",
//   },
//   {
//     name: "XPMarket Token",
//     currency: "XPM",
//     issuer: "rXPMxBeefHGxx2K7g5qmmWq3gFsgawkoa",
//     icon: "https://s1.xrplmeta.org/icon/4E7902ED1F.png",
//     description:
//       "The XPM token serves as a utility token within the XPMarket platform, used for services & rewards.",
//   },
//   {
//     name: "onXRP",
//     currency: "OXP",
//     issuer: "rrno7Nj4RkFJLzC4nRaZiLF5aHwcTVon3d",
//     icon: "https://s1.xrplmeta.org/icon/1A00B30494.png",
//     description:
//       "A premier ecosystem on the XRPL that aims to make the XRP Ledger accessible while simultaneously driving innovation and increasing adoption.",
//   },
//   {
//     name: "TALENT",
//     currency: "54414C454E540000000000000000000000000000",
//     issuer: "r92SQCuWhYoB4w2UnKU7PKj4Mh7jSyemrH",
//     icon: "https://s1.xrplmeta.org/icon/84AB3DC556.jpg",
//     description:
//       "TALENT Token has been built on top of the XRP Ledger and has been issued by the TalentChain team.\r\nTALENT is the TalentChain's utility token, created to provide liquidity to the personal tokens markets and to create an alternative market where every TALENT token can be exchanged for personal tokens from the DEX.\r\nSoon, TALENT holders will be able to use TALENT to participate in governance and to earn rewards by depositing TALENT into a liquidity pool.",
//   },
//   {
//     name: "Drop",
//     currency: "44524F5000000000000000000000000000000000",
//     issuer: "rszenFJoDdiGjyezQc8pME9KWDQH43Tswh",
//     icon: "https://s1.xrplmeta.org/icon/D838796B53.webp",
//     description:
//       "Hi my name is Drop! There are 1,000,000 drops in one XRP. Which is equal to 0.000001 XRP. This means that one XRP is equal to one million drops, therefore the supply of Drop is 1,000,000. Join telegram group!![https://t.me/DropXRPL]",
//   },
//   {
//     name: "XRGary",
//     currency: "5852476172790000000000000000000000000000",
//     issuer: "rCE2rxDDZtM7qkHAxorjkfLiHX71HtqTY",
//     icon: "https://s1.xrplmeta.org/icon/7F938A1FF6.png",
//     description: "XRgary - Meme coin inspired by SEC chairman - Gentleman",
//   },
//   {
//     name: "Bradcoin",
//     currency: "4252414400000000000000000000000000000000",
//     issuer: "rBRAD8ntFu3yFhpoo7uLjj4EbVi2UQ1EMR",
//     icon: "https://s1.xrplmeta.org/icon/B467108DB4.png",
//     description:
//       "$BRAD is an XRPL DeFi memecoin inspired by our love for Brad Garlinghouse, the CEO of Ripple.",
//   },
//   {
//     name: "Factora",
//     currency: "466163746F726100000000000000000000000000",
//     issuer: "rLvvgXHiL7weCDJr3uxaqnjc8aZuf4JNAV",
//     icon: "https://s1.xrplmeta.org/icon/838BAA4A09.png",
//     description:
//       "Factora - the main token of the game of the same name. Allows you to increase rewards for partner Airdrops",
//   },
//   {
//     name: "1MarketCoin",
//     currency: "1MC",
//     issuer: "rsJvPP7GVdPfe5zmQtvxAJVZAmDUGfhkV1",
//     icon: "https://s1.xrplmeta.org/icon/62CCF7EBF7.png",
//     description:
//       "1 Market Coin and its XRPL based token 1MC, is a commercial brand designed as cryptocurrency to be used peer to peer in web and mobile marketplace.",
//   },
//   {
//     name: "589 EOY",
//     currency: "589",
//     issuer: "rfcasq9uRbvwcmLFvc4ti3j8Qt1CYCGgHz",
//     icon: "https://s1.xrplmeta.org/icon/070D71F17C.webp",
//     description:
//       "$589 Bart meme was born when an edited chalkboard image showed Bart writing 'XRP to $589+ by EOY'. Playing on The Simpsons' prophecy reputation, it became XRP's most iconic meme, perfectly capturing our community's hopes and dreams.\r\n\r\nNow through CTO, we're turning that meme into a movement.",
//   },
//   {
//     name: "World Money",
//     currency: "XWM",
//     issuer: "rJzBh2Sktnps8CoLVJeDjj3Y2aDzXhrAFL",
//     icon: "https://s1.xrplmeta.org/icon/2203E5177B.png",
//     description: "A digital coin for everyone.",
//   },
//   {
//     name: "UMMO coin",
//     currency: "554D4D4F00000000000000000000000000000000",
//     issuer: "rfGqDiFegcMm8e9saj48ED74PkotwJCmJd",
//     icon: "https://s1.xrplmeta.org/icon/9240601B23.png",
//     description: "UMMO coin (UMMO) is the first digital extraterrestrial currency.",
//   },
//   {
//     name: "scrappy",
//     currency: "7363726170000000000000000000000000000000",
//     issuer: "rGHtYnnigyuaHehWGfAdoEhkoirkGNdZzo",
//     icon: "https://s1.xrplmeta.org/icon/D3A9C41CD4.webp",
//     description:
//       "\r\nScrappy ($scrap) is the first-ever meme coin on First Ledger, created by the founder of First Ledger - XRPL's pioneering memecoin trading platform. Inspired by the founder's dog, Scrappy combines community spirit with XRPL innovation.",
//   },
//   {
//     name: "LumosDAO",
//     currency: "4C554D4F53000000000000000000000000000000",
//     issuer: "rsPqeamjpr3Bxu4LhtCgvJEAQusYRRg6Ha",
//     icon: "https://s1.xrplmeta.org/icon/934DC1586B.png",
//     description:
//       "LumosDAO is a platform that makes it easy to start and run Decentralized Autonomous Organizations (DAOs). It provides tools for users to create proposals, vote, and participate in community decisions, enhancing openness and collaboration.",
//   },
//   {
//     name: "ARK",
//     currency: "ARK",
//     issuer: "rf5Jzzy6oAFBJjLhokha1v8pXVgYYjee3b",
//     icon: "https://s1.xrplmeta.org/icon/6B2DAFD444.png",
//     description:
//       "Ark Institute and the ARK token aim to provide charities with an innovative method of self-sustainable funding. Organizations which sow the seeds of life for the good of man, should not have to beg for money to do so.",
//   },
//   {
//     name: "HADALITE",
//     currency: "484144414C495445000000000000000000000000",
//     issuer: "rHiPGSMBbzDGpoTPmk2dXaTk12ZV1pLVCZ",
//     icon: "https://s1.xrplmeta.org/icon/785EF9648E.png",
//     description: "Governance token of the HadaDAO",
//   },
//   {
//     name: "BearBull",
//     currency: "BRB",
//     issuer: "rUkuT9TCDTP2oeAPsrCN7XKcHZfdvHvFkG",
//     icon: "https://s1.xrplmeta.org/icon/1E4B71A660.webp",
//     description:
//       "BearBull Token 🐂🐻  \r\n\r\nBearBull is a unique meme token that embodies the endless battle of bulls and bears in the crypto market. It’s more than just a token — it’s a symbol of resilience, market dynamics, and community strength.  \r\n\r\n### Key Features:  \r\n- Iconic Character: Half-bull, half-bear, representing the market’s duality.  \r\n- Fair Distribution: Designed for true market enthusiasts.  \r\n- Community Driven: Powered by the passion and engagement of its holders.  \r\n- Utility & Fun: A perfect",
//   },
//   {
//     name: "Pillars",
//     currency: "PLR",
//     issuer: "rNSYhWLhuHvmURwWbJPBKZMSPsyG5Qek17",
//     icon: "https://s1.xrplmeta.org/icon/770796A1DF.png",
//     description:
//       "Pillars offers third-party asset backing for various XRP Ledger projects through XRP, while also offering PLR holders and other assets opportunities to earn passive XRP rewards.",
//   },
//   {
//     name: "HADA",
//     currency: "4841444100000000000000000000000000000000",
//     issuer: "rsR5JSisuXsbipP6sGdKdz5agjxn8BhHUC",
//     icon: "https://s1.xrplmeta.org/icon/5C4BD22E88.png",
//     description: "Utility token of the HadaDAO",
//   },
//   {
//     name: "Ripples",
//     currency: "52504C5300000000000000000000000000000000",
//     issuer: "r93hE5FNShDdUqazHzNvwsCxL9mSqwyiru",
//     icon: "https://s1.xrplmeta.org/icon/F3371E2E7E.webp",
//     description:
//       "Meet Ripples! The Ultimate Ripple Effect for XRP meme tokens. Ripples turn into Waves, and Waves turn into Tsunamis! Welcome to the new Ocean of Liquidity on the XRPL. We are the first XRPL meme token developing a mobile game for IOS and Android. Check out our NFT collection on https://xrp.cafe/collection/ripplesrpls",
//   },
//   {
//     name: "XRPayNet",
//     currency: "58525061794E6574000000000000000000000000",
//     issuer: "r9rRLst96Ue4YTDQkWWkX1ePB6p6Ye4FkA",
//     icon: "https://s1.xrplmeta.org/icon/266ED62CD6.png",
//     description: "XRPayNet is redefining the industry standard for financial transactions.",
//   },
//   {
//     name: "Ascension",
//     currency: "ASC",
//     issuer: "r3qWgpz2ry3BhcRJ8JE6rxM8esrfhuKp4R",
//     icon: "https://s1.xrplmeta.org/icon/C913816F67.png",
//     description:
//       "Ascension is a Reaper Financial ecosystem token that will work in tandem with RPR.",
//   },
//   {
//     name: "Jelly",
//     currency: "4A454C4C59000000000000000000000000000000",
//     issuer: "rKHsxmaqf2SfcyU9LRi3VyjpAtyg6ZrQMp",
//     icon: "https://s1.xrplmeta.org/icon/8D9168C7E2.webp",
//     description:
//       "An XRP ledger commemorative meme coin. Ultra rare. Ultra collectible. Ultra exclusive.\r\n\r\nEveryone loves jelly. It’s the perfect treat. Now you can get Jelly in your wallet. Soon, you’ll be able to get it off the shelves.\r\n\r\n-Fairly launched.\r\n\r\nStrap in. ",
//   },
//   {
//     name: "PONGO",
//     currency: "504F4E474F000000000000000000000000000000",
//     issuer: "rwCq6TENSo3Hh9LKipXnLaxaeXBXKubqki",
//     icon: "https://s1.xrplmeta.org/icon/3AB5F19A15.webp",
//     description:
//       "Pongo isn’t just any skunk—he’s a warrior born in the meme coin trenches, where countless tokens rise and fall in the blink of an eye. Born with black and white fur, Pongo wears his colors with pride, symbolizing his loyalty to XRP and his mission to unite meme coins under one flag. For Pongo, the XRP blockchain isn’t just a platform—it’s his battleground, and he’s ready to lead the meme coin revolution.",
//   },
// ];

export const CoinSpotlight = ({ tokens }: { tokens: MetaToken[] }) => {
  const width = useWindowWidth();
  const [updatedWidth, setUpdatedWidth] = useState(0);

  const [firstRow, secondRow] = useMemo(() => {
    const half = Math.ceil(tokens.length / 2);
    return [tokens.slice(0, half), tokens.slice(half)];
  }, []);

  useEffect(() => {
    setUpdatedWidth(width);
  }, [width]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-center text-3xl font-bold max-sm:text-xl max-sm:tracking-tight">
          Your tokens on XRPL
        </h2>
        <p className="mx-auto max-w-lg text-center text-sm text-muted-foreground max-sm:max-w-xs max-sm:text-[13px]">
          Gain access to thousands of tokens and start trading with ease directly from our
          decentralized exchange using our self-custody wallet.
        </p>
      </div>
      <div className="relative flex h-[265px] w-full flex-col items-center justify-center overflow-hidden">
        <Marquee pauseOnHover={updatedWidth > 768} className="[--duration:80s]">
          {firstRow.map((token) => (
            <CoinCard key={`${token.currency}-${token.issuer}`} {...token} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover={updatedWidth > 768} className="[--duration:80s]">
          {secondRow.map((token) => (
            <CoinCard key={`${token.currency}-${token.issuer}`} {...token} />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
      </div>
      <div className="mx-auto w-full max-w-[200px]">
        <NextLink href="/tokens">
          <RainbowButton className="h-10 w-full px-8 transition-[scale_300ms] ease-in-out hover:scale-[1.02]">
            Explore all tokens
          </RainbowButton>
        </NextLink>
      </div>
    </div>
  );
};

const CoinCard = (token: MetaToken) => {
  return (
    <NextLink href={`/tokens/${token.currency}:${token.issuer}`} className="h-[120px]">
      <Card className="h-full w-64 cursor-pointer p-4 transition-colors dark:hover:bg-secondary/60">
        <div className="flex items-center gap-2">
          {/* <img
            className="size-8 rounded-full"
            alt={token.name || formatCurrency(token.currency)}
            src={token.icon}
          /> */}
          <TokenIcon
            url={`https://cdn.motion.zip/icons/${token.currency}/${token.issuer}`}
            fallback={token.icon}
            alt={(token.name as string) || formatCurrency(token.currency)}
            className="size-8 rounded-full"
          />
          <div>
            <p className="line-clamp-1 text-[13px] text-foreground">
              {token.name ? token.name : formatCurrency(token.currency)}
            </p>
            <p className="text-xs text-muted-foreground">{formatCurrency(token.currency)}</p>
          </div>
        </div>
        <p className="mt-2 line-clamp-2 text-[13px]">{token.description}</p>
      </Card>
    </NextLink>
  );
};
