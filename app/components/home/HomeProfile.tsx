import Image from "next/image";
import { MOBILE_VIEWPORT_MAX_WIDTH } from "../shared/constants";

const PROFILE_IMAGE = "/img/ChatGPT Image 2026年8月6日 20_49_08.png";

export default function HomeProfile() {
  return (
    <section id="profile" aria-label="講師プロフィール" className="w-full bg-white">
      <div className="w-full mx-auto">
        <Image
          src={PROFILE_IMAGE}
          alt="講師プロフィール。李琳（りりん）。講師歴8年、700名以上に中国語を指導。日本の企業で8年通訳を経験。中日韓のトリリンガル。"
          width={941}
          height={1355}
          className="w-full h-auto"
          sizes={`(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH}px) 100vw, ${MOBILE_VIEWPORT_MAX_WIDTH}px`}
        />
      </div>
    </section>
  );
}
