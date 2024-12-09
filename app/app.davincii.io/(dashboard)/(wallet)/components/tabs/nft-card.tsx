"use client";

import { useEffect, useState } from "react";
import type { Wallet } from "@/hooks/use-wallet";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

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
    <div>
      {metadata.image ? (
        <img
          src={metadata.image}
          alt={metadata.name || `#${nft.id}`}
          className="aspect-square cursor-pointer rounded-xl object-cover transition-all hover:opacity-90"
        />
      ) : (
        <Card className="flex aspect-square h-auto cursor-pointer items-center justify-center p-2 hover:opacity-90">
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
    </div>
  );
};

const NftCardSkeleton = () => {
  return <Skeleton className="aspect-square w-full rounded-xl"></Skeleton>;
};
