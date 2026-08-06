import Image from "next/image";
import { MOBILE_VIEWPORT_MAX_WIDTH } from "../shared/constants";

const FOOTER_CTA_IMAGE = "/img/ChatGPT Image 2026年8月6日 21_47_51.png";

export default function HomeFooterCta() {
  return (
    <section id="footer-cta" aria-label="LINE登録CTA" className="w-full bg-[#FBF8F3]">
      <div className="w-full mx-auto">
        <Image
          src={FOOTER_CTA_IMAGE}
          alt="700名以上が成果を実感！月10名限定。LINE登録であなた専用の学習プランを無料でご提案！さらに今なら具体的な学習法を解説した「ビジネス中国語完全マスター動画」もプレゼント！LINE登録する。無理な勧誘なし、相談のみでもOK"
          width={1087}
          height={1447}
          className="w-full h-auto"
          sizes={`(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH}px) 100vw, ${MOBILE_VIEWPORT_MAX_WIDTH}px`}
        />
      </div>
    </section>
  );
}
