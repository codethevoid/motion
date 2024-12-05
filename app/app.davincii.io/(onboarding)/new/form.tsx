"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const CreateWalletForm = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  return (
    <div className="grid h-screen min-h-fit w-full place-items-center">
      <Card className="w-full max-w-sm space-y-4 overflow-hidden">
        <div className="flex items-center space-x-2">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-primary",
              step > 1 && "bg-primary text-primary-foreground",
            )}
          >
            {step > 1 ? <CheckIcon className="size-3.5" /> : <span className="text-[13px]">1</span>}
          </div>
          <Separator className={cn("transtion-all", step > 1 && "bg-primary")} />
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-all",
              step >= 2 && "border-primary",
              step === 3 && "bg-primary text-primary-foreground",
            )}
          >
            {step === 3 ? (
              <CheckIcon className="size-3.5" />
            ) : (
              <span className="text-[13px]">2</span>
            )}
          </div>
          <Separator className={cn("transtion-all", step === 3 && "bg-primary")} />
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-all",
              step === 3 && "border-primary",
            )}
          >
            <span className="text-[13px]">3</span>
          </div>
        </div>
        <div
          className={cn(
            "flex w-[300%] transition-all transition-transform duration-300",
            step === 1 && "translate-x-0",
            step === 2 && "translate-x-[-33%]",
            step === 3 && "translate-x-[-66%]",
          )}
        >
          <div
            className={cn(
              "w-[33%] space-y-4 opacity-0 transition-all",
              step === 1 && "opacity-100",
            )}
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">Create password</p>
              <p className="text-xs text-muted-foreground">
                Your password will be used to access your wallet on this device. We can not recover
                this password if you forget it.
              </p>
            </div>
            <Input type="password" placeholder="Password" className="border-transparent bg-card" />
          </div>
          <div className={cn("w-[33%] opacity-0 transition-all", step === 2 && "opacity-100")}>
            Seed phrase
          </div>
          <div className={cn("w-[33%] opacity-0 transition-all", step === 3 && "opacity-100")}>
            Confirm
          </div>
        </div>
        <Button size="sm" onClick={() => setStep((step + 1) as 1 | 2 | 3)}>
          {step === 1 ? "Create wallet" : "Next"}
        </Button>
      </Card>
    </div>
  );
};
