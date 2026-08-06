import { Check } from "lucide-react";

const points = [
  {
    text: "動詞を中心とした\n本質的な学習メソッドだから、",
    emphasis: "ビジネスで使える中国語を\n最短で正しく習得できる",
  },
  {
    text: "中国語も日本語も\nネイティブレベルの講師だから、",
    emphasis: "声調のズレや息の出し方も\n日本人の目線でわかりやすく解説",
  },
  {
    text: "手厚いサポートで、",
    emphasis: "授業外の学習まで\n徹底的にフィードバック",
  },
];

export default function HomeMethod() {
  return (
    <section id="method" className="w-full">
      {/* 上部：深紅背景の見出し */}
      <div className="bg-[#8B0000] px-5 py-[40px]">
        <div className="text-center">
          <h2 className="text-[28px] font-bold leading-[1.6] text-white font-serif [text-wrap:wrap]">
            <span className="text-[#F5D998]">李琳中国語講座</span>
            <span className="text-[22px]">なら、</span>
            <br />
            超実践型コーチングで、
            <br />
            最短で
            <span className="relative inline-block">
              <span className="relative z-10">「使える中国語」</span>
              <span className="absolute bottom-[2px] left-0 w-full h-[8px] bg-[#F5D998]/30 z-0" aria-hidden />
            </span>
            を
            <br />
            習得できます。
          </h2>
        </div>
      </div>

      {/* 下部：中国模様背景のチェックリスト */}
      <div className="bg-[#FBF8F3] relative overflow-hidden px-6 py-[28px]">
        {/* 中国伝統模様（回字文） */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" aria-hidden>
          <defs>
            <pattern id="chinese-fret" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 0h40v40H0z" fill="none" />
              <path d="M0 0h10v10H0zM10 0h10v10h10v10H20v10h10v10H0V20h10V10H0z" fill="#8B0000" />
              <path d="M30 0h10v10H30zM20 20h10v10H20z" fill="#C8A35A" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#chinese-fret)" />
        </svg>

        {/* 上部の金ライン */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#C8A35A] to-transparent" aria-hidden />

        {/* 角飾り */}
        <div className="absolute top-4 left-4 w-[36px] h-[36px] border-t-2 border-l-2 border-[#C8A35A]/30" aria-hidden />
        <div className="absolute top-4 right-4 w-[36px] h-[36px] border-t-2 border-r-2 border-[#C8A35A]/30" aria-hidden />
        <div className="absolute bottom-4 left-4 w-[36px] h-[36px] border-b-2 border-l-2 border-[#C8A35A]/30" aria-hidden />
        <div className="absolute bottom-4 right-4 w-[36px] h-[36px] border-b-2 border-r-2 border-[#C8A35A]/30" aria-hidden />

        <div className="relative z-10 flex flex-col gap-3">
          {points.map((item, i) => (
            <div key={i}>
              {/* チェック + 前文 */}
              <div className="flex items-start gap-3 mb-2">
                <span className="shrink-0 w-[26px] h-[26px] rounded-full bg-[#8B0000] flex items-center justify-center mt-[3px]">
                  <Check size={14} className="text-[#F5D998]" strokeWidth={3} />
                </span>
                <p className="text-[19px] leading-[1.7] text-[#111] font-medium whitespace-pre-line">
                  {item.text}
                </p>
              </div>

              {/* 強調テキスト：中国風装飾 */}
              <div className="relative bg-[#8B0000]/5 py-2.5 px-4">
                {/* 左右の縦ライン */}
                <span className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[#C8A35A] via-[#8B0000] to-[#C8A35A]" aria-hidden />
                <span className="absolute top-0 right-0 w-[1px] h-full bg-[#C8A35A]/20" aria-hidden />
                {/* 上下の横ライン */}
                <span className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#C8A35A] to-transparent" aria-hidden />
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#C8A35A] to-transparent" aria-hidden />
                <p className="text-[20px] font-bold leading-[1.6] text-[#8B0000] font-serif whitespace-pre-line">
                  {item.emphasis}
                </p>
              </div>

              {/* 区切りの金ドット（最後以外） */}
              {i < points.length - 1 && (
                <div className="flex items-center justify-center gap-2 mt-3" aria-hidden>
                  <span className="w-[4px] h-[4px] rounded-full bg-[#C8A35A]/40" />
                  <span className="w-[6px] h-[6px] rounded-full bg-[#C8A35A]/60" />
                  <span className="w-[4px] h-[4px] rounded-full bg-[#C8A35A]/40" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 下部の金ライン */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#C8A35A] to-transparent" aria-hidden />
      </div>
    </section>
  );
}
