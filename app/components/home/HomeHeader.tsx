const LINE_URL = "https://s.lmes.jp/landing-qr/2005618555-L9eozWy0?uLand=MEfnZ7";

export default function HomeHeader() {
  return (
    <header className="w-full bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <p className="text-[15px] font-bold text-[#8B0000] font-serif leading-tight tracking-wide">
          李琳中国語講座
        </p>
        <a
          href={LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mcv-trigger shrink-0 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#8B0000] to-[#A0522D] px-4 py-2 text-[13px] font-bold text-white shadow-sm"
        >
          LINE登録
        </a>
      </div>
      <div
        className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C8A35A] to-transparent"
        aria-hidden
      />
    </header>
  );
}
