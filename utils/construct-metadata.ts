import { Metadata } from "next";

type Props = {
  title?: string;
  description?: string;
  image?: string;
};

export const constructMetadata = ({
  title = `TokenOS • Your Gateway to the XRP Ledger`,
  description = `Connect directly to the XRP Ledger. Send, receive, and explore a world of decentralized possibilities with full control of your assets.`,
  image = "",
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
      creator: "@tokenosdotone",
    },
    metadataBase: new URL("https://tokenos.one"),
    icons: [
      {
        rel: "apple-touch-icon",
        sizes: "32x32",
        url: "https://d1amdcfc5q74f4.cloudfront.net/tokenos/apple-touch-icon.png",
      },
      {
        rel: "android-chrome",
        sizes: "192x192",
        url: "https://d1amdcfc5q74f4.cloudfront.net/tokenos/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome",
        sizes: "512x512",
        url: "https://d1amdcfc5q74f4.cloudfront.net/tokenos/android-chrome-512x512.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "https://d1amdcfc5q74f4.cloudfront.net/tokenos/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "https://d1amdcfc5q74f4.cloudfront.net/tokenos/favicon-16x16.png",
      },
    ],
  };
};
