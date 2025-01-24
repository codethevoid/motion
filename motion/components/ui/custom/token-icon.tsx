"use client";

import { useState } from "react";
import { Coin } from "../icons/coin";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const TokenIcon = ({
  url,
  fallback,
  alt,
  className,
}: {
  url: string;
  fallback?: string;
  alt: string;
  className?: string;
}) => {
  const [isError, setIsError] = useState(false);

  return (
    <>
      {isError ? (
        fallback ? (
          <img
            src={fallback}
            alt={alt}
            className={cn("size-8 shrink-0 rounded-full object-cover", className)}
          />
        ) : (
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full border border-border/80 bg-secondary/40",
              className,
            )}
          >
            <Coin />
          </div>
        )
      ) : (
        <Image
          src={url}
          alt={alt}
          height={300}
          width={300}
          className={cn("size-8 shrink-0 rounded-full object-cover", className)}
          onError={() => setIsError(true)}
        />
      )}
    </>
  );
};
