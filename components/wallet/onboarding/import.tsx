"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { CheckIcon, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/use-session";

export const ImportWalletForm = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [acknowledge, setAcknowledge] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mnemonic, setMnemonic] = useState("");
  const [seed, setSeed] = useState("");
  const [method, setMethod] = useState<"mnemonic" | "seed" | null>(null);
  const { mutate } = useSession();

  const onImportWallet = async () => {
    if (method === "mnemonic" && !mnemonic) return;
    if (method === "seed" && !seed) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/onboard/import-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, acknowledge, mnemonic, seed, method }),
      });

      if (!res.ok) {
        setIsLoading(false);
        const data = await res.json();
        toast.error(data.error);
        return;
      }

      await mutate();
      setIsLoading(false);
    } catch {
      setIsLoading(false);
      toast.error("Error importing wallet");
    }
  };

  return (
    <div>
      <div>
        <Card className="w-full space-y-4 overflow-hidden p-4">
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-primary",
                step > 1 && "bg-primary text-primary-foreground",
              )}
            >
              {step > 1 ? (
                <CheckIcon className="size-3.5" />
              ) : (
                <span className="text-[13px]">1</span>
              )}
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
              "flex w-[300%] transition-all duration-300",
              step === 1 && "translate-x-0",
              step === 2 && "-translate-x-1/3",
              step === 3 && "-translate-x-2/3",
            )}
          >
            <div
              className={cn(
                "h-0 w-1/3 space-y-4 opacity-0 transition-[opacity]",
                step === 1 && "h-auto opacity-100",
              )}
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">Create password</p>
                <p className="text-[13px] text-muted-foreground">
                  Your password will be used to access your wallet on this device.
                  {/* We can not recover this password if you forget it. */}
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
              <div className="flex space-x-2">
                <Checkbox
                  id="acknowledge"
                  checked={acknowledge}
                  onCheckedChange={(value: boolean) => setAcknowledge(value)}
                  className="relative top-[1px]"
                />
                <Label htmlFor="acknowledge" className="leading-[16px]">
                  I understand this password can not be recovered
                </Label>
              </div>
            </div>
            <div
              className={cn(
                "h-0 w-1/3 space-y-4 opacity-0 transition-[opacity]",
                step === 2 && "h-auto opacity-100",
              )}
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">Select import method</p>
                <p className="text-[13px] text-muted-foreground">
                  Select to import your wallet using a mnemonic word phrase or your wallet&apos;s
                  family seed.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div>
                  <Button
                    variant="outline"
                    className="w-full hover:border-primary hover:bg-background"
                    onClick={() => {
                      setMethod("mnemonic");
                      setStep(3);
                    }}
                  >
                    Mnemonic
                  </Button>
                </div>
                <div>
                  <Button
                    variant="outline"
                    className="w-full hover:border-primary hover:bg-background"
                    onClick={() => {
                      setMethod("seed");
                      setStep(3);
                    }}
                  >
                    Seed
                  </Button>
                </div>
              </div>
            </div>
            <div
              className={cn(
                "h-0 w-1/3 space-y-4 opacity-0 transition-[opacity]",
                step === 3 && "h-auto opacity-100",
              )}
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {method === "mnemonic" ? "Secret recovery phrase" : "Wallet seed"}
                </p>
                <p className="text-[13px] text-muted-foreground">
                  {method === "mnemonic"
                    ? "Please enter your mnemonic phrase to import your wallet."
                    : "Please enter your wallet's family seed."}
                </p>
              </div>

              {method === "mnemonic" ? (
                <Textarea
                  className="h-20 w-full rounded-md bg-card"
                  placeholder="Enter your mnemonic phrase"
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                />
              ) : (
                <Input
                  className="w-full rounded-md bg-card"
                  placeholder="Family seed"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                />
              )}
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
          {step === 3 && (
            <Button size="sm" onClick={onImportWallet} disabled={isLoading} className="w-[92px]">
              {isLoading ? <ButtonSpinner /> : "Import wallet"}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};
