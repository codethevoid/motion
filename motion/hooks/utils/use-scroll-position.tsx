"use client";

import { useState, useEffect } from "react";

export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isFirstRender, setIsFirstRender] = useState(true);

  const handleScroll = () => setScrollPosition(window.scrollY);

  const handleFirstRender = () => {
    handleScroll();
    setIsFirstRender(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    if (isFirstRender) handleFirstRender();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollPosition;
};
