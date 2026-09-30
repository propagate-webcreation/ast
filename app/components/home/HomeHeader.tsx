"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MOBILE_VIEWPORT_MAX_WIDTH } from "../shared/constants";
import { useLpViewportScale } from "../shared/useLpViewportScale";

const HEADER_IMAGE = "/img/header-bar.png";
/** LP 画像と同じ基準幅（652） */
const HEADER_WIDTH = 652;
const HEADER_HEIGHT = Math.round((89 / 1024) * HEADER_WIDTH);
const LINE_URL =
  "https://s.lmes.jp/landing-qr/2005618555-L9eozWy0?uLand=MEfnZ7";

function HeaderBar() {
  return (
    <div className="relative w-full bg-[#F7F2E7]">
      <Image
        src={HEADER_IMAGE}
        alt="李琳中国語講座"
        width={HEADER_WIDTH}
        height={HEADER_HEIGHT}
        className="w-full h-auto block"
        priority
        sizes={`(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH}px) 100vw, ${MOBILE_VIEWPORT_MAX_WIDTH}px`}
      />
      <a
        href={LINE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mcv-trigger absolute right-[2.5%] top-[14%] bottom-[14%] left-[58%] min-h-[44px] rounded-2xl"
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

  const fixedHeader = (
    <header
      className="fixed top-0 left-1/2 z-50"
      style={fixedHeaderStyle}
    >
      <HeaderBar />
    </header>
  );

  return (
    <>
      <div
        className={`w-full shrink-0 ${mounted ? "invisible pointer-events-none" : ""}`}
        aria-hidden={mounted}
      >
        <HeaderBar />
      </div>
      {mounted ? createPortal(fixedHeader, document.body) : null}
    </>
  );
}
