import Image from "next/image";
import { MOBILE_VIEWPORT_MAX_WIDTH } from "../shared/constants";

const OFFER_IMAGE = "/img/ChatGPT Image 2026年8月6日 21_25_19.png";
const LINE_URL = "https://s.lmes.jp/landing-qr/2005618555-L9eozWy0?uLand=MEfnZ7";

export default function HomeLineOffer() {
  return (
    <section id="line-offer" aria-label="LINE登録特典" className="w-full bg-[#FBF8F3]">
      <div className="w-full mx-auto">
        <a
          href={LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full mcv-trigger"
          aria-label="LINEで友だち追加する"
        >
          <Image
            src={OFFER_IMAGE}
            alt="さらに！今ならLINE登録者限定で、具体的な学習法を解説した「ビジネス中国語完全マスター動画」もプレゼント。通訳なしで商談をこなし信頼を獲得、発音に悩んでいた40代会社員がたった3ヶ月でネイティブ発音を習得、ゼロから1年で医療通訳試験に合格しキャリアアップと給与アップを実現。LINE登録する"
            width={946}
            height={1662}
            className="w-full h-auto pointer-events-none"
            sizes={`(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH}px) 100vw, ${MOBILE_VIEWPORT_MAX_WIDTH}px`}
          />
        </a>
      </div>
    </section>
  );
}
