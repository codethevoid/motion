"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/ui/copy-button";
import { useAffiliate } from "@/hooks/use-affiliate";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { AffiliateDialog } from "./dialogs/affiliate";
import { useState } from "react";
import { defaultMetadata } from "@/utils/construct-metadata";

const defaultTitle = defaultMetadata.title;
const defaultImage = defaultMetadata.image;

export const Affiliate = () => {
  const { data, isLoading, error } = useAffiliate();
  console.log(data);

  if (error) return <div>An error occured</div>;

  return (
    <>
      <div className="space-y-1.5">
        <Card className="space-y-4 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Total earnings</p>
            {isLoading ? (
              <Skeleton className="h-[33.5px] w-full rounded-md" />
            ) : (
              <div className="rounded-md border bg-secondary/40 px-2 py-1.5">
                <p className="text-[13px] font-medium">
                  <span className="font-mono text-xs tracking-tight">
                    {data?.totalReferralsInXrp.toLocaleString("en-us", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}{" "}
                    XRP
                  </span>
                </p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">My affiliate link</p>
              <p className="text-[13px] text-muted-foreground">
                When someone uses your link to create/import a wallet, you will receive 25% of their
                trading fees.
              </p>
            </div>
            {isLoading ? (
              <Skeleton className="h-7 w-full max-w-[300px] rounded-sm" />
            ) : (
              <div className="flex min-w-0 max-w-fit items-center justify-between space-x-2 rounded-sm bg-secondary px-2 py-1.5">
                <div className="flex items-center space-x-2">
                  <img
                    src={`https://api.dicebear.com/9.x/glass/png?seed=${data?.referralKey}`}
                    alt="wallet avatar"
                    className="h-4 w-4 rounded-full"
                  />
                  <p className="min-w-0 truncate font-mono text-[11px] tracking-tight">
                    go.tokenos.one/{data?.referralKey}
                  </p>
                </div>
                {data?.referralKey && (
                  <CopyButton text={`https://go.tokenos.one/${data.referralKey}`} />
                )}
              </div>
            )}
          </div>
          <div className="space-y-2">
            {/* <p className="text-sm font-medium">Your link preview</p> */}
            {isLoading ? (
              <LoadingPreview />
            ) : (
              <XPreview
                image={data?.referralImage || defaultImage}
                title={data?.referralTitle || defaultTitle}
                referralKey={data?.referralKey || ""}
              />
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

const XPreview = ({
  image,
  title,
  referralKey,
}: {
  image: string;
  title: string;
  referralKey: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-3"
            >
              <path d="M10.4883 14.651L15.25 21H22.25L14.3917 10.5223L20.9308 3H18.2808L13.1643 8.88578L8.75 3H1.75L9.26086 13.0145L2.31915 21H4.96917L10.4883 14.651ZM16.25 19L5.75 5H7.75L18.25 19H16.25Z"></path>
            </svg>
            <span className="text-[13px] font-medium">X (formerly Twitter)</span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="flex size-6 rounded-[7px] text-muted-foreground"
            onClick={() => setIsOpen(true)}
          >
            <Pencil size={12} />
          </Button>
        </div>
        <div className="space-y-1">
          <div className="relative aspect-[1200/630]">
            <img
              src={image || defaultImage}
              width={1200}
              height={630}
              alt={title}
              className="h-full w-full cursor-pointer rounded-lg object-cover transition-all hover:opacity-80"
              onClick={() => setIsOpen(true)}
            />

            <div className="absolute bottom-2 left-2 right-2 max-w-fit rounded-[6px] bg-black/70 px-1.5 py-0.5">
              <p className="truncate text-xs text-white">{title || defaultTitle}</p>
            </div>
          </div>
          <p className="ml-1 line-clamp-1 text-xs text-muted-foreground">From tokenos.one</p>
        </div>
      </div>
      <AffiliateDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={title || defaultTitle}
        image={image || defaultImage}
        slug={referralKey}
      />
    </>
  );
};

const LoadingPreview = () => {
  return (
    <Skeleton className="mt-3 flex h-36 w-full flex-col items-center justify-center space-y-2 rounded-lg border" />
  );
};
