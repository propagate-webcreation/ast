import Image from "next/image";
import { MOBILE_VIEWPORT_MAX_WIDTH } from "../shared/constants";

const LINE_CTA_IMAGE = "/img/ChatGPT Image 2026年8月25日 18_53_14.png";
const LINE_URL = "https://lin.ee/QnUuCP9";

type Props = {
  id?: string;
};

export default function HomeLineCta({ id = "line-cta" }: Props) {
  return (
    <section id={id} aria-label="LINE登録" className="w-full bg-gray-50">
      <div className="w-full mx-auto">
        <a
          href={LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
          aria-label="LINEで友だち追加する"
        >
          <Image
            src={LINE_CTA_IMAGE}
            alt="700名以上が成果を実感。月10名限定。LINE登録であなた専用の学習プランを無料でご提案"
            width={1172}
            height={1342}
            className="w-full h-auto"
            sizes={`(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH}px) 100vw, ${MOBILE_VIEWPORT_MAX_WIDTH}px`}
          />
        </a>
      </div>
    </section>
  );
}
