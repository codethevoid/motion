"use client";

import { useEffect, useState } from "react";
import type { Wallet } from "@/hooks/use-wallet";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";

type NftCardProps = {
  nft: Wallet["nfts"][number];
};

type NftMetadata = {
  name?: string;
  image?: string;
  category?: string;
  description?: string;
  collection?: {
    name?: string;
    description?: string;
  };
};

export const NftCard = ({ nft }: NftCardProps) => {
  const [metadata, setMetadata] = useState<NftMetadata>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!nft.uri) return setIsLoading(false);

    if (nft.isDirectImage) {
      setMetadata({ image: nft.uri });
      setIsLoading(false);
      return;
    }

    fetch(nft.uri)
      .then((res) => res.json())
      .then((data) => {
        if (!data || typeof data !== "object") return setIsLoading(false);
        console.log(data);
        const img = data.image || data.image_url;
        const imgUrl = img
          ? img
              .replace("ipfs://ipfs/", "https://ipfs.io/ipfs/")
              .replace("ipfs://", "https://ipfs.io/ipfs/")
          : null;

        const { image, image_url, ...rest } = data;
        setMetadata({ ...rest, image: imgUrl });
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) return <NftCardSkeleton />;

  return (
    <>
      {metadata.image ? (
        <img
          src={metadata.image}
          alt={metadata.name || `#${nft.id}`}
          className="aspect-square cursor-pointer rounded-xl object-cover transition-all hover:opacity-90"
          onClick={() => setIsOpen(true)}
        />
      ) : (
        <Card
          className="flex aspect-square h-auto cursor-pointer items-center justify-center p-2 hover:opacity-90"
          onClick={() => setIsOpen(true)}
        >
          <div className="space-y-2">
            <div className="mx-auto w-fit">
              <ImageIcon size={16} />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {metadata.name || `#${nft.id}`}
            </p>
          </div>
        </Card>
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent aria-describedby={undefined} className="w-auto">
          <DialogTitle className="hidden">{metadata?.name || `#${nft.id}`}</DialogTitle>
          {metadata.image ? (
            <img
              src={metadata.image}
              alt={metadata.name || `#${nft.id}`}
              className="aspect-square max-w-[300px] rounded-xl object-cover"
            />
          ) : (
            <Card className="flex aspect-square h-auto w-[240px] items-center justify-center p-2">
              <div className="space-y-2">
                <div className="mx-auto w-fit">
                  <ImageIcon size={16} />
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  {metadata.name || `#${nft.id}`}
                </p>
              </div>
            </Card>
          )}
          <div className="space-y-2.5">
            {metadata?.name && (
              <div>
                <p className="text-[13px] font-medium">Name</p>
                <p className="text-[13px] text-muted-foreground">{metadata.name}</p>
              </div>
            )}
            {metadata?.collection?.name && (
              <div>
                <p className="text-[13px] font-medium">Collection</p>
                <p className="text-[13px] text-muted-foreground">{metadata.collection.name}</p>
              </div>
            )}
            <div>
              <p className="text-[13px] font-medium">Issuer</p>
              <div className="flex">
                <a
                  href={`https://xrpscan.com/account/${nft.issuer}`}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 truncate text-[13px] text-blue-500 hover:underline"
                >
                  {nft.issuer}
                </a>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button size="sm" variant="secondary" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button size="sm" asChild>
              <a href={`https://xrpscan.com/nft/${nft.id}`} target="_blank" rel="noreferrer">
                View on XRPScan
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const NftCardSkeleton = () => {
  return <Skeleton className="aspect-square w-full rounded-xl"></Skeleton>;
};
