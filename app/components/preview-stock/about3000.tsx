'use client';

export const metadata = {
  tags: {
    style: [
      'やさしい・ナチュラル'
    ],
    industry: [
      '福祉・介護'
    ],
    pageType: [
      'CP'
    ],
    plan: [
      'BASIC'
    ]
  }
,
  designAnalysis: {
    "visualSummary": "A clean, warm, and informative healthcare-related web component emphasizing community care and support for the elderly.",
    "colorMood": {
      "palette": "Primarily dark brown text on white background with green highlights for emphasis.",
      "feeling": "Trustworthy, caring, calm, and professional with a subtle natural and health-conscious vibe."
    },
    "typography": {
      "style": "Simple, legible sans-serif font with medium to bold weights for headings and regular weight for body text.",
      "hierarchy": "Strong hierarchy established through bold headings, medium sub-headings, and smaller body text with selective color highlights for key phrases.",
      "personality": "Approachable, clear, and professional, conveying reliability and warmth."
    },
    "layout": {
      "pattern": "Left-aligned text block with a large supporting image on the right, balanced horizontally across the component.",
      "spacing": "Moderate spacing with clear separation between headings, paragraphs, and image, allowing comfortable reading and visual flow.",
      "density": "Medium density - informative text content is balanced with whitespace and imagery, avoiding clutter."
    },
    "integrationGuidelines": {
      "pairsWith": [
        "Minimalist and clean design styles",
        "Healthcare or wellness branding",
        "Natural or organic-themed color palettes",
        "Approachable, friendly UI styles with clear information hierarchy"
      ],
      "avoidWith": [
        "Highly decorative or ornate designs",
        "Dark mode or heavy, saturated color schemes",
        "Tech-heavy or futuristic styles that feel cold",
        "Overly dense or text-heavy layouts without whitespace"
      ],
      "keyElements": "Preserve the clear hierarchy with bold headings, the green highlight color for key text, the warm and approachable imagery of elderly care, and the balanced left-image/right-text layout."
    },
    "distinctiveFeatures": [
      "Use of green text highlights within the paragraph to draw attention to important care concepts.",
      "Balanced composition with natural smiling subjects that convey warmth and trust, not staged or overly polished.",
      "Combination of professional medical/community care messaging with an inviting and friendly tone."
    ]
  }
};
import Image from 'next/image';
function About3000() {
  return (
    <section
      id="about3000"
      className="block py-10 md:py-20 bg-white"
    >
      <div className="w-[90%] max-w-[1200px] mx-auto">
        <h2 className="mb-6 md:mb-8 text-center text-[24px] md:text-[40px] text-[#504434] font-bold leading-[1.5] tracking-[2px]">
          <Image
            src="/img/Service3002_Deco_1.svg"
            alt=""
            width="50"
            height="16"
            className="inline-block mx-auto mb-4"
          />
          <span className="block">老人保健施設<br className="display md:hidden" />「山びこの郷」について</span>
        </h2>
      </div>
      <div className="relative w-full">
        <div className="flex flex-col md:flex-row-reverse flex-wrap gap-[6%] w-full md:w-[90%] max-w-[1440px] mx-auto">
          <div className="relative md:absolute md:top-0 md:right-0 w-full md:w-[47%] h-full mb-6 md:mb-0">
            <div className="flex items-center justify-center w-full min-h-[300px] pt-[66.67%] md:pt-0 h-full">
              <Image
                src="/img/About_Photo_1.webp"
                alt=""
                fill
                objectFit="cover"
                className="w-full h-full object-cover overflow-hidden rounded-tl-[20px] rounded-bl-[20px]"
              />
            </div>
          </div>
          <div className="flex items-center w-[86%] md:w-[47%] md:min-h-[600px] mx-auto md:mr-auto md:ml-0">
            <div className="block leading-[1.4]">
              <h4 className="mb-6 md:mb-10 text-[24px] md:text-[40px] text-[#504434] font-bold tracking-[4px]">
                医療×介護で、<br />いかなる時も支え続ける
              </h4>
              <p className="mb-3 md:mb-4 text-[14px] md:text-[16px] text-[#504434] leading-[2.0] font-semibold">
                揖斐郡揖斐川町の久瀬地域で唯一の医療機関として「介護老人保健施設」「在宅介護支援センター（居宅介護事業所）」「訪問介護ステーション」「通所リハビリテーション」を併設。一人の患者さんだけでなく地域全体のケアを目指して、保健医療福祉の連携に取り組んでいます。
              </p>
              <p className="mb-3 md:mb-4 text-[14px] md:text-[16px] text-[#504434] leading-[2.0] font-semibold">
                <span className="text-[#69bb00] font-bold">診療所から老健、在宅医療への移行も途切れることのない地域包括ケアで、多職種はもちろん、地域や関連機関と連携を図り、心のこもった質の高いケア</span>を提供します。
              </p>
              <p className="text-[14px] md:text-[16px] text-[#504434] leading-[2.0] font-semibold">
                また大きな特色のひとつとして<span className="text-[#69bb00] font-bold">「地域で育てて地域でともに育つ」を合言葉に地域医療教育、多職種の学生や研修医の教育</span>にも力を入れています。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About3000;
