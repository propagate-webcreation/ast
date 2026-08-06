import Image from "next/image";
import { MOBILE_VIEWPORT_MAX_WIDTH } from "../shared/constants";

const SUPPORT_IMAGE = "/img/ChatGPT Image 2026年8月6日 21_09_31.png";

export default function HomeSupport() {
  return (
    <section id="support" aria-label="サポート体制" className="w-full bg-[#FBF8F3]">
      <div className="w-full mx-auto">
        <Image
          src={SUPPORT_IMAGE}
          alt="『知ってる』を『使える』に変える、手厚いサポート体制。週1回Zoom個別指導、学習教材の追加・更新、リアルタイム発音添削、チャット無制限サポート、毎日のタスク課題と個別フィードバック、個別学習プラン作成、学習コミュニティへの参加権"
          width={868}
          height={1593}
          className="w-full h-auto"
          sizes={`(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH}px) 100vw, ${MOBILE_VIEWPORT_MAX_WIDTH}px`}
        />
      </div>
    </section>
  );
}
