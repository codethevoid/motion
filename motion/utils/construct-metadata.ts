import { Metadata } from "next";

type Props = {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
};

export const constructMetadata = ({
  title = `motion.zip • Your Gateway to the XRP Ledger`,
  description = `Connect directly to the XRP Ledger. Send, receive, and explore a world of decentralized possibilities with full control of your assets.`,
  image = "https://cdn.motion.zip/meta/light-hero.png",
  noIndex = false,
}: Props): Metadata => {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image,
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
      images: image,
      creator: "@motiondotzip",
    },
    metadataBase: new URL("https://motion.zip"),
    ...(noIndex && {
      robots: {
        follow: false,
        index: false,
      },
    }),
    icons: [
      {
        rel: "apple-touch-icon",
        sizes: "32x32",
        url: "https://cdn.motion.zip/meta/apple-touch-icon.png",
      },
      {
        rel: "android-chrome",
        sizes: "192x192",
        url: "https://cdn.motion.zip/meta/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome",
        sizes: "512x512",
        url: "https://cdn.motion.zip/meta/android-chrome-512x512.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "https://cdn.motion.zip/meta/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "https://cdn.motion.zip/meta/favicon-16x16.png",
      },
    ],
  };
};

export const defaultMetadata = {
  title: `motion.zip • Your Gateway to the XRP Ledger`,
  description: `Connect directly to the XRP Ledger. Send, receive, and explore a world of decentralized possibilities with full control of your assets.`,
  image: "https://cdn.motion.zip/meta/light-hero.png",
};
