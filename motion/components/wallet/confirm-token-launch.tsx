"use client";

import { useWalletActions } from "./context";
import { Password } from "./password";
import { Card } from "../ui/card";
import { useWallet } from "@/hooks/use-wallet";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import {
  ISSUER_CREATION_FEE,
  TRUSTLINE_FEE,
  LP_DEV_WALLET_TRUSTLINE_FEE,
  LP_WALLET_CREATION_FEE,
  LP_WALLET_TRUSTLINE_FEE,
  POOL_CREATION_FEE,
  MOTION_ZIP_FEE,
} from "@motion/shared/constants";
import { useState } from "react";
import { ButtonSpinner } from "../ui/button-spinner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "../ui/progress";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { nanoid } from "@/utils/alphabet";

const motionZipFee = () => {
  return process.env.NODE_ENV === "development" ? 0 : MOTION_ZIP_FEE;
};

export const ConfirmTokenLaunch = () => {
  const { payload, password, setIsOpen, jwe } = useWalletActions();
  const { wallet, isLoading } = useWallet();
  const [isConfirming, setIsConfirming] = useState(false);
  const [percentComplete, setPercentComplete] = useState(5);
  const router = useRouter();
  console.log(payload);

  const confirmTokenLaunch = async () => {
    try {
      setIsConfirming(true);

      if (!jwe) {
        toast.error("Failed to authenticate");
        return;
      }

      // listen for events to set the progress
      const requestId = nanoid(32);
      const eventSource = new EventSource(`/api/token/create/progress/${requestId}`);

      eventSource.onmessage = (event) => {
        const percent = Number(event.data);
        console.log("new message", percent);
        setPercentComplete(percent);
      };
      eventSource.onerror = (event) => {
        console.error(event);
        eventSource.close();
      };

      const formData = new FormData();
      formData.append("password", password);
      Object.entries(payload).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, (value as number | string).toString());
        }
      });

      const res = await fetch(`/api/token/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwe}`,
          "X-Request-ID": requestId,
        },
        body: formData,
      });

      eventSource.close();

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error);
        return;
      }

      const data = (await res.json()) as { issuer: string; currency: string };
      const { issuer, currency } = data;

      setPercentComplete(100);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Token created successfully!");
      setIsConfirming(false);
      setIsOpen(false);
      router.push(`/tokens/${currency}:${issuer}?confetti=true`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to launch token");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-2">
      <Card className="space-y-4 p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Decentralized wallet</p>
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
            </div>
          )}
        </div>
      </Card>
      {password ? (
        <>
          <p className="text-sm font-medium">Summary</p>
          <Card className="p-4">
            <div className="space-y-0.5">
              <LineItem
                label="Token creation"
                value={`${(ISSUER_CREATION_FEE + TRUSTLINE_FEE + LP_DEV_WALLET_TRUSTLINE_FEE + LP_WALLET_CREATION_FEE + LP_WALLET_TRUSTLINE_FEE + POOL_CREATION_FEE).toFixed(2)} XRP`}
              />
              {/* <LineItem label="Trustline" value="0.2 XRP" />
              <LineItem label="Pool creation" value="0.2 XRP" /> */}
              <LineItem label="Liquidity pool" value={`${payload.poolAmount} XRP`} />
              <LineItem label="Motion.zip fee" value={`${motionZipFee()} XRP`} />
              <LineItem
                label="Total"
                value={`${(
                  payload.poolAmount +
                  ISSUER_CREATION_FEE +
                  TRUSTLINE_FEE +
                  LP_WALLET_CREATION_FEE +
                  LP_WALLET_TRUSTLINE_FEE +
                  POOL_CREATION_FEE +
                  motionZipFee() +
                  LP_DEV_WALLET_TRUSTLINE_FEE
                ).toLocaleString("en-us", {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                })} XRP`}
              />
            </div>
          </Card>
          <Button onClick={confirmTokenLaunch} className="w-full" disabled={isConfirming}>
            {isConfirming ? <ButtonSpinner /> : "Confirm and launch token"}
          </Button>
          <AlertDialog open={isConfirming}>
            <AlertDialogContent>
              <VisuallyHidden>
                <AlertDialogTitle>Creating your token</AlertDialogTitle>
                <AlertDialogDescription>
                  Please do not close this window or refresh the page.
                </AlertDialogDescription>
              </VisuallyHidden>
              <div className="space-y-1">
                <p className="text-center font-semibold">We&apos;re creating your token</p>
                <p className="text-center text-[13px] text-muted-foreground">
                  Please do not close this window or refresh the page.
                </p>
              </div>
              <Progress value={percentComplete} max={100} className="w-full" />
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : (
        <>
          <p className="text-sm font-medium">Verify your password</p>
          <Password />
        </>
      )}
    </div>
  );
};

const LineItem = ({ label, value }: { label: string; value: string | number }) => {
  return (
    <div className={"flex items-baseline gap-0.5"}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex-1 border-b border-dotted border-muted-foreground/30" />
      <p className="text-xs text-foreground">{value}</p>
    </div>
  );
};
