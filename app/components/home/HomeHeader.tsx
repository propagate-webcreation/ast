"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MOBILE_VIEWPORT_MAX_WIDTH } from "../shared/constants";
import { useLpViewportScale } from "../shared/useLpViewportScale";

const HEADER_IMAGE = "/img/header-bar-cropped.png";
const LINE_URL =
  "https://s.lmes.jp/landing-qr/2005618555-L9eozWy0?uLand=MEfnZ7";

function HeaderBar() {
  return (
    <div className="relative w-full">
      <Image
        src={HEADER_IMAGE}
        alt="李琳中国語講座"
        width={2172}
        height={187}
        className="w-full h-auto block"
        priority
        sizes={`(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH}px) 100vw, ${MOBILE_VIEWPORT_MAX_WIDTH}px`}
      />
      <a
        href={LINE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mcv-trigger absolute right-[3%] top-[8%] bottom-[12%] left-[66%] rounded-2xl"
        aria-label="LINE登録する"
      />
    </div>
  );
}

export default function HomeHeader() {
  const [mounted, setMounted] = useState(false);
  const { scale, baseWidth } = useLpViewportScale();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fixedHeaderStyle =
    scale > 1
      ? {
          width: `${MOBILE_VIEWPORT_MAX_WIDTH}px`,
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: "top center" as const,
        }
      : {
          width: `${baseWidth}px`,
          transform: "translateX(-50%)",
        };

  return (
    <>
      <div
        className={`w-full ${mounted ? "invisible pointer-events-none" : ""}`}
        aria-hidden={mounted}
      >
        <HeaderBar />
      </div>
      {mounted
        ? createPortal(
            <header className="fixed top-0 left-1/2 z-50" style={fixedHeaderStyle}>
              <HeaderBar />
            </header>,
            document.body,
          )
        : null}
    </>
  );
}
