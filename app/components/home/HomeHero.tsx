import Image from "next/image";
import { MOBILE_VIEWPORT_MAX_WIDTH } from "../shared/constants";

const HERO_IMAGE = "/directors-bot-uploads/d0fdc172-54d9-44ee-9e6f-6613ed943bb0/1790770759869-4s34m4-00-asuto.png";
const LINE_URL =
  "https://s.lmes.jp/landing-qr/2005618555-L9eozWy0?uLand=MEfnZ7";

export default function HomeHero() {
  return (
    <section id="hero" aria-label="メインビジュアル" className="w-full bg-white">
      <div className="relative w-full mx-auto overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="中国語を学んだのに話せないあなたへ。6カ月でビジネスの現場でも使えるレベルに。累計生徒数700名以上、通訳歴8年、日本在住20年。LINE登録でビジネス中国語完全マスター動画をプレゼント"
          width={652}
          height={1024}
          className="w-full h-auto"
          priority
          sizes={`(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH}px) 100vw, ${MOBILE_VIEWPORT_MAX_WIDTH}px`}
        />
        <a
          href={LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mcv-trigger absolute left-[7%] right-[7%] bottom-[2.5%] h-[10%] min-h-[44px] rounded-2xl"
          aria-label="LINE登録する"
        />
      </div>
    </section>
  );
}
