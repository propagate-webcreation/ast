const LINE_URL = "https://s.lmes.jp/landing-qr/2005618555-L9eozWy0?uLand=MEfnZ7";

export default function HomeHeader() {
  return (
    <header className="w-full bg-[#F7F2E7]">
      <div className="flex items-center justify-between gap-3 px-4 py-[5px]">
        <p className="text-[15px] font-bold text-[#8B0000] font-serif leading-tight tracking-wide">
          李琳中国語講座
        </p>
        <a
          href={LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mcv-trigger shrink-0 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#06C755] px-4 py-1 text-[13px] font-bold text-white shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M12 2C6.477 2 2 5.94 2 10.8c0 4.36 3.58 8.02 8.42 8.72.33.07.77.22.88.5.1.26.07.66.03.92l-.14.86c-.04.26-.2 1 .87.55 1.07-.46 5.77-3.4 7.87-5.83C21.24 14.14 22 12.55 22 10.8 22 5.94 17.523 2 12 2z" />
          </svg>
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
