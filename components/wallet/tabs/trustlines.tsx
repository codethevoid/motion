"use client";

import { useTrustlines } from "@/hooks/use-trustlines";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { TrustlineWithMeta } from "@/hooks/use-trustlines";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PasswordDialog } from "../dialogs/password-dialog";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { EmptyState } from "./empty";
import { HandCoins } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "react-responsive";
import { cn } from "@/lib/utils";

export const Trustlines = () => {
  const { data: trustlines, isLoading, error, mutate } = useTrustlines();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTrustline, setSelectedTrustline] = useState<TrustlineWithMeta | null>(null);
  const [limit, setLimit] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [password, setPassword] = useState<string>("");
  console.log(trustlines);
  const isDesktop = useMediaQuery({ minWidth: 768 });

  if (error) return <div>Error</div>;

  if (isLoading) return <TrustlinesSkeleton />;

  if (trustlines?.length === 0 || !trustlines) {
    return <EmptyState icon={<HandCoins size={18} />} label="No trustlines found" />;
  }

  const handleUpdateLimit = async () => {
    if (!password) return setIsPasswordOpen(true);
    if (!selectedTrustline) return;
    if (limit === "0" || (limit === "" && Number(selectedTrustline.balance) > 0)) {
      toast.error("You must sell off this currency in order to remove the trustline.");
      return;
    }

    setIsUpdating(true);
    const res = await fetch("/api/trustlines/update", {
      method: "POST",
      body: JSON.stringify({ trustline: selectedTrustline, limit, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error);
      setIsUpdating(false);
      return;
    }

    toast.success("Trustline updated successfully");
    mutate();
    setIsOpen(false);
    setIsUpdating(false);
    setLimit("");
    setSelectedTrustline(null);
  };

  return (
    <>
      <ScrollArea className={cn("h-[245px]", isDesktop ? "h-[245px]" : "h-[300px]")}>
        <div className="space-y-1.5">
          {trustlines?.map((trust) => (
            <Card
              key={`${trust.currency}-${trust.account}`}
              className="cursor-pointer p-0"
              onClick={() => {
                setSelectedTrustline(trust);
                setLimit(trust.limit);
                setIsOpen(true);
              }}
            >
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center space-x-2.5">
                  {trust.icon ? (
                    <img
                      src={trust.icon}
                      alt={trust.name ? trust.name : trust.currency}
                      width={32}
                      height={32}
                      className="shrink-0 rounded-full"
                    />
                  ) : trust.account?.toLowerCase() === "rlwcx7obzmrbffrenr6escpz6gwj4xbr4v" ? (
                    <img
                      src={
                        "https://dd.dexscreener.com/ds-data/tokens/xrpl/4b454b4955530000000000000000000000000000.rlwcx7obzmrbffrenr6escpz6gwj4xbr4v.png?size=lg&key=65239e"
                      }
                      alt={trust.name ? trust.name : trust.currency}
                      className="size-8 shrink-0 rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                      {/* <Coins size={14} /> */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path d="M12.0049 4.00275C18.08 4.00275 23.0049 6.68904 23.0049 10.0027V14.0027C23.0049 17.3165 18.08 20.0027 12.0049 20.0027C6.03824 20.0027 1.18114 17.4115 1.00957 14.1797L1.00488 14.0027V10.0027C1.00488 6.68904 5.92975 4.00275 12.0049 4.00275ZM12.0049 16.0027C8.28443 16.0027 4.99537 14.9953 3.00466 13.4532L3.00488 14.0027C3.00488 15.8849 6.88751 18.0027 12.0049 18.0027C17.0156 18.0027 20.8426 15.9723 20.9999 14.1207L21.0049 14.0027L21.0061 13.4524C19.0155 14.9949 15.726 16.0027 12.0049 16.0027ZM12.0049 6.00275C6.88751 6.00275 3.00488 8.12054 3.00488 10.0027C3.00488 11.8849 6.88751 14.0027 12.0049 14.0027C17.1223 14.0027 21.0049 11.8849 21.0049 10.0027C21.0049 8.12054 17.1223 6.00275 12.0049 6.00275Z"></path>
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="text-[13px]">
                      {trust.name ? trust.name : trust.formattedCurrency}
                    </p>
                    <p className="text-xs text-muted-foreground">{trust.formattedCurrency}</p>
                  </div>
                </div>
                <div>
                  <p className="text-right text-[13px]">
                    {Number(trust.balance).toLocaleString("en-us")}
                  </p>
                  <p className="text-right text-xs text-muted-foreground">
                    {Number(trust.limit).toLocaleString("en-us")} limit
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTrustline?.name
                ? selectedTrustline.name
                : selectedTrustline?.formattedCurrency}
            </DialogTitle>
            <DialogDescription>
              You can remove a trustline by setting the limit to 0.
            </DialogDescription>
          </DialogHeader>
          <div>
            <div className="space-y-1.5">
              <Label>Limit</Label>
              <Input
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                type="number"
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" variant="secondary" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button
              size="sm"
              variant={limit === "0" || limit === "" ? "destructive" : "default"}
              onClick={handleUpdateLimit}
              disabled={isUpdating || Number(limit) < Number(selectedTrustline?.balance)}
              className="w-[69px]"
            >
              {isUpdating ? <ButtonSpinner /> : limit === "0" || limit === "" ? "Remove" : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <PasswordDialog
        isOpen={isPasswordOpen}
        setIsOpen={setIsPasswordOpen}
        setMasterPassword={setPassword}
      />
    </>
  );
};

const TrustlinesSkeleton = () => {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-[55.5px] w-full rounded-xl" />
      <Skeleton className="h-[55.5px] w-full rounded-xl" />
      <Skeleton className="h-[55.5px] w-full rounded-xl" />
    </div>
  );
};
