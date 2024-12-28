"use client";

import { useWallet } from "@/hooks/use-wallet";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/ui/copy-button";
import { QRCodeSVG } from "qrcode.react";
import FlickeringGrid from "@/components/ui/flickering-grid";
import { cn } from "@/lib/utils";

export const Receive = () => {
  const { wallet, isLoading } = useWallet();
  return (
    <>
      <div className="space-y-1.5">
        <Card className="space-y-4 p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">My address</p>
            {isLoading ? (
              <Skeleton className="h-7 w-full max-w-[300px] rounded-sm" />
            ) : (
              <div className="flex min-w-0 max-w-fit items-center space-x-2 rounded-sm bg-secondary px-2 py-1.5">
                <img
                  src={`https://api.dicebear.com/9.x/glass/png?seed=${wallet?.address}`}
                  alt="wallet avatar"
                  className="h-4 w-4 rounded-full"
                />
                <p className="min-w-0 truncate text-xs">{wallet?.address}</p>
                {wallet?.address && <CopyButton text={wallet.address} />}
              </div>
            )}
          </div>
          <div className="relative z-10 flex w-full items-center justify-center overflow-hidden rounded-md border bg-background p-4">
            <FlickeringGrid
              className="absolute inset-0 top-0.5 z-[-1] hidden size-full w-full dark:block"
              color="#fff"
              height={300}
              width={600}
              gridGap={4}
              squareSize={2}
            />
            <div className="rounded-sm border bg-background p-2">
              <QRCodeSVG
                className={cn(isLoading && "blur-sm")}
                value={wallet?.address || "placeholder-address"}
                level="H"
                bgColor={"#000000"}
                fgColor={"#ffffff"}
                height={90}
                width={90}
                // imageSettings={
                //   showLogo
                //     ? {
                //         src: "https://cdn.qryptic.io/logos/qryptic-qr-icon-light.png",
                //         height: 34,
                //         width: 34,
                //         excavate: true,
                //       }
                //     : undefined
                // }
              />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};
