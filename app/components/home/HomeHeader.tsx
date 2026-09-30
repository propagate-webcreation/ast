import Image from "next/image";
import { MOBILE_VIEWPORT_MAX_WIDTH } from "../shared/constants";

const HEADER_IMAGE = "/directors-bot-uploads/d0fdc172-54d9-44ee-9e6f-6613ed943bb0/1790773465098-kuv4bb-00-最新NE.png";
/** LP 画像と同じ基準幅（652） */
const HEADER_WIDTH = 652;
const HEADER_HEIGHT = Math.round((89 / 1024) * HEADER_WIDTH);
const LINE_URL =
  "https://s.lmes.jp/landing-qr/2005618555-L9eozWy0?uLand=MEfnZ7";

export default function HomeHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#F7F2E7]">
      <div className="relative w-full">
        <Image
          src={HEADER_IMAGE}
          alt="李琳中国語講座"
          width={HEADER_WIDTH}
          height={HEADER_HEIGHT}
          className="w-full h-auto block"
          priority
          sizes={`(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH}px) 100vw, ${MOBILE_VIEWPORT_MAX_WIDTH}px`}
        />
        <a
          href={LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mcv-trigger absolute right-[2.5%] top-[14%] bottom-[14%] left-[58%] min-h-[44px] rounded-2xl"
          aria-label="LINE登録する"
        />
      </div>
    </header>
  );
}
