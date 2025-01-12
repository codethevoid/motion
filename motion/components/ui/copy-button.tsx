"use client";

import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const CopyButton: FC<{
  text: string;
  className?: string;
  variant?: "ghost" | "outline" | "default";
}> = ({ text, className, variant }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator?.clipboard?.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Button
      size="icon"
      variant={variant || "ghost"}
      className={cn(
        "relative flex h-4 w-4 shrink-0 items-center justify-center rounded-md",
        className,
      )}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isCopied) return;
        await copyToClipboard();
      }}
    >
      <Check
        className={cn("absolute h-3.5 w-3.5 transition-all", isCopied ? "scale-100" : "scale-0")}
      />
      <Copy
        size={10}
        className={cn("h-3.5 w-3.5 transition-all", isCopied ? "scale-0" : "scale-100")}
      />
    </Button>
  );
};
