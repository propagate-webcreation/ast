import Image from "next/image";
import { MOBILE_VIEWPORT_MAX_WIDTH } from "../shared/constants";

const PITFALLS_IMAGE = "/img/ChatGPT Image 2026年8月6日 21_48_02.png";

export default function HomePitfalls() {
  return (
    <section id="pitfalls" aria-label="落とし穴" className="w-full bg-[#FEF7E5] pt-[15px]">
      <div className="w-full mx-auto">
        <Image
          src={PITFALLS_IMAGE}
          alt="中国語を学んだのに話せないのは、あなたのせいではありません。ネイティブ講師＝教えられるは間違い、シャドーウィングから始めるのはNG、週1回1時間のレッスンだけでは身につかない"
          width={793}
          height={1981}
          className="w-full h-auto"
          sizes={`(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH}px) 100vw, ${MOBILE_VIEWPORT_MAX_WIDTH}px`}
        />
      </div>
    </section>
  );
}
