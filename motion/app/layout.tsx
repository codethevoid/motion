import localFont from "next/font/local";
import { Providers } from "./providers";
import "./globals.css";
import { constructMetadata } from "@/utils/construct-metadata";
import { Analytics } from "@vercel/analytics/react";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = constructMetadata({});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {process.env.NEXT_PUBLIC_MAINTENANCE_MODE !== "true" && <Nav />}
          {children}
          {process.env.NEXT_PUBLIC_MAINTENANCE_MODE !== "true" && <Footer />}
        </Providers>
        {process.env.NODE_ENV === "production" && <Analytics />}
        {process.env.NODE_ENV === "production" && <SpeedInsights />}
      </body>
    </html>
  );
}
