import "../lib/fonts/_active.css";
import "../lib/fonts/_vars.css";
import type { Metadata } from "next";
import Script from "next/script";
import MobileViewport from "./components/shared/MobileViewport";
import "./globals.css";

export const metadata: Metadata = {
  title: "李琳中国語講座 | オンライン個別指導",
  description:
    "ビジネスで使える中国語を最短6ヶ月で。完全オーダーメイドのオンライン個別指導。週1回のZoom指導＋毎日の課題添削＋チャット無制限サポートで、仕事の現場で伝わる中国語が身につきます。まずはLINEで無料相談。",
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
      {/* ADNAVI_GTM_START */}
      <Script id="adnavi-gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PXP95SMC');`}</Script>
      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-PXP95SMC"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
      {/* ADNAVI_GTM_END */}
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
