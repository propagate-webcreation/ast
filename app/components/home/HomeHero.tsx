import Image from "next/image";
import { MOBILE_VIEWPORT_MAX_WIDTH } from "../shared/constants";

const HERO_IMAGE = "/img/ChatGPT Image 2026年8月6日 18_55_10.png";

export default function HomeHero() {
  return (
    <section id="hero" aria-label="メインビジュアル" className="w-full bg-white">
      <div className="w-full mx-auto">
        <Image
          src={HERO_IMAGE}
          alt="中国語を学んだのに話せないあなたへ。6カ月でビジネスの現場でも使えるレベルに。オーダーメイドのオンライン個別指導"
          width={1024}
          height={1505}
          className="w-full h-auto"
          priority
          sizes={`(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH}px) 100vw, ${MOBILE_VIEWPORT_MAX_WIDTH}px`}
        />
      </div>
    </section>
  );
}
