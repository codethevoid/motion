import { Metadata } from "next";

type Props = {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
};

export const constructMetadata = ({
  title = `TokenOS • Your Gateway to the XRP Ledger`,
  description = `Connect directly to the XRP Ledger. Send, receive, and explore a world of decentralized possibilities with full control of your assets.`,
  image = "https://cdn.tokenos.one/meta/light-hero.png",
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
      creator: "@tokenosdotone",
    },
    metadataBase: new URL("https://tokenos.one"),
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
        url: "https://cdn.tokenos.one/meta/apple-touch-icon.png",
      },
      {
        rel: "android-chrome",
        sizes: "192x192",
        url: "https://cdn.tokenos.one/meta/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome",
        sizes: "512x512",
        url: "https://cdn.tokenos.one/meta/android-chrome-512x512.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "https://cdn.tokenos.one/meta/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "https://cdn.tokenos.one/meta/favicon-16x16.png",
      },
    ],
  };
};

export const defaultMetadata = {
  title: `TokenOS • Your Gateway to the XRP Ledger`,
  description: `Connect directly to the XRP Ledger. Send, receive, and explore a world of decentralized possibilities with full control of your assets.`,
  image: "https://cdn.tokenos.one/meta/light-hero.png",
};
