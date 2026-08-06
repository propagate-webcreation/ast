const plans = [
  {
    recommend: "過去に学んだけど\n話せなかった方におすすめ！",
    nameDuration: "6",
    nameSuffix: "ヶ月コース",
    price: "33",
  },
  {
    recommend: "じっくり学びたい方・\n中国語に初めて触れる方に\nおすすめ！",
    nameDuration: "1",
    nameSuffix: "年コース",
    price: "55",
  },
  {
    recommend: "自分のペースで学びたい方・\n習得後もいつでも\n質問したい方におすすめ！",
    nameDuration: "",
    nameSuffix: "永久コース",
    price: "66",
  },
];

export default function HomePricing() {
  return (
    <section id="pricing" className="w-full bg-white relative overflow-hidden">
      {/* 中国伝統模様（ゴールド） */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" aria-hidden>
        <defs>
          <pattern id="pricing-fret" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 0h10v10H0zM10 0h10v10h10v10H20v10h10v10H0V20h10V10H0z" fill="#C8A35A" />
            <path d="M30 0h10v10H30zM20 20h10v10H20z" fill="#D4AF60" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pricing-fret)" />
      </svg>

      {/* 上部金ライン */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#C8A35A] to-transparent" aria-hidden />

      <div className="relative z-10 px-5 py-[30px]">
        {/* 見出し */}
        <div className="text-center mb-6">
          <h2 className="text-[32px] font-bold leading-[1.5] text-[#222] font-serif">
            料金プラン
          </h2>
          <div className="mx-auto mt-3 flex items-center justify-center gap-2" aria-hidden>
            <span className="w-10 h-[1px] bg-gradient-to-r from-transparent to-[#C8A35A]" />
            <span className="w-[6px] h-[6px] border border-[#C8A35A] rotate-45" />
            <span className="w-10 h-[1px] bg-gradient-to-l from-transparent to-[#C8A35A]" />
          </div>
        </div>

        {/* プランカード */}
        <div className="flex flex-col gap-4">
          {plans.map((plan, i) => (
            <div
              key={i}
              className="relative bg-[#FBF8F3] border border-[#C8A35A]/40 overflow-hidden"
            >
              {/* 左の赤アクセントライン */}
              <span className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#C8A35A] via-[#8B0000] to-[#C8A35A]" aria-hidden />

              {/* おすすめ帯 */}
              <div className="bg-[#8B0000] px-4 py-2.5">
                <p className="text-[17px] leading-[1.5] text-white font-bold text-center whitespace-pre-line font-serif">
                  {plan.recommend}
                </p>
              </div>

              {/* コース名＋料金（横並び） */}
              <div className="px-4 py-2.5 flex items-baseline justify-center gap-2">
                <span className="inline-block bg-[#8B0000]/10 px-1.5 py-0">
                  <span className="text-[18px] font-bold text-[#8B0000] font-serif">
                    {plan.nameDuration && (
                      <span className="font-sans">{plan.nameDuration}</span>
                    )}
                    {plan.nameSuffix}
                  </span>
                </span>
                <span className="text-[48px] font-black leading-none font-sans bg-gradient-to-r from-[#8B0000] to-[#C8A35A] bg-clip-text text-transparent">
                  {plan.price}
                </span>
                <span className="text-[18px] font-bold text-[#222]">
                  万円
                </span>
                <span className="text-[12px] text-[#888]">
                  （税込）
                </span>
              </div>

              {/* 角飾り */}
              <span className="absolute bottom-1.5 left-1.5 w-[12px] h-[12px] border-b border-l border-[#C8A35A]/40" aria-hidden />
              <span className="absolute bottom-1.5 right-1.5 w-[12px] h-[12px] border-b border-r border-[#C8A35A]/40" aria-hidden />
            </div>
          ))}
        </div>

        {/* 補足 */}
        <p className="text-center text-[19px] text-[#333] font-medium mt-6 leading-[1.8]">
          詳しくはお気軽にご相談ください。
        </p>
      </div>

      {/* 下部金ライン */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#C8A35A] to-transparent" aria-hidden />
    </section>
  );
}
