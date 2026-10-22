"use client";

import { useEffect } from "react";

// エルメ（L Message）の友だち追加リンク
const LME_LINK_PREFIX = "https://s.lmes.jp/landing-qr/";
const FBCLID_STORAGE_KEY = "ast_fbclid";
const FBCLID_TIME_STORAGE_KEY = "ast_fbclid_time";
const MAX_UA_LENGTH = 300;

function readCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function readStorage(key: string): string {
  try {
    return window.sessionStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // ストレージが使えない環境では保存しない
  }
}

// 広告から来たときの fbclid を、LP内で移動しても失わないよう保存する
function rememberFbclid() {
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  if (fbclid && fbclid !== readStorage(FBCLID_STORAGE_KEY)) {
    writeStorage(FBCLID_STORAGE_KEY, fbclid);
    writeStorage(FBCLID_TIME_STORAGE_KEY, String(Date.now()));
  }
}

// Metaのクリック識別子（fbc）。ピクセルのCookieが無ければ fbclid から組み立てる
function getFbc(): string {
  const cookie = readCookie("_fbc");
  if (cookie) return cookie;
  const fbclid = readStorage(FBCLID_STORAGE_KEY);
  if (!fbclid) return "";
  const time = readStorage(FBCLID_TIME_STORAGE_KEY) || String(Date.now());
  return `fb.1.${time}.${fbclid}`;
}

// 友だち追加時にエルメから計測用APIへ渡してもらう値を、リンクに付け足す
// cid1: fbc / cid2: fbp / cid3: User-Agent
function decorate(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href") || "";
  if (!href.startsWith(LME_LINK_PREFIX)) return;

  try {
    const url = new URL(href);
    const fbc = getFbc();
    const fbp = readCookie("_fbp");
    if (fbc) url.searchParams.set("cid1", fbc);
    if (fbp) url.searchParams.set("cid2", fbp);
    url.searchParams.set("cid3", navigator.userAgent.slice(0, MAX_UA_LENGTH));
    const decorated = url.toString();
    // 同じ値を書き戻すと監視（MutationObserver）が反応し続けるため、変わるときだけ書く
    if (decorated !== href) anchor.setAttribute("href", decorated);
  } catch {
    // URLとして読めない場合は元のリンクのまま
  }
}

function decorateAll() {
  document
    .querySelectorAll<HTMLAnchorElement>(`a[href^="${LME_LINK_PREFIX}"]`)
    .forEach(decorate);
}

export default function LineLinkDecorator() {
  useEffect(() => {
    rememberFbclid();
    decorateAll();

    // ピクセルのCookieは読み込み後に作られるので、タップ直前にも付け直す
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a");
      if (anchor instanceof HTMLAnchorElement) decorate(anchor);
    };
    document.addEventListener("click", handleClick, true);

    // スクロールで後から表示されるヘッダーのボタンなど、あとで描画されたリンクにも付ける
    const observer = new MutationObserver(decorateAll);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["href"],
    });

    return () => {
      document.removeEventListener("click", handleClick, true);
      observer.disconnect();
    };
  }, []);

  return null;
}
