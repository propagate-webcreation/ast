"use client";

import { useEffect, useState } from "react";
import { MOBILE_VIEWPORT_MAX_WIDTH } from "./constants";

export type LpViewportScale = {
  scale: number;
  baseWidth: number;
};

function getLpViewportScale(viewportWidth: number): LpViewportScale {
  if (viewportWidth > MOBILE_VIEWPORT_MAX_WIDTH) {
    return {
      scale: Math.min(viewportWidth / MOBILE_VIEWPORT_MAX_WIDTH, 1.6),
      baseWidth: MOBILE_VIEWPORT_MAX_WIDTH,
    };
  }
  return {
    scale: 1,
    baseWidth: viewportWidth,
  };
}

/** MobileViewport の transform scale と同じ値（追従ヘッダー等の Portal 用） */
export function useLpViewportScale(): LpViewportScale {
  const [layout, setLayout] = useState<LpViewportScale>(() =>
    typeof window === "undefined"
      ? { scale: 1, baseWidth: MOBILE_VIEWPORT_MAX_WIDTH }
      : getLpViewportScale(window.innerWidth),
  );

  useEffect(() => {
    const update = () => setLayout(getLpViewportScale(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return layout;
}
