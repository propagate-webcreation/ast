"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MOBILE_VIEWPORT_MAX_WIDTH } from "../shared/constants";

const HEADER_IMAGE = "/img/header-bar.png";
const LINE_URL =
  "https://s.lmes.jp/landing-qr/2005618555-L9eozWy0?uLand=MEfnZ7";

function HeaderBar() {
  return (
    <div className="relative w-full bg-[#F7F2E7]">
      <Image
        src={HEADER_IMAGE}
        alt="李琳中国語講座"
        width={1024}
        height={89}
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const fixedHeader = (
    <header
      className="fixed top-0 left-1/2 z-50 w-full -translate-x-1/2"
      style={{ maxWidth: `${MOBILE_VIEWPORT_MAX_WIDTH}px` }}
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
