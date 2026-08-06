import "../lib/fonts/_active.css";
import "../lib/fonts/_vars.css";
import type { Metadata } from "next";
import Script from "next/script";
import MobileViewport from "./components/shared/MobileViewport";
import "./globals.css";

export const metadata: Metadata = {
  title: "Default Setting",
  description: "Webサイト制作用の初期設定環境",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="scroll-auto">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-body bg-gray-100">
        <MobileViewport>{children}</MobileViewport>
        {/* [重要] — 削除・変更禁止 */}
        <Script
          src="https://site-annotator.vercel.app/tracker.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
