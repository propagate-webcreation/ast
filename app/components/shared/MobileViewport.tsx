"use client";

import { useEffect, useRef } from "react";
import { MOBILE_VIEWPORT_MAX_WIDTH } from "./constants";

type MobileViewportProps = {
  children: React.ReactNode;
};

export default function MobileViewport({ children }: MobileViewportProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const vw = window.innerWidth;
      if (vw > MOBILE_VIEWPORT_MAX_WIDTH) {
        const scale = Math.min(vw / MOBILE_VIEWPORT_MAX_WIDTH, 1.6);
        el.style.transform = `scale(${scale})`;
        el.style.transformOrigin = "top center";
        el.style.width = `${MOBILE_VIEWPORT_MAX_WIDTH}px`;
        el.style.margin = "0 auto";
        const contentHeight = el.scrollHeight * scale;
        el.style.height = `${el.scrollHeight}px`;
        if (el.parentElement) {
          el.parentElement.style.height = `${contentHeight}px`;
        }
      } else {
        el.style.transform = "";
        el.style.transformOrigin = "";
        el.style.width = "100%";
        el.style.margin = "";
        el.style.height = "";
        if (el.parentElement) {
          el.parentElement.style.height = "";
        }
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    const observer = new MutationObserver(updateScale);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("resize", updateScale);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="overflow-hidden bg-gray-100">
      <div
        ref={wrapperRef}
        className="bg-white"
        style={{ width: `${MOBILE_VIEWPORT_MAX_WIDTH}px`, margin: "0 auto" }}
      >
        {children}
      </div>
    </div>
  );
}
