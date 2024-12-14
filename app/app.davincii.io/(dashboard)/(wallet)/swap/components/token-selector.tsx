import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTokenOptions } from "@/hooks/use-token-options";
import { useState } from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Token } from "@/hooks/use-token-options";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectingFor: "from" | "to";
  setFrom: (from: Token | null) => void;
  setTo: (to: Token | null) => void;
};

export const TokenSelector = ({ isOpen, setIsOpen, selectingFor, setFrom, setTo }: Props) => {
  const [nameLike, setNameLike] = useState<string>("");
  const { tokens, isLoading: isLoadingTokens } = useTokenOptions(nameLike);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm" aria-describedby={undefined}>
        <DialogTitle>Select a token</DialogTitle>
        <Input
          placeholder="Search"
          value={nameLike}
          onChange={(e) => setNameLike(e.target.value)}
          className="bg-card"
        />
        <ScrollArea className="h-[400px]">
          {isLoadingTokens ? (
            <TokensSkeleton />
          ) : (
            <div>
              {tokens?.map((token) => (
                <div
                  key={`${token.rawCurrency}-${token.issuer}`}
                  className="mr-4 flex w-full items-center space-x-2.5 rounded-2xl px-2.5 py-2 transition-colors hover:bg-secondary/50"
                  role="button"
                  onClick={() => {
                    if (selectingFor === "from") {
                      setFrom(token);
                      setNameLike("");
                    } else {
                      setTo(token);
                      setNameLike("");
                    }
                    setIsOpen(false);
                  }}
                >
                  {token?.icon ? (
                    <img
                      src={token.icon}
                      alt={token.currency}
                      width={32}
                      height={32}
                      className="size-7 shrink-0 rounded-full"
                    />
                  ) : (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-4"
                      >
                        <path d="M12.0049 4.00275C18.08 4.00275 23.0049 6.68904 23.0049 10.0027V14.0027C23.0049 17.3165 18.08 20.0027 12.0049 20.0027C6.03824 20.0027 1.18114 17.4115 1.00957 14.1797L1.00488 14.0027V10.0027C1.00488 6.68904 5.92975 4.00275 12.0049 4.00275ZM12.0049 16.0027C8.28443 16.0027 4.99537 14.9953 3.00466 13.4532L3.00488 14.0027C3.00488 15.8849 6.88751 18.0027 12.0049 18.0027C17.0156 18.0027 20.8426 15.9723 20.9999 14.1207L21.0049 14.0027L21.0061 13.4524C19.0155 14.9949 15.726 16.0027 12.0049 16.0027ZM12.0049 6.00275C6.88751 6.00275 3.00488 8.12054 3.00488 10.0027C3.00488 11.8849 6.88751 14.0027 12.0049 14.0027C17.1223 14.0027 21.0049 11.8849 21.0049 10.0027C21.0049 8.12054 17.1223 6.00275 12.0049 6.00275Z"></path>
                      </svg>
                    </div>
                  )}
                  <div className="w-full">
                    <p className="text-[13px]">{token.name || token.currency}</p>
                    <div className="flex w-full items-center justify-between space-x-1">
                      <p className="text-xs text-muted-foreground">{token.currency}</p>
                      <p className="text-xs text-muted-foreground">
                        {token.issuer.slice(0, 6)}...{token.issuer.slice(-4)}
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
  );
};

const TokensSkeleton = () => {
  return (
    <div className="flex flex-col space-y-1.5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-2.5 rounded-2xl px-2.5 py-2">
          <Skeleton className="size-7 shrink-0 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-[14px] w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};
