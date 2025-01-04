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
import { useSession } from "@/hooks/use-session";

export const CreateWalletForm = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [acknowledge, setAcknowledge] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [seed, setSeed] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [mnemonicTest, setMnemonicTest] = useState<string[]>([]);
  const [confirmMnemonic, setConfirmMnemonic] = useState<string[]>([]);
  const { mutate } = useSession();

  const handleCreateWallet = async () => {
    if (!password || !acknowledge) return;
    if (password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }
    try {
      setIsLoading(true);
      const res = await fetch("/api/onboard/create-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, acknowledge }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error);
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      console.log(data);
      setMnemonic(data.mnemonic);
      setAddress(data.classicAddress);
      setSeed(data.seed);
      setPrivateKey(data.privateKey);
      setPublicKey(data.publicKey);
      const mnemonicTestData = data.mnemonic.split(" ");
      mnemonicTestData[3] = "";
      mnemonicTestData[8] = "";
      mnemonicTestData[10] = "";
      setMnemonicTest(mnemonicTestData);
      setConfirmMnemonic(mnemonicTestData);
      setStep(2);
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      toast.error("Faild to create wallet");
      setIsLoading(false);
    }
  };

  const onConfirmMnemonic = async () => {
    let correct = true;
    mnemonic.split(" ").forEach((word, i) => {
      if (word !== confirmMnemonic[i].toLowerCase().trim()) {
        if (!correct) return;
        toast.error("Incorrect phrase");
        correct = false;
      }
    });

    if (!correct) return;

    console.log("correct phrase");
    setIsLoading(true);
    // make call to backend to set cookie and redirect to home
    try {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, seed, password, privateKey, publicKey }),
      });

      if (!res.ok) {
        setIsLoading(false);
        const data = await res.json();
        toast.error(data.error);
        return;
      }

      await mutate();
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      console.error(e);
      toast.error("Failed to complete onboarding");
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
                <p className="text-sm font-medium">Secret recovery phrase</p>
                <p className="text-[13px] text-muted-foreground">
                  Please write down your 12-word mnemonic phrase and store it in a secure location.
                  {/* Ideally a physical location. */}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                {mnemonic?.split(" ").map((word, i) => (
                  <div key={i} className="flex items-center space-x-1">
                    <p className="w-4 shrink-0 text-right text-xs text-muted-foreground">
                      {i + 1}.
                    </p>
                    <div className="w-full rounded-sm bg-card px-1.5 py-0.5">
                      <p className="text-center font-mono text-[11px]">{word}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className={cn(
                "h-0 w-1/3 space-y-4 opacity-0 transition-[opacity]",
                step === 3 && "h-auto opacity-100",
              )}
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">Confirm secret phrase</p>
                <p className="text-[13px] text-muted-foreground">
                  Please confirm your seed phrase. This is the last step to secure your wallet.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                {mnemonicTest?.map((word, i) => (
                  <div key={i}>
                    {word !== "" ? (
                      <div className="flex items-center space-x-1">
                        <p className="w-4 shrink-0 text-right text-xs text-muted-foreground">
                          {i + 1}.
                        </p>
                        <div className="w-full rounded-sm bg-card px-1.5 py-0.5">
                          <p className="text-center font-mono text-[11px]">{word}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <p className="w-4 shrink-0 text-right text-xs text-muted-foreground">
                          {i + 1}.
                        </p>
                        <Input
                          type="text"
                          className="h-[20.5px] rounded-sm bg-card px-1.5 text-[10px] shadow-none"
                          onChange={(e) => {
                            const newConfirmMnemonic = [...confirmMnemonic];
                            newConfirmMnemonic[i] = e.target.value;
                            setConfirmMnemonic(newConfirmMnemonic);
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {step === 1 && (
            <Button
              size="sm"
              onClick={handleCreateWallet}
              disabled={password.length < 8 || !acknowledge || isLoading}
              className="w-[94px]"
            >
              {isLoading ? <ButtonSpinner /> : "Create wallet"}
            </Button>
          )}
          {step === 2 && (
            <Button size="sm" onClick={() => setStep(3)}>
              Continue
            </Button>
          )}
          {step === 3 && (
            <Button
              size="sm"
              disabled={
                confirmMnemonic[3] === "" ||
                confirmMnemonic[8] === "" ||
                confirmMnemonic[10] === "" ||
                isLoading
              }
              onClick={onConfirmMnemonic}
              className="w-[66px]"
            >
              {isLoading ? <ButtonSpinner /> : "Confirm"}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};
