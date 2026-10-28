import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

// エルメ（L Message）のパラメーターエクスポートの受け取り口。
// 友だち追加のたびにエルメがGETで呼び出すので、LPで付け足した cid1〜cid3 を使って
// MetaのコンバージョンAPIへ「実際の友だち追加」を送る。
//   Lead            新規・ブロック解除で、広告のクリック情報（fbc/fbp）があるもの（広告の成果）
//   LineAddNoClick  新規・ブロック解除だが、クリック情報が無いもの（照合用）
//   LineAddExisting 既存の友だち（照合用）
//
// 必要な環境変数:
//   LME_CALLBACK_KEY      エルメに登録するURLの ?key= と一致させる合言葉
//   META_PIXEL_ID         送信先のピクセルID
//   META_CAPI_TOKEN       コンバージョンAPIのアクセストークン
//   META_TEST_EVENT_CODE  （任意）テスト中だけ設定。イベントマネージャの「テストイベント」に表示される

export const dynamic = "force-dynamic";

const GRAPH_API_VERSION = "v21.0";
const EVENT_SOURCE_URL = "https://ast-lp.vercel.app/";
// 個人情報が入る可能性があるためログに値を出さない項目
const PRIVATE_KEY_PATTERN = /name|mail|key|token/i;
const LINE_ID_KEY_PATTERN = /line.*id|user.*id|uid/i;
const FRIEND_TYPES = ["new", "old", "block"];

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function findLineId(params: URLSearchParams): string {
  for (const [key, value] of params) {
    if (LINE_ID_KEY_PATTERN.test(key) && value) return value;
  }
  return "";
}

function findFriendType(params: URLSearchParams): string {
  for (const value of params.values()) {
    if (FRIEND_TYPES.includes(value)) return value;
  }
  return "";
}

function logParams(params: URLSearchParams) {
  const safe: Record<string, string> = {};
  for (const [key, value] of params) {
    safe[key] = PRIVATE_KEY_PATTERN.test(key) ? "(hidden)" : value.slice(0, 120);
  }
  console.log("[lme-callback] received", JSON.stringify(safe));
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const expectedKey = process.env.LME_CALLBACK_KEY;
  if (!expectedKey || params.get("key") !== expectedKey) {
    return new NextResponse("Not Found", { status: 404 });
  }

  logParams(params);

  const fbc = params.get("cid1") || params.get("fbc") || "";
  const fbp = params.get("cid2") || params.get("fbp") || "";
  const userAgent = params.get("cid3") || "";
  const friendType = findFriendType(params);
  const lineId = findLineId(params);

  // 広告の成果（Lead）にするのは、新規・ブロック解除で広告のクリック情報があるものだけ。
  // それ以外も別名のイベントで送り、Vercelのログを見なくても
  // イベントマネージャでエルメの友だち追加数と照合できるようにする。
  let eventName = "Lead";
  if (friendType === "old") {
    eventName = "LineAddExisting";
  } else if (!fbc && !fbp) {
    eventName = "LineAddNoClick";
  }

  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) {
    console.error("[lme-callback] META_PIXEL_ID or META_CAPI_TOKEN is not set");
    return NextResponse.json({ ok: false, reason: "not_configured" });
  }

  const eventTime = Math.floor(Date.now() / 1000);
  // 同じ友だち追加が重複して届いても、Meta側で1件にまとめられるようにする
  const eventId = `line_add_${sha256(`${lineId || fbc || fbp}:${friendType}:${eventName}`).slice(0, 32)}`;

  const userData: Record<string, unknown> = {};
  if (fbc) userData.fbc = fbc;
  if (fbp) userData.fbp = fbp;
  if (userAgent) userData.client_user_agent = userAgent;
  if (lineId) userData.external_id = [sha256(lineId)];

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: eventName,
        event_time: eventTime,
        event_id: eventId,
        // ウェブのイベントはブラウザ情報が必須のため、無い場合は「その他」として送る
        action_source: userAgent ? "website" : "other",
        event_source_url: EVENT_SOURCE_URL,
        user_data: userData,
        custom_data: {
          content_name: "line_friend_add",
          friend_type: friendType || "unknown",
          has_fbc: fbc ? "yes" : "no",
          has_fbp: fbp ? "yes" : "no",
          has_user_agent: userAgent ? "yes" : "no",
        },
      },
    ],
    access_token: token,
  };
  if (process.env.META_TEST_EVENT_CODE) {
    body.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const result = await response.json();
    if (!response.ok) {
      console.error("[lme-callback] Meta error", JSON.stringify(result));
      return NextResponse.json({ ok: false, reason: "meta_error" });
    }
    console.log("[lme-callback] sent", eventName, JSON.stringify(result));
    return NextResponse.json({ ok: true, sent: true, event: eventName });
  } catch (error) {
    console.error("[lme-callback] request failed", String(error));
    return NextResponse.json({ ok: false, reason: "request_failed" });
  }
}
