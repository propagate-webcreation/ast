import Image from "next/image";

const testimonials = [
  {
    image: "/img/testimonial-businessman.png",
    label: "40代　ビジネスマン",
    paragraphs: [
      {
        texts: [
          { text: "仕事で中国出張が多く、発音が通じないため筆談や英語に頼っていました。" },
        ],
      },
      {
        texts: [
          { text: "李さんの指導で" },
          { text: "短期間で確実に伝わる発音を習得", bold: true },
          { text: "し、今では商談でも自信を持って中国語で話せるようになりました。" },
        ],
      },
      {
        texts: [
          { text: "会社の中国人同僚に" },
          { text: "『発音が綺麗』と褒められています！", bold: true },
          { text: "とても自信になりました！" },
        ],
      },
    ],
  },
  {
    image: "/img/testimonial-ceo.png",
    label: "40代　会社経営者",
    paragraphs: [
      {
        texts: [
          { text: "仕事の関係で中国語は何年も勉強していましたが、なかなか話せなくて、初めは半信半疑でした。" },
        ],
      },
      {
        texts: [
          { text: "習い始めて" },
          { text: "1ヶ月が過ぎた時、中国人と話す機会があって、会話ができたことに驚きました。", bold: true },
        ],
      },
      {
        texts: [
          { text: "初心者で" },
          { text: "『できるだけ短期間で話せるようになりたい』と思う方にはこの勉強法は本当にオススメです。", bold: true },
        ],
      },
    ],
  },
  {
    image: "/img/testimonial-housewife.png",
    label: "30代　主婦",
    paragraphs: [
      {
        texts: [
          { text: "夫の仕事の関係で中国に住むことになったため、中国語を学び始めました。" },
        ],
      },
      {
        texts: [
          { text: "初めは自分で独学してみたけど、覚えることが多く、しかも何から勉強すればいいかわからなくて、結局何もしないまま不安の中で過ごしていました。" },
        ],
      },
      {
        texts: [
          { text: "中国で暮らす時間が近づいてきているし、どうしようと迷っている時、短期間で中国語が上達できることが自分にぴったりだと思い受講しました。" },
        ],
      },
      {
        texts: [
          { text: "講座内容はとてもわかりやすく、全て日本語で説明しているので、" },
          { text: "ストレスなく、学習を進めることができました。", bold: true },
        ],
      },
      {
        texts: [
          { text: "オンラインで勉強するので、上海にきて勉強を続けることができたので、とても助かりました。" },
        ],
      },
      {
        texts: [
          { text: "中国に来る前にしっかりと中国語を学んで", bold: true },
          { text: "本当によかったと思います。", bold: true },
        ],
      },
    ],
  },
];

export default function HomeTestimonials() {
  return (
    <section id="testimonials" className="w-full bg-[#FBF8F3]">
      <div className="px-5 py-[30px]">
        {/* 見出し */}
        <div className="text-center mb-6">
          <h2 className="text-[28px] font-bold leading-[1.5] text-[#222] font-serif">
            たくさんの受講生が
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">「使える中国語」</span>
              <span className="absolute bottom-[2px] left-0 w-full h-[10px] bg-[#C8A35A]/30 z-0" aria-hidden />
            </span>
            を身につけています！
          </h2>
          <div className="mx-auto mt-3 flex items-center justify-center gap-2" aria-hidden>
            <span className="w-10 h-[1px] bg-gradient-to-r from-transparent to-[#C8A35A]" />
            <span className="w-[6px] h-[6px] border border-[#C8A35A] rotate-45" />
            <span className="w-10 h-[1px] bg-gradient-to-l from-transparent to-[#C8A35A]" />
          </div>
        </div>

        {/* カード */}
        <div className="flex flex-col gap-5">
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="relative bg-white px-5 py-5 overflow-hidden"
            >
              {/* 角飾り */}
              <span className="absolute top-2 left-2 w-[20px] h-[20px] border-t-2 border-l-2 border-[#8B0000]/40" aria-hidden />
              <span className="absolute top-2 right-2 w-[20px] h-[20px] border-t-2 border-r-2 border-[#8B0000]/40" aria-hidden />
              <span className="absolute bottom-2 left-2 w-[20px] h-[20px] border-b-2 border-l-2 border-[#8B0000]/40" aria-hidden />
              <span className="absolute bottom-2 right-2 w-[20px] h-[20px] border-b-2 border-r-2 border-[#8B0000]/40" aria-hidden />

              {/* プロフィール */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-[70px] h-[70px] rounded-full overflow-hidden shrink-0 border-2 border-[#C8A35A]/40">
                  <Image
                    src={item.image}
                    alt={item.label}
                    width={140}
                    height={140}
                    className="w-full h-full object-cover"
                    sizes="70px"
                  />
                </div>
                <p className="text-[18px] font-bold text-[#222] font-serif">
                  {item.label.split(/(\d+)/).map((part, idx) =>
                    /^\d+$/.test(part) ? (
                      <span key={idx} className="font-sans">{part}</span>
                    ) : (
                      part
                    )
                  )}
                </p>
              </div>

              {/* 本文 */}
              <div className="flex flex-col gap-3">
                {item.paragraphs.map((para, j) => (
                  <p key={j} className="text-[16px] leading-[1.8] text-[#111]">
                    {para.texts.map((seg, k) =>
                      seg.bold ? (
                        <span
                          key={k}
                          className="text-[18px] font-black bg-gradient-to-r from-[#8B0000] to-[#C8A35A] bg-clip-text text-transparent"
                        >
                          {seg.text}
                        </span>
                      ) : (
                        <span key={k}>{seg.text}</span>
                      )
                    )}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
