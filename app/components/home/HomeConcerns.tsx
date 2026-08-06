import Image from "next/image";
import { MOBILE_VIEWPORT_MAX_WIDTH } from "../shared/constants";

const CONCERNS_IMAGE = "/img/ChatGPT Image 2026年8月6日 20_29_48.png";

export default function HomeConcerns() {
  return (
    <section id="concerns" aria-label="こんなお悩み" className="w-full bg-white">
      <div className="w-full mx-auto">
        <Image
          src={CONCERNS_IMAGE}
          alt="こんなお悩み、ありませんか？中国出張や駐在、商談でのコミュニケーション、スクールで到達できなかったレベル、通訳なしでは話せないなどのお悩み"
          width={941}
          height={1672}
          className="w-full h-auto"
          sizes={`(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH}px) 100vw, ${MOBILE_VIEWPORT_MAX_WIDTH}px`}
        />
      </div>
    </section>
  );
}
