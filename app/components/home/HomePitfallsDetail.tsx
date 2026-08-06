const pitfalls = [
  {
    title: "ネイティブ講師＝\n教えられるは間違い！？",
    body: "多くの語学スクールでは「ネイティブ講師」が在籍していますが、",
    emphasis: "話せることと教えることは\n全くの別物。",
    after: "「その発音ちがうよ」だけで終わってしまい、",
    emphasisAfter: "説明してもらえない",
    tail: "ことも。",
  },
  {
    title: "いきなりシャドーイングから\n始めるのはNG！？",
    body: "日本語と違い、中国語は",
    emphasis: "語順や声調一つで意味が\n全く変わります。",
    after: "中国語思考の土台がないまま単語や会話フレーズを覚えても、",
    emphasisAfter: "自然な中国語は話せません。",
    tail: "",
  },
  {
    title: "週1回1時間のレッスン\n「だけ」では\n絶対に身につかない！？",
    body: "せっかくレッスンを受けても、1週間後にはきれいさっぱり忘れているのが現実。\nアウトプットの時間がなければ、何年通っても、",
    emphasis: "ビジネスの現場で使える\n中国語は身につきません。",
    after: "",
    emphasisAfter: "",
    tail: "",
  },
];

export default function HomePitfallsDetail() {
  return (
    <section id="pitfalls-detail" className="w-full bg-[#FBF8F3] relative overflow-hidden">
      {/* 中国模様 */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" aria-hidden>
        <defs>
          <pattern id="pitfalls-fret" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 0h10v10H0zM10 0h10v10h10v10H20v10h10v10H0V20h10V10H0z" fill="#C8A35A" />
            <path d="M30 0h10v10H30zM20 20h10v10H20z" fill="#D4AF60" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pitfalls-fret)" />
      </svg>

      <div className="relative z-10 px-5 py-[30px]">
        {/* 見出し */}
        <div className="text-center mb-8">
          <p className="text-[22px] leading-[1.6] text-[#222] font-serif">
            中国語を学んだのに
          </p>
          <h2 className="text-[36px] font-black leading-[1.4] text-[#222] font-serif mt-1">
            <span className="text-[#8B0000]">話せない</span>
            のは、
            <br />
            あなたのせいでは
            <br />
            ありません。
          </h2>
          <p className="inline-block text-[16px] text-[#222] mt-4 font-serif font-bold bg-[#8B0000]/8 px-4 py-1.5">
            実は多くの人が陥る
            <span className="font-bold text-[#8B0000]">落とし穴</span>
            が…
          </p>
        </div>

        {/* カード */}
        <div className="flex flex-col gap-5">
          {pitfalls.map((item, i) => (
            <div key={i} className="relative bg-white overflow-hidden border border-[#C8A35A]/40 p-[3px]">
              {/* 内側の二重枠 */}
              <div className="border border-[#C8A35A]/20 relative">
                {/* 角飾り（四隅） */}
                <span className="absolute -top-[1px] -left-[1px] w-[18px] h-[18px] border-t-2 border-l-2 border-[#8B0000]" aria-hidden />
                <span className="absolute -top-[1px] -right-[1px] w-[18px] h-[18px] border-t-2 border-r-2 border-[#8B0000]" aria-hidden />
                <span className="absolute -bottom-[1px] -left-[1px] w-[18px] h-[18px] border-b-2 border-l-2 border-[#8B0000]" aria-hidden />
                <span className="absolute -bottom-[1px] -right-[1px] w-[18px] h-[18px] border-b-2 border-r-2 border-[#8B0000]" aria-hidden />

                {/* タイトル */}
                <div className="bg-[#8B0000]/5 px-5 py-3 border-b border-[#C8A35A]/20">
                  <h3 className="text-[22px] font-bold leading-[1.5] text-[#222] font-serif whitespace-pre-line">
                    {item.title.split(/(NG|だけ|\d+)/).map((part, idx) =>
                      part === "NG" || part === "だけ" ? (
                        <span key={idx} className="text-[#8B0000] font-black">{part}</span>
                      ) : /^\d+$/.test(part) ? (
                        <span key={idx} className="font-sans">{part}</span>
                      ) : (
                        <span key={idx}>{part}</span>
                      )
                    )}
                  </h3>
                </div>

                {/* 説明文 */}
                <div className="px-5 py-4">
                  <p className="text-[19px] leading-[1.8] text-[#111]">
                    {item.body}
                  </p>
                  <p className="text-[22px] font-bold leading-[1.6] text-[#8B0000] font-serif whitespace-pre-line mt-1">
                    {item.emphasis}
                  </p>
                  {item.after && (
                    <p className="text-[19px] leading-[1.8] text-[#111] mt-1">
                      {item.after}
                      {item.emphasisAfter && (
                        <span className="font-bold text-[#8B0000]">{item.emphasisAfter}</span>
                      )}
                      {item.tail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
