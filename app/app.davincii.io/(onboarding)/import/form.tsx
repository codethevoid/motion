"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { CheckIcon, EyeOff, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

export const ImportWalletForm = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [acknowledge, setAcknowledge] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const router = useRouter();

  const onImportWallet = async () => {
    if (!mnemonic) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/onboard/import-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, acknowledge, mnemonic }),
      });

      if (!res.ok) {
        setIsLoading(false);
        const data = await res.json();
        toast.error(data.error);
        return;
      }

      router.push("/");
    } catch (e) {
      setIsLoading(false);
      toast.error("Error importing wallet");
    }
  };

  return (
    <div className="grid min-h-screen w-full place-items-center px-4 py-12">
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
            )}
          >
            <span className="text-[13px]">2</span>
          </div>
        </div>
        <div
          className={cn(
            "flex w-[200%] transition-all duration-300",
            step === 1 && "translate-x-0",
            step === 2 && "-translate-x-1/2",
          )}
        >
          <div
            className={cn(
              "h-0 w-1/2 space-y-4 opacity-0 transition-[opacity]",
              step === 1 && "h-auto opacity-100",
            )}
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">Create password</p>
              <p className="text-[13px] text-muted-foreground">
                Your password will be used to access your wallet on this device. We can not recover
                this password if you forget it.
              </p>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="bg-card pr-9 shadow-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                className="absolute right-0 top-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
                size="icon"
                variant="ghost"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="acknowledge"
                checked={acknowledge}
                onCheckedChange={(value: boolean) => setAcknowledge(value)}
              />
              <Label htmlFor="acknowledge">I understand this password can not be recovered</Label>
            </div>
          </div>
          <div
            className={cn(
              "h-0 w-1/2 space-y-4 opacity-0 transition-[opacity]",
              step === 2 && "h-auto opacity-100",
            )}
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">Secret recovery phrase</p>
              <p className="text-[13px] text-muted-foreground">
                Please enter your mnemonic phrase to import your wallet. Sepearate each word with a
                space.
              </p>
            </div>

            <Textarea
              className="h-20 w-full rounded-md bg-card"
              placeholder="Enter your mnemonic phrase"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
            />
          </div>
        </div>
        {step === 1 && (
          <Button
            size="sm"
            disabled={password.length < 8 || !acknowledge || isLoading}
            onClick={() => setStep(2)}
          >
            {isLoading ? <ButtonSpinner /> : "Create password"}
          </Button>
        )}
        {step === 2 && (
          <Button size="sm" onClick={onImportWallet} disabled={isLoading} className="w-[92px]">
            {isLoading ? <ButtonSpinner /> : "Import wallet"}
          </Button>
        )}
      </Card>
    </div>
  );
};
