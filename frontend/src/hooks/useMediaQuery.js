/**
 * useMediaQuery.js
 * Simple hook to detect screen size.
 *
 * USAGE:
 *   import { useIsMobile } from "@/hooks/useMediaQuery";
 *   const isMobile = useIsMobile(); // true when screen < 768px
 */

import { useState, useEffect } from "react";

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
};

/** Convenience: returns true when viewport width < 768px */
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");