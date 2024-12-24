"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Particles from "@/components/ui/particles";

export function ParticlesBg() {
  const { resolvedTheme } = useTheme();
  const [color, setColor] = useState("#ffffff");

  // useEffect(() => {
  //   setColor(resolvedTheme === "dark" ? "#ffffff" : "#000000");
  // }, [resolvedTheme]);

  if (process.env.NODE_ENV === "development") {
    return null;
  }

  return (
    <Particles
      className="absolute inset-0 -top-20 z-[-1] max-sm:-top-16"
      quantity={100}
      ease={80}
      color={"#ffffff"}
      // refresh
    />
  );
}
