import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";

export const GradientBadge = ({
  text,
  ...props
}: { text: string } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <AnimatedGradientText {...props}>
      ✨ <hr className="mx-2 h-4 w-px shrink-0 bg-border" />{" "}
      <span
        className={cn(
          `inline animate-gradient bg-gradient-to-r from-primary to-primary bg-[length:var(--bg-size)_100%] bg-clip-text text-[13px] text-transparent`,
        )}
      >
        {text}
      </span>
      <ChevronRight className="ml-1 size-3 text-muted-foreground transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
    </AnimatedGradientText>
  );
};

// from-[#ffaa40] via-[#9c40ff] to-[#ffaa40]
