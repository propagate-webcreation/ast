import Image from "next/image";
import { MOBILE_VIEWPORT_MAX_WIDTH } from "../shared/constants";

const LINE_CTA_IMAGE = "/img/ChatGPT Image 2026年8月6日 19_15_25.png";

type Props = {
  id?: string;
};

export default function HomeLineCta({ id = "line-cta" }: Props) {
  return (
    <section id={id} aria-label="LINE登録" className="w-full bg-gray-50">
      <div className="w-full mx-auto">
        <Image
          src={LINE_CTA_IMAGE}
          alt="700名以上が成果を実感。月10名限定。LINE登録であなた専用の学習プランを無料でご提案"
          width={1026}
          height={1177}
          className="w-full h-auto"
          sizes={`(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH}px) 100vw, ${MOBILE_VIEWPORT_MAX_WIDTH}px`}
        />
      </div>
    </section>
  );
}
