"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type AnswerSegment = { text: string; bold?: boolean };

const faqs: { question: string; answer: AnswerSegment[][] }[] = [
  {
    question: "初心者でも受講できますか？",
    answer: [
      [{ text: "はい。学習経験のある方も、ほとんどゼロからの方も受講されています。" }],
      [
        { text: "ただし、まったく中国語に触れたことがない場合は、6ヶ月では十分に定着させるのが難しく、" },
        { text: "1年程度をみていただく必要があります。", bold: true },
      ],
      [
        { text: "基礎から学べる別コースもご用意していますので、" },
        { text: "あなたに合ったプランを個別相談でご案内します。", bold: true },
      ],
    ],
  },
  {
    question: "仕事が忙しくて学習時間が取れるか不安です",
    answer: [
      [
        { text: "オンラインで" },
        { text: "1日30分〜1時間の学習で成果が出る設計", bold: true },
        { text: "になっています。" },
      ],
      [
        { text: "隙間時間を活用しつつ、" },
        { text: "スケジュール管理も一緒にサポート", bold: true },
        { text: "します。" },
      ],
    ],
  },
  {
    question: "他のスクール・アプリとの違いは何ですか？",
    answer: [
      [
        { text: "最大の特徴は" },
        { text: "手厚いサポート体制", bold: true },
        { text: "です。" },
      ],
      [
        { text: "本講座は" },
        { text: "毎日のタスク課題・個別添削・Zoomロールプレイ", bold: true },
        { text: "を組み合わせることで最短で現場で使えるレベルまで引き上げます。" },
      ],
    ],
  },
  {
    question: "趣味で学ぶこともできますか？",
    answer: [
      [
        { text: "もちろんです。趣味の" },
        { text: "ドラマ鑑賞や推し活、旅行", bold: true },
        { text: "のために学んでいる方もいらっしゃいます。" },
      ],
    ],
  },
  {
    question: "何度も挫折しています。今回も続けられるか不安です",
    answer: [
      [
        { text: "挫折の原因は「方法が間違っていた」か「サポートがなかった」のどちらかです。" },
      ],
      [
        { text: "本講座は" },
        { text: "毎日のフィードバックと週次Zoom", bold: true },
        { text: "で、正しい学習を徹底的にサポートします。" },
      ],
    ],
  },
];

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: AnswerSegment[][];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#C8A35A]/30">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 py-4 text-left"
        aria-expanded={open}
      >
        <span className="shrink-0 w-[28px] h-[28px] rounded-full bg-[#8B0000] flex items-center justify-center mt-[1px]">
          <span className="text-[14px] font-bold text-white leading-none">Q</span>
        </span>
        <span className="flex-1 text-[17px] font-bold text-[#222] leading-[1.6] min-w-0">
          {question}
        </span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-[#C8A35A] mt-[4px] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="flex items-start gap-3 pb-4">
            <span className="shrink-0 w-[28px] h-[28px] rounded-full bg-[#C8A35A] flex items-center justify-center">
              <span className="text-[14px] font-bold text-white leading-none">A</span>
            </span>
            <div className="flex-1 flex flex-col gap-2 min-w-0">
              {answer.map((para, j) => (
                <p key={j} className="text-[16px] leading-[1.8] text-[#111]">
                  {para.map((seg, k) =>
                    seg.bold ? (
                      <span
                        key={k}
                        className="font-bold text-[#8B0000] bg-[#8B0000]/5 px-0.5"
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
        </div>
      </div>
    </div>
  );
}

export default function HomeFaq() {
  return (
    <section id="faq" className="w-full bg-[#FBF8F3] relative overflow-hidden">
      {/* 中国伝統模様（ゴールド） */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" aria-hidden>
        <defs>
          <pattern id="faq-fret" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 0h10v10H0zM10 0h10v10h10v10H20v10h10v10H0V20h10V10H0z" fill="#C8A35A" />
            <path d="M30 0h10v10H30zM20 20h10v10H20z" fill="#D4AF60" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#faq-fret)" />
      </svg>

      {/* 上部金ライン */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#C8A35A] to-transparent" aria-hidden />

      <div className="relative z-10 px-5 py-[30px]">
        {/* 見出し */}
        <div className="text-center mb-6">
          <h2 className="text-[28px] font-bold leading-[1.5] text-[#222] font-serif">
            よくあるご質問
          </h2>
        </div>

        {/* アコーディオン */}
        <div className="border-t border-[#C8A35A]/30">
          {faqs.map((faq, i) => (
            <FaqItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>

      {/* 下部金ライン */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#C8A35A] to-transparent" aria-hidden />
    </section>
  );
}
