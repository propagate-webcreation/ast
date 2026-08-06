import Image from "next/image";
import { MOBILE_VIEWPORT_MAX_WIDTH } from "../shared/constants";

const features = [
  {
    number: "01",
    title: "完全オーダーメイド！\n場面別トレーニング",
    description:
      "覚えるのは、あなたが実際に使う中国語だけ。目的や使う場面を丁寧にヒアリングし、",
    highlight: "業界・職種別の語彙の強化や、シミュレーション練習",
    descriptionAfter: "を行います。",
    image: "/img/feature-ordermade.png",
  },
  {
    number: "02",
    title: "手厚いサポート体制！",
    description:
      "週1回のオンライン個別指導に加え、",
    highlight: "チャットでの質問も無制限",
    descriptionAfter:
      "。出張中に「この表現は中国語でどう言う？」という場面でも、すぐに質問できます。",
    image: "/img/feature-support.png",
  },
  {
    number: "03",
    title: "700名以上の指導経験！",
    description:
      "講師は日本語・中国語どちらもネイティブレベル。日本人がつまずくポイントを知り尽くした講師が、日本人の目線でわかりやすく解説し、",
    highlight: "最短で「伝わる」中国語",
    descriptionAfter: "へ導きます。",
    image: "/img/feature-experience.png",
  },
];

export default function HomeFeatures() {
  return (
    <section id="features" className="w-full bg-[#FBF8F3]">
      <div className="px-5 py-[25px]">
        {/* 見出し */}
        <div className="text-center mb-10">
          <h2 className="text-[32px] font-bold leading-[1.6] text-[#222] font-serif">
            <span className="bg-gradient-to-r from-[#8B0000] to-[#A0522D] bg-clip-text text-transparent text-[38px] font-black">
              李琳中国語講座
            </span>
            <span className="text-[20px]">なら、</span>
            <br />
            仕事で使える中国語が
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">最短で身につきます。</span>
              <span className="absolute bottom-[2px] left-0 w-full h-[10px] bg-[#C8A35A]/30 z-0" aria-hidden />
            </span>
          </h2>
        </div>

        {/* カード */}
        <div className="flex flex-col gap-6">
          {features.map((item) => (
            <div
              key={item.number}
              className="bg-white rounded-2xl overflow-hidden border border-[#E8E0D0]"
            >
              {/* 画像 + タイトルオーバーレイ */}
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src={item.image}
                  alt={item.title.replace("\n", "")}
                  fill
                  className="object-cover"
                  sizes={`(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH}px) 100vw, ${MOBILE_VIEWPORT_MAX_WIDTH}px`}
                />
                {/* 下部オーバーレイ + タイトル */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-4 pb-3 pt-10">
                  <div className="flex items-center gap-3">
                    <span className="relative shrink-0 w-[44px] h-[44px] flex items-center justify-center">
                      {/* 外枠の菱形 */}
                      <span className="absolute inset-0 border-2 border-[#F5D998] rotate-45" aria-hidden />
                      {/* 内側の菱形 */}
                      <span className="absolute inset-[4px] border border-[#F5D998]/60 rotate-45" aria-hidden />
                      <span className="relative z-10 text-[18px] font-black text-[#F5D998] tracking-tight">
                        {item.number}
                      </span>
                    </span>
                    <h3 className="text-[24px] font-bold text-white leading-snug whitespace-pre-line drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] font-serif">
                      {item.title.split(/(\d+)/).map((part, i) =>
                        /^\d+$/.test(part) ? (
                          <span key={i} className="font-sans">{part}</span>
                        ) : (
                          part
                        )
                      )}
                    </h3>
                  </div>
                </div>
              </div>

              {/* 本文 */}
              <div className="px-5 py-4">
                <p className="text-[19px] leading-[1.8] text-[#111]">
                  {item.description}
                  <span
                    className="text-[22px] font-black bg-gradient-to-r from-[#8B0000] to-[#C8A35A] bg-clip-text text-transparent"
                  >
                    {item.highlight}
                  </span>
                  {item.descriptionAfter}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
