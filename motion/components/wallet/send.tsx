"use client";

import { Card } from "@/components/ui/card";
import { useBalances } from "@/hooks/use-balances";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Balance } from "@/hooks/use-balances";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { PasswordDialog } from "./dialogs/password-dialog";
import { toast } from "sonner";
import { TokenIcon } from "../ui/custom/token-icon";

export type SelectedToken = {
  rawCurrency: string;
  currency: string;
  issuer: string | undefined;
  value: string;
  icon: string | undefined;
  name: string | undefined;
};

const schema = z.object({
  destination: z.string().min(1, "Destination address is required"),
  value: z.string().min(1, "Amount is required"),
  destinationTag: z.string().optional(),
  memo: z.string().optional(),
});

type SendFormTypes = z.infer<typeof schema>;

export const Send = () => {
  const { data: balances, mutate, isLoading: isBalancesLoading } = useBalances();
  const [selectedToken, setSelectedToken] = useState<SelectedToken | null>();
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [filteredBalances, setFilteredBalances] = useState<Balance[]>([]);
  const [masterPassword, setMasterPassword] = useState<string>("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SendFormTypes>({
    resolver: zodResolver(schema),
  });

  const value = watch("value");
  const destination = watch("destination");

  useEffect(() => {
    if (balances) setFilteredBalances(balances);
  }, [balances]);

  const onSubmit = async (values: SendFormTypes) => {
    if (!masterPassword) {
      setIsPasswordDialogOpen(true);
      return;
    }
    try {
      setIsSending(true);
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, selectedToken, password: masterPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error);
        setIsSending(false);
        return;
      }

      toast.success("Transaction submitted");
      setIsSending(false);
      setMasterPassword("");
      setSelectedToken(null);
      setValue("value", "");
      setValue("destination", "");
      setValue("memo", "");
      setValue("destinationTag", "");
      mutate();
    } catch (e) {
      setIsSending(false);
      console.error(e);
      toast.error("Failed to send");
    }
  };

  return (
    <>
      <div className="space-y-1.5">
        <Card className="p-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              {/* <p className="text-[13px]">Send to</p> */}
              <Input
                placeholder="Destination address"
                className="bg-card"
                {...register("destination")}
                autoComplete="off"
              />
              {errors.destination && (
                <p className="text-xs text-red-500">{errors.destination.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              {/* <p className="text-[13px]">Asset</p> */}
              <Button
                className="w-full justify-between bg-card px-3 text-base hover:bg-card/50 md:text-sm"
                variant="outline"
                onClick={() => setIsOpen(true)}
              >
                {selectedToken ? (
                  <>
                    <div className="flex items-center space-x-2">
                      {selectedToken?.icon && (
                        <TokenIcon
                          url={`https://cdn.motion.zip/icons/${selectedToken.rawCurrency}/${selectedToken.issuer}`}
                          fallback={selectedToken.icon?.replace("s2", "s1")}
                          alt={selectedToken.name || selectedToken.currency}
                          className="size-5 shrink-0 rounded-full"
                        />
                      )}
                      <span>{selectedToken.currency}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground">Select asset</span>
                  </>
                )}
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </div>
            <div className="space-y-1.5">
              {/* <div className="flex items-center justify-between"> */}
              {/* <p className="text-[13px]">Amount</p> */}
              {selectedToken && (
                <p className="text-right text-xs">
                  {Number(selectedToken?.value).toLocaleString("en-us", {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}{" "}
                  <span className="text-muted-foreground">available</span>
                </p>
              )}
              {/* </div> */}
              <div className="relative">
                <Input
                  placeholder="Amount"
                  className={cn(
                    "bg-card pr-12",
                    Number(value) > Number(selectedToken?.value) && "text-red-500",
                  )}
                  type="number"
                  min={0}
                  step="any"
                  {...register("value")}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-1.5 top-1/2 h-6 -translate-y-1/2 px-2"
                  disabled={!selectedToken}
                  onClick={() => setValue("value", selectedToken?.value || "")}
                >
                  Max
                </Button>
              </div>
              {errors.value && <p className="text-xs text-red-500">{errors.value.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Input
                placeholder="Destination tag (optional)"
                className="bg-card"
                {...register("destinationTag")}
              />
            </div>
            <div className="space-y-1.5">
              {/* <p className="text-[13px]">Memo (optional)</p> */}
              <Input placeholder="Memo (optional)" className="bg-card" {...register("memo")} />
            </div>
          </div>
        </Card>
        <Button
          className="h-14 w-full rounded-2xl"
          size="lg"
          disabled={
            !selectedToken ||
            !destination ||
            !value ||
            Number(value) > Number(selectedToken?.value) ||
            isSending
          }
          onClick={handleSubmit(onSubmit)}
        >
          {isSending ? <ButtonSpinner /> : "Send"}
        </Button>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogTitle>Select asset to send</DialogTitle>
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setFilteredBalances(
                balances?.filter(
                  (balance) =>
                    balance.currency.toLowerCase().includes(e.target.value.toLowerCase().trim()) ||
                    balance.name?.toLowerCase().includes(e.target.value.toLowerCase().trim()),
                ) || [],
              );
            }}
            className="bg-card"
          />
          <ScrollArea className="h-[400px] max-md:h-[320px]">
            {isBalancesLoading ? (
              <div className="flex h-[200px] w-full items-center justify-center">
                <ButtonSpinner />
              </div>
            ) : (
              <div>
                {filteredBalances?.map((balance) => (
                  <div
                    key={`${balance.currency}-${balance.issuer}`}
                    className="mr-4 flex w-full items-center space-x-2.5 rounded-2xl px-2.5 py-2 transition-colors hover:bg-secondary/50"
                    role="button"
                    onClick={() => {
                      setSelectedToken(balance);
                      setValue("value", "");
                      setIsOpen(false);
                    }}
                  >
                    <TokenIcon
                      url={`https://cdn.motion.zip/icons/${balance.rawCurrency}/${balance.issuer}`}
                      fallback={balance.icon?.replace("s2", "s1")}
                      alt={balance.name || balance.currency}
                    />
                    <div className="w-full">
                      <p className="text-[13px]">{balance.name || balance.currency}</p>
                      <div className="flex w-full items-center justify-between space-x-1">
                        <p className="text-xs text-muted-foreground">{balance.currency}</p>
                        <p className="text-xs text-muted-foreground">
                          {/* {balance.issuer?.slice(0, 6)}...{balance.issuer?.slice(-4)} */}
                          {Number(balance.value).toLocaleString("en-us", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <PasswordDialog
        isOpen={isPasswordDialogOpen}
        setIsOpen={setIsPasswordDialogOpen}
        setMasterPassword={setMasterPassword}
      />
    </>
  );
};
