"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { type TokenSchema, tokenSchema } from "shared/zod/token";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef } from "react";
import { Image, InfoIcon } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  MOTION_ZIP_FEE,
  POOL_CREATION_FEE,
  LP_WALLET_CREATION_FEE,
  LP_WALLET_TRUSTLINE_FEE,
  TRUSTLINE_FEE,
  ISSUER_CREATION_FEE,
  LP_DEV_WALLET_TRUSTLINE_FEE,
} from "shared/constants/fee-structure";
import { useWalletActions } from "@/components/wallet/context";
import { useSession } from "@/hooks/use-session";
import { RainbowButton } from "@/components/ui/rainbow-button";

const motionZipFee = () => {
  return process.env.NODE_ENV === "development" ? 0 : MOTION_ZIP_FEE;
};

export const LaunchClient = () => {
  const [icon, setIcon] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const { setPayload, setIsOpen } = useWalletActions();
  const { hasWallet } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TokenSchema>({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      devAllocation: 0,
      poolFee: 0,
      poolAmount: 50,
    },
  });

  const onSubmit = (data: TokenSchema) => {
    setPayload({ ...data });
    setIsOpen(true);
  };

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>, type: "icon" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // make sure file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // make sure file size is less than 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    if (type === "icon") {
      setIcon(file);
      setValue("icon", file, { shouldValidate: true });
    } else {
      setBanner(file);
      setValue("banner", file, { shouldValidate: true });
    }
  };

  console.log(errors);
  return (
    <div className="py-16">
      <Card className="mx-auto max-w-md space-y-4 p-4">
        <div className="space-y-1.5">
          <CardTitle>Launch your token</CardTitle>
          <CardDescription>
            Fill out the form to launch your token.
            {/* <a
              href="https://docs.motion.zip/launch-token"
              target="_blank"
              className="text-foreground underline"
            >
              Learn more
            </a> */}
          </CardDescription>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Basic information</p>
            <div className="space-y-1.5">
              <Input
                id="name"
                placeholder="Token name"
                {...register("name")}
                className="bg-card"
                autoComplete="off"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Input
                id="ticker"
                placeholder="Ticker (e.g. BOX)"
                {...register("ticker")}
                className="bg-card"
                autoComplete="off"
              />
              {errors.ticker && <p className="text-xs text-red-500">{errors.ticker.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Textarea
                id="description"
                placeholder="Description"
                {...register("description")}
                className="h-20 bg-card"
                autoComplete="off"
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>
          </div>
          <div className="w-full border-t border-dashed" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Artwork</p>
            <div className="space-y-1.5">
              <Card className="flex items-center space-x-2.5 !bg-card p-3">
                <input
                  hidden
                  type="file"
                  ref={iconInputRef}
                  onChange={(e) => handleImageInput(e, "icon")}
                  accept="image/*"
                />
                {icon ? (
                  <img
                    src={URL.createObjectURL(icon)}
                    alt="icon"
                    className="size-12 cursor-pointer rounded-md border object-cover transition-all hover:opacity-80"
                    onClick={() => iconInputRef.current?.click()}
                  />
                ) : (
                  <div
                    role="button"
                    className="flex size-12 cursor-pointer items-center justify-center rounded-lg border border-dashed bg-secondary/30 transition-all hover:opacity-80"
                    onClick={() => iconInputRef.current?.click()}
                  >
                    <Image className="size-4 text-muted-foreground" />
                  </div>
                )}
                <div className="space-y-0.5">
                  <p className="text-[13px] font-medium">Your primary icon/logo</p>
                  <p className="text-xs text-muted-foreground">1:1 aspect ratio recommended</p>
                </div>
              </Card>
              {errors.icon && <p className="text-xs text-red-500">{errors.icon.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Card className="space-y-2.5 !bg-card p-3">
                <div className="space-y-0.5">
                  <p className="text-[13px] font-medium">Your banner</p>
                  <p className="text-xs text-muted-foreground">
                    We recommend a banner size of 1200x630 pixels
                  </p>
                </div>
                <input
                  hidden
                  type="file"
                  ref={bannerInputRef}
                  onChange={(e) => handleImageInput(e, "banner")}
                  accept="image/*"
                />
                {banner ? (
                  <img
                    src={URL.createObjectURL(banner)}
                    alt="banner"
                    className="aspect-[1200/630] cursor-pointer rounded-md border object-cover transition-all hover:opacity-80"
                    onClick={() => bannerInputRef.current?.click()}
                  />
                ) : (
                  <div
                    role="button"
                    className="flex aspect-[1200/630] cursor-pointer items-center justify-center rounded-lg border border-dashed bg-secondary/20 transition-all hover:opacity-80"
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    <Image className="size-4 text-muted-foreground" />
                  </div>
                )}
              </Card>
              {errors.banner && <p className="text-xs text-red-500">{errors.banner.message}</p>}
            </div>
          </div>
          <div className="w-full border-t border-dashed" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Supply and allocations</p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Input
                  step={1}
                  type="number"
                  placeholder="Supply"
                  {...register("supply", { valueAsNumber: true })}
                  className={cn("bg-card", watch("supply") > 1_000_000_000 && "text-red-500")}
                />
                <p className="flex gap-1.5 text-xs text-muted-foreground">
                  <InfoIcon className="relative top-[1px] size-[14px] shrink-0" />
                  <span>The total supply of your token. Between 10k and 1 trillion.</span>
                </p>
                {errors.supply && <p className="text-xs text-red-500">{errors.supply.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Card className="space-y-2.5 !bg-card p-3 pb-4">
                  <div className="space-y-0.5">
                    <p className="text-[13px] font-medium">Dev token allocation</p>
                    <p className="text-xs text-muted-foreground">
                      The amount of tokens allocated to the dev team.
                    </p>
                  </div>
                  <p className="font-mono font-semibold tracking-tight">
                    {(
                      (watch("supply") || 0) *
                      ((watch("devAllocation") || 0) / 100)
                    ).toLocaleString("en-us", { maximumFractionDigits: 2 })}{" "}
                    ({watch("devAllocation") || 0}%)
                  </p>
                  <Slider
                    min={0}
                    max={50} // 50%
                    step={1}
                    onValueChange={(value) => {
                      setValue("devAllocation", value[0], { shouldValidate: true });
                    }}
                    className="pt-1"
                  />
                </Card>
                {errors.devAllocation && (
                  <p className="text-xs text-red-500">{errors.devAllocation.message}</p>
                )}
              </div>
            </div>
          </div>
          <div className="w-full border-t border-dashed" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Liquidity pool</p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Input
                  type="number"
                  placeholder="Initial XRP LP"
                  {...register("poolAmount", { valueAsNumber: true })}
                  className={cn(
                    "bg-card",
                    watch("poolAmount") > 1_000_000_000_000 && "text-red-500",
                  )}
                />
                <p className="flex gap-1.5 text-xs text-muted-foreground">
                  <InfoIcon className="relative top-[1px] size-[14px] shrink-0" />
                  <span>The amount of XRP to add to the liquidity pool.</span>
                </p>
                {errors.poolAmount && (
                  <p className="text-xs text-red-500">{errors.poolAmount.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Card className="space-y-2.5 !bg-card p-3 pb-4">
                  <div className="space-y-0.5">
                    <p className="text-[13px] font-medium">Liquidity pool fee</p>
                    <p className="text-xs text-muted-foreground">
                      The initial fee for the liquidity pool.
                    </p>
                  </div>
                  <p className="font-mono font-semibold tracking-tight">{watch("poolFee") || 0}%</p>
                  <Slider
                    min={0}
                    max={1}
                    step={0.001}
                    defaultValue={[0]}
                    onValueChange={(value) => {
                      setValue("poolFee", value[0], { shouldValidate: true });
                    }}
                    className="pt-1"
                  />
                </Card>
                {errors.poolFee && <p className="text-xs text-red-500">{errors.poolFee.message}</p>}
              </div>
            </div>
          </div>
          <div className="border-t border-dashed" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Community</p>
            <div className="space-y-1.5">
              <Input placeholder="Website" {...register("website")} className="bg-card" />
              {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Input placeholder="Telegram" {...register("telegram")} className="bg-card" />
              {errors.telegram && <p className="text-xs text-red-500">{errors.telegram.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Input placeholder="X" {...register("x")} className="bg-card" />
              {errors.x && <p className="text-xs text-red-500">{errors.x.message}</p>}
            </div>
          </div>
          <div className="w-full border-t border-dashed" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Summary</p>
            <Card className="space-y-0.5 p-3">
              <LineItem
                label="Token creation"
                value={`${(ISSUER_CREATION_FEE + TRUSTLINE_FEE + LP_DEV_WALLET_TRUSTLINE_FEE + LP_WALLET_CREATION_FEE + LP_WALLET_TRUSTLINE_FEE + POOL_CREATION_FEE).toFixed(2)} XRP`}
              />
              {/* <LineItem label="Trustline" value="0.2 XRP" />
              <LineItem label="Pool creation" value="0.2 XRP" /> */}
              <LineItem label="Liquidity pool" value={`${watch("poolAmount") || 0} XRP`} />
              <LineItem label="Motion.zip fee" value={`${motionZipFee()} XRP`} />
              <LineItem
                label="Total"
                value={`${(
                  (watch("poolAmount") || 0) +
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
            </Card>
          </div>
          {hasWallet ? (
            <Button type="submit" size="lg" className="w-full">
              Launch token
            </Button>
          ) : (
            <RainbowButton
              className="h-10 w-full"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(true);
              }}
            >
              Connect wallet
            </RainbowButton>
          )}
        </form>
      </Card>
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
