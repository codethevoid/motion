import { Metadata } from "next";

type Props = {
  title?: string;
  description?: string;
  image?: string;
};

export const constructMetadata = ({
  title = `Davincii | Your Gateway to the XRP Ledger`,
  description = ` Connect directly to the XRP Ledger. Send, receive, and explore a world of decentralized possibilities with full control of your assets.`,
  image = "https://d1amdcfc5q74f4.cloudfront.net/davincii/open-graph.png",
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
      creator: "@davinciidotio",
    },
    metadataBase: new URL("https://davincii.io"),
    icons: [
      {
        rel: "apple-touch-icon",
        sizes: "32x32",
        url: "https://d1amdcfc5q74f4.cloudfront.net/davincii/apple-touch-icon.png",
      },
      {
        rel: "android-chrome",
        sizes: "192x192",
        url: "https://d1amdcfc5q74f4.cloudfront.net/davincii/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome",
        sizes: "512x512",
        url: "https://d1amdcfc5q74f4.cloudfront.net/davincii/android-chrome-512x512.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "https://d1amdcfc5q74f4.cloudfront.net/davincii/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "https://d1amdcfc5q74f4.cloudfront.net/davincii/favicon-16x16.png",
      },
    ],
  };
};
