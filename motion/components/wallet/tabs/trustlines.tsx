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
import { TokenIcon } from "@/components/ui/custom/token-icon";

export const Trustlines = () => {
  const { data: trustlines, isLoading, error, mutate } = useTrustlines();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTrustline, setSelectedTrustline] = useState<TrustlineWithMeta | null>(null);
  const [limit, setLimit] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [password, setPassword] = useState<string>("");
  const isDesktop = useMediaQuery({ minWidth: 768 });

  if (error) return <div>Error</div>;

  if (isLoading) return <TrustlinesSkeleton isDesktop={isDesktop} />;

  if (trustlines?.length === 0 || !trustlines) {
    return <EmptyState icon={<HandCoins size={18} />} label="No trustlines found" />;
  }

  const handleUpdateLimit = async () => {
    if (!password) return setIsPasswordOpen(true);
    if (!selectedTrustline) return;
    if (limit === "0" && Number(selectedTrustline.balance) > 0) {
      toast.error("You must sell off this currency in order to remove the trustline.");
      return;
    }
    if (limit === "" && Number(selectedTrustline.balance) > 0) {
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
              className="cursor-pointer p-0 transition-all hover:border-border dark:hover:bg-secondary/60"
              onClick={() => {
                setSelectedTrustline(trust);
                setLimit(trust.limit);
                setIsOpen(true);
              }}
            >
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center space-x-2.5">
                  <TokenIcon
                    url={`https://cdn.motion.zip/${trust.currency}/${trust.account}`}
                    fallback={trust.icon}
                    alt={trust.name ? trust.name : trust.formattedCurrency}
                  />
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

const TrustlinesSkeleton = ({ isDesktop }: { isDesktop: boolean }) => {
  return (
    <div className={cn("h-[245px] space-y-1.5", isDesktop ? "h-[245px]" : "h-[300px]")}>
      <Skeleton className="h-[55.5px] w-full rounded-xl" />
      <Skeleton className="h-[55.5px] w-full rounded-xl" />
      <Skeleton className="h-[55.5px] w-full rounded-xl" />
    </div>
  );
};
