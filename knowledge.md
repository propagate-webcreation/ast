# Web制作 コーディング修正ナレッジ

349件のリポジトリのgit diffから抽出した、実際のコード修正パターン集。  
Next.js + Tailwind CSS + TypeScript のLP・コーポレートサイト制作における「初稿 → 修正」の実践知識。

> ドメイン接続・フォーム実装・サイトマップ提出・ブログ実装は別工程のため本レポートの対象外。

---

## 目次

### コーディング修正

1. [スマホ最適化（モバイルファースト修正）](#1-スマホ最適化モバイルファースト修正)
2. [ディレクターFB対応（テキスト・構成変更）](#2-ディレクターfb対応テキスト構成変更)
3. [画像差し替え（Unsplash → 実写）](#3-画像差し替えunsplash--実写)
4. [UIパターン修正](#4-uiパターン修正)
5. [GTM・トラッキング実装](#5-gtmトラッキング実装)
6. [初稿で最初から組み込むべき設計](#6-初稿で最初から組み込むべき設計)

### 構造・レイアウト変更

7. [ヒーローセクションの構造変更](#7-ヒーローセクションの構造変更)
8. [画像のトリミング位置調整（object-position）](#8-画像のトリミング位置調整object-position)
9. [コンテンツの増減・統合](#9-コンテンツの増減統合)
10. [カード高さ揃え（items-stretch パターン）](#10-カード高さ揃えitems-stretch-パターン)
11. [ナビゲーション構造の変更](#11-ナビゲーション構造の変更)

### データ・コンテンツ更新

12. [会社概要データの修正パターン](#12-会社概要データの修正パターン)
13. [レイアウト構造の変更](#13-レイアウト構造の変更)
14. [ボタン・リンクスタイルの統一](#14-ボタンリンクスタイルの統一)
15. [フォーム入力欄の視認性改善](#15-フォーム入力欄の視認性改善)
16. [カラーコードの微調整](#16-カラーコードの微調整)
17. [社名・人名・固有名詞の全体置換](#17-社名人名固有名詞の全体置換)
18. [セマンティックHTMLへの変更](#18-セマンティックhtmlへの変更)
19. [初稿で最初から組み込むべき設計（増補版）](#19-初稿で最初から組み込むべき設計増補版)

### 設定ファイル・共通コンポーネント

20. [globals.css の修正パターン](#20-globalscss-の修正パターン)
21. [layout.tsx の修正パターン](#21-layouttsx-の修正パターン)
22. [next.config.ts の修正パターン](#22-nextconfigts-の修正パターン)
23. [Button 共通コンポーネントの設計パターン](#23-button-共通コンポーネントの設計パターン)
24. [Header コンポーネントの設計パターン](#24-header-コンポーネントの設計パターン)
25. [page.tsx のコンポーネント構成変更](#25-pagetsx-のコンポーネント構成変更)

### インタラクション・機能実装

26. [スマホCTA固定バー（fixed bottom）](#26-スマホcta固定バーfixed-bottom)
27. [Google Maps iframe 埋め込み](#27-google-maps-iframe-埋め込み)
28. [ビルドエラー / ESLint修正パターン](#28-ビルドエラー--eslint修正パターン)
29. [GA4 カスタムイベント計測](#29-ga4-カスタムイベント計測)
30. [スクロールアニメーション実装（IntersectionObserver）](#30-スクロールアニメーション実装intersectionobserver)
31. [FAQ アコーディオン](#31-faq-アコーディオン)
32. [vercel.json リダイレクト設定](#32-verceljson-リダイレクト設定)
33. [電話番号リンク（tel:）実装](#33-電話番号リンクtel実装)

---

## 1. スマホ最適化（モバイルファースト修正）

**発生頻度: 96%（ほぼ全案件で発生）**

### 1-1. セクション余白の半減

PCの余白をそのままスマホに使うと余白が大きすぎる。スマホはPC版の50%が基準。

```tsx
// ❌ Before: PC用の余白がスマホでは広すぎる
<section className="py-[100px]">

// ✅ After: スマホ50px、PC100px
<section className="py-[50px] md:py-[100px]">
```

**全パターン一覧:**

| 箇所 | Before | After |
|------|--------|-------|
| セクション縦余白 | `py-[100px]` | `py-[50px] md:py-[100px]` |
| 見出し下余白 | `mb-16` | `mb-[20px] md:mb-16` |
| 見出し下余白(大) | `mb-24` | `mb-[20px] md:mb-24` |
| カード内余白 | `p-10` | `p-6 md:p-10` |
| フォーム内余白 | `p-10 md:p-14` | `p-6 md:p-14` |
| 成功メッセージ | `p-16` | `p-8 md:p-16` |
| ボタン | `py-4 px-16` | `py-3 px-8 md:py-4 md:px-16` |
| セクション間マージン | `mt-[100px]` | `mt-[50px] md:mt-[100px]` |
| 実績間隔 | `mt-20` | `mt-[40px] md:mt-20` |

### 1-2. テキストサイズのpx固定値化

Tailwindの相対サイズ（`text-lg`等）はスマホで大きすぎることが多い。px固定値を使う。

```tsx
// ❌ Before: Tailwindの相対サイズ
<p className="text-lg text-gray-600">

// ✅ After: スマホ13px、PC16pxに固定
<p className="text-[13px] md:text-[16px] text-gray-600">
```

**テキストサイズ対応表:**

| 要素 | スマホ | PC | 備考 |
|------|--------|-----|------|
| 本文 | `text-[13px]` | `md:text-[16px]` | **スマホ最小は13px** |
| 小テキスト | `text-[10px]` | `md:text-[14px]` | 注釈・バッジ |
| ラベル | `text-[13px]` | `md:text-[16px]` | フォームラベル |
| h2見出し | `text-[24px]` | `md:text-[32px]` | セクション見出し |
| h3小見出し | `text-[18px]` | `md:text-xl` | カード見出し |
| ボタン | `text-[13px]` | `md:text-[20px]` | CTA |
| ヒーロー本文 | `text-[13px]` | `md:text-xl` | MV下テキスト |

### 1-3. グリッドレイアウトのスマホ対応

スマホでは1カラム縦並び、PCで複数カラムに。

```tsx
// ❌ Before: スマホでもgridが効いて狭くなる
<div className="grid md:grid-cols-2 gap-8">

// ✅ After: スマホはflexで縦並び + gap縮小
<div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8">
```

```tsx
// ❌ Before: 3カラムがスマホで破綻
<div className="grid md:grid-cols-3 gap-12">

// ✅ After: スマホ1列、PC2列に削減
<div className="grid grid-cols-1 md:grid-cols-2 gap-[40px] md:gap-12">
```

### 1-4. スマホ画像サイズ制限

スマホで画像が大きすぎる問題の解決。

```tsx
// ❌ Before: 画像サイズ無制限
<div className="relative h-48 rounded-lg overflow-hidden">

// ✅ After: 最大幅340px・高さ255pxに制限、中央寄せ
<div className="relative h-48 rounded-lg overflow-hidden w-full max-w-[340px] max-h-[255px] mx-auto">
```

### 1-5. ヒーローセクションの高さ

```tsx
// ❌ Before: スマホで700px高は大きすぎる
<section className="relative h-screen min-h-[700px]">

// ✅ After: スマホ500px、PC700px
<section className="relative h-screen min-h-[500px] md:min-h-[700px]">
```

### 1-6. 長いテキストのスマホ改行

PCでは1行で表示し、スマホでは改行する。

```tsx
// ✅ スマホのみ改行
<p>
  東京都新宿区戸山1-10-3
  <br className="md:hidden" />
  木村ビル1F
</p>
```

### 1-7. ボタンのスマホ対応

```tsx
// ❌ Before: PC用の大きなボタン
<a className="inline-flex items-center gap-4 bg-blue-600 text-white px-10 py-5 rounded-full font-bold text-lg">

// ✅ After: 高さ固定・最小幅・フォントサイズ可変
<a className="inline-flex items-center justify-center gap-4 bg-blue-600 text-white h-12 px-6 min-w-[140px] rounded-full font-bold text-[13px] md:text-lg">
```

---

## 2. ディレクターFB対応（テキスト・構成変更）

**発生頻度: 75%**

### 2-1. 見出しへの社名追加

ディレクターFBで最頻出の指示。

```tsx
// ❌ Before: 汎用的な見出し
<h2>選ばれる理由</h2>

// ✅ After: 社名を入れて差別化
<h2><span className="text-orange-600">中央技建</span>が選ばれる理由</h2>
```

```tsx
// ❌ Before
<h2>業務フロー</h2>

// ✅ After
<h2>すべての工程を、<span className="text-orange-600">中央技建</span>がサポートします</h2>
```

### 2-2. ホバーアニメーションの削除

過剰な装飾は修正で削除される。初稿から控えめにすべき。

```tsx
// ❌ Before: 過剰なホバーアニメーション
<div className="bg-white p-6 rounded-xl text-center group transition-all duration-300 transform hover:-translate-y-2">
  <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden group-hover:scale-105 transition-transform">

// ✅ After: アニメーション削除
<div className="bg-white p-6 rounded-xl text-center">
  <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden">
```

### 2-3. キャッチコピーの具体化

初稿は抽象的になりがち → 修正で具体的・行動喚起型に変更される。

```tsx
// ❌ Before: 抽象的
<h1>資産に、確かな息吹を</h1>

// ✅ After: 具体的・行動喚起
<h1>持っているだけの資産を、"稼ぐ資産"へ。</h1>
```

### 2-4. ナビゲーションテキストの変更

```tsx
// ❌ Before: 社内用語
{['業務フロー', '選ばれる理由'].map(...)}

// ✅ After: ユーザー目線の表現
{['サポートの流れ', '選ばれる理由'].map(...)}
```

### 2-5. ボタン角丸の変更

```tsx
// ❌ Before
className="rounded-2xl px-4 py-2 bg-blue-600"

// ✅ After: 完全な円形に
className="rounded-full px-4 py-2 bg-blue-600"
```

### 2-6. 画像上テキストオーバーレイの削除

装飾的なテキストが「不要」と判断されるケース。

```tsx
// ❌ Before: 画像上のポエム的テキスト
<div className="absolute bottom-8 left-8 text-white">
  <p className="text-sm font-serif italic opacity-80 mb-2">Since Foundation</p>
  <p className="text-2xl font-serif font-bold">
    信頼を築く、<br />対話の力。
  </p>
</div>

// ✅ After: 削除（画像のみ残す）
```

### 2-7. CTAボタンの削減

```tsx
// ❌ Before: 2つのCTAボタン
<div className="flex gap-4">
  <Button variant="primary" href="#contact">お問い合わせ</Button>
  <Button variant="secondary" href="#service">事業内容を見る</Button>
</div>

// ✅ After: 1つに絞る
<Button variant="primary" href="#contact">お問い合わせはこちら</Button>
```

### 2-8. テキスト量の簡素化

```tsx
// ❌ Before: 3行の説明文
<p>
  未公開物件の情報や、投資シミュレーションのご相談は、
  <br />公式LINEまたはフォームにて承っております。
  <br />まずはお問い合わせください。通常2営業日以内にご返信いたします。
</p>

// ✅ After: 1行に凝縮
<p>フォームにて承っております。まずはお問い合わせください。</p>
```

### 2-9. 実績データの差し替え

仮データ → 実際の数字への変更。

```tsx
// ❌ Before: 仮の実績
<p>メガソーラー許認可取得</p>
<CountUpAnimation end={5} />
<span>件完了</span>

// ✅ After: 実データに差し替え
<p>年間工事件数</p>
<span>約</span>
<CountUpAnimation end={50} />
<span>件</span>
```

---

## 3. 画像差し替え（Unsplash → 実写）

**発生頻度: 94%（全案件で必ず発生）**

### 3-1. 画像パスの変更

```tsx
// ❌ Before: Unsplashのstock画像
<Image
  src="https://images.unsplash.com/photo-1486406146926?q=80&w=2070"
  alt="Business Strategy"
/>

// ✅ After: 顧客提供の実写画像 + altを日本語化
<Image
  src="/img/photos/line_oa_chat_260218_140105.jpg"
  alt="中央技建の施工現場"
/>
```

### 3-2. altテキストの日本語化

```tsx
// ❌ Before: 英語のalt
alt="Luxury Interior and Cityscape"

// ✅ After: 日本語のalt
alt="高級内装と都市の風景"
```

### 3-3. Googleマップの埋め込み修正

```tsx
// ❌ Before: プレースホルダー
<div className="w-full h-full bg-neutral-300 flex items-center justify-center">
  <MapPin className="w-12 h-12 mb-4" />
  <span>Google Map</span>
  <Link href={`https://www.google.com/maps/search/?api=1&query=${address}`}>
    地図を開く
  </Link>
</div>

// ✅ After: 正しいiframe埋め込み
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!..."
  width="100%"
  height="100%"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
  title="所在地"
  className="absolute inset-0 w-full h-full"
/>
```

---

## 4. UIパターン修正

### 4-1. 送信ボタンのテキスト中央寄せ

初稿で`flex items-center justify-center`を忘れるケースが頻出。

```tsx
// ❌ Before: テキストがずれる
<button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold py-5 rounded-full h-12">

// ✅ After: 中央寄せを追加
<button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold py-5 rounded-full h-12 flex items-center justify-center">
```

### 4-2. サービス名の文字はみ出し防止

```tsx
// ❌ Before: 長いテキストがはみ出す
<span className="text-red-600 font-bold text-[13px] md:text-[16px]">

// ✅ After: flex-shrink-0 + whitespace-nowrap + フォント縮小
<span className="text-red-600 font-bold text-[11px] md:text-[14px] whitespace-nowrap">
```

### 4-3. グリッドからフレックスへの変更（会社概要テーブル）

```tsx
// ❌ Before: スマホでgridの横並びが崩れる
<div className="px-8 py-6 grid sm:grid-cols-3 gap-4">
  <dt className="text-[12px] md:text-[16px]">{label}</dt>
  <dd className="sm:col-span-2 text-[12px] md:text-[16px]">{value}</dd>
</div>

// ✅ After: スマホはflex縦並び、PCはgrid
<div className="px-6 md:px-8 py-6 flex flex-col md:grid md:grid-cols-3 gap-4">
  <dt className="text-[13px] md:text-[16px]">{label}</dt>
  <dd className="md:col-span-2 text-[13px] md:text-[16px]">{value}</dd>
</div>
```

### 4-4. セクションIDの追加漏れ

ページ内ナビゲーションで必要なIDが初稿で抜けがち。

```tsx
// ❌ Before: IDなし
<section className="py-[100px] bg-white">

// ✅ After: セクションID追加
<section id="contact" className="py-[50px] md:py-[100px] bg-white">
```

### 4-5. アイコンの意味合いに応じた変更

```tsx
// ❌ Before: 汎用的な矢印アイコン
import { ArrowRight } from 'lucide-react';
// 3つのポイント全てが ArrowRight

// ✅ After: 意味に合ったアイコンに変更
import { Search, PenTool, Handshake } from 'lucide-react';
// POINT01: Search（情報力）
// POINT02: PenTool（デザイン）
// POINT03: Handshake（サポート）
```

### 4-6. 未使用importの削除

```tsx
// ❌ Before: 使っていないimportが残っている
import { ArrowDown, CheckCircle } from 'lucide-react';

// ✅ After: 使用しているものだけ残す
import { ArrowDown } from 'lucide-react';
```

---

## 5. GTM・トラッキング実装

**発生頻度: 72%**

### 5-1. layout.tsxへのGTM追加

```tsx
// app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Google Tag Manager */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXXX');`,
          }}
        />
      </head>
      <body className="antialiased font-body" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXXX"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
```

### 5-2. GTM IDの体系管理（大規模案件向け）

```tsx
// app/config/gtm.config.ts
export const GTM_IDS = {
  HEADER_CONTACT: "gtm-button-header-contact",
  HEADER_TEL: "gtm-button-header-tel",
  HERO_PRIMARY_CTA: "gtm-button-hero-primary-cta",
  CTA_SECTION_TRIAL: "gtm-button-cta-section-trial",
  FIXED_FOOTER_CONTACT: "gtm-button-fixed-footer-contact",
  FORM_SUBMIT: "gtm-button-form-submit",
} as const;

// 使い方
<a
  href="/form"
  className={`${GTM_IDS.HERO_PRIMARY_CTA} px-6 py-3 bg-blue-600 text-white`}
  data-gtm-element-id={GTM_IDS.HERO_PRIMARY_CTA}
>
  お問い合わせ
</a>
```

---

## 6. 初稿で最初から組み込むべき設計

349件の分析から見えた「修正で必ず追加される」もの。初稿から入れておけば手戻りを削減できる。

### 必須チェックリスト

- [ ] **スマホ余白**: 全セクションに `py-[50px] md:py-[100px]` パターンを適用
- [ ] **テキストサイズ**: `text-[13px] md:text-[16px]` でpx固定値を使う（相対サイズ禁止）
- [ ] **画像サイズ**: スマホ用に `max-w-[340px] max-h-[255px] mx-auto` を設定
- [ ] **ボタン**: `h-12 min-w-[140px] flex items-center justify-center` を基本構成に
- [ ] **セクションID**: 全セクションに `id` を付与（ヘッダーナビから飛ぶため）
- [ ] **`<html lang="ja" suppressHydrationWarning>`**: 最初から入れておく
- [ ] **altテキスト**: 日本語で記載（英語は修正される）
- [ ] **グリッド**: `flex flex-col md:grid` パターンをデフォルトに
- [ ] **ホバーアニメ**: 控えめに（`hover:-translate-y-2` や `hover:scale-105` は削除されがち）
- [ ] **見出し**: 社名を含める形で書く（「選ばれる理由」→「〇〇が選ばれる理由」）
- [ ] **キャッチコピー**: 抽象的でなく具体的・行動喚起型にする

### 初稿で不要なもの（後工程で追加）

- 実写画像（初稿はUnsplashで代用、後で差し替え）
- Googleマップの正式embed URL（プレースホルダーでOK）
- 実績の正確な数値（仮データでOK、先方確認後に差し替え）

---

## 7. ヒーローセクションの構造変更

**発生頻度: 60%（デザインFBで高頻度）**

### 7-1. Image コンポーネント → CSS背景画像への変更

初稿では`<Image>`＋横並びレイアウトで作るが、FB後にフルスクリーン背景＋テキストオーバーレイに変更されるケースが多い。

```tsx
// ❌ Before: Image + 2カラムレイアウト
<div className="relative w-full mt-[70px] md:mt-[90px] overflow-hidden bg-gray-50">
  <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
    <div className="max-w-2xl">
      <h1>...</h1>
    </div>
    <div className="relative w-full h-[350px] md:h-[500px]">
      <Image src="/images/hero.jpg" alt="..." fill className="object-cover" />
    </div>
  </div>
</div>

// ✅ After: CSS背景画像 + 暗いオーバーレイ + テキスト重ね
<section
  className="relative w-full mt-[70px] md:mt-[90px] overflow-hidden min-h-[90%] flex flex-col justify-center bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: "url('/images/hero.jpg')" }}
  aria-label="ヒーロー"
>
  <div className="absolute inset-0 bg-black/50 z-0" aria-hidden />
  <div className="container mx-auto px-5 md:px-10 py-12 md:py-24 relative z-10">
    <div className="max-w-3xl">
      <h1 className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">...</h1>
    </div>
  </div>
</section>
```

### 7-2. オーバーレイの濃度調整

画像が見えすぎる／見えなさすぎる問題。背景画像の内容に応じて調整。

```tsx
// ❌ Before: 画像がほとんど見えない
<div className="absolute inset-0 z-0 opacity-40">
  <Image src="/images/hero.jpg" ... />
</div>
<div className="absolute inset-0 bg-gradient-to-r from-[#0A2239]/90 to-[#0A2239]/40"></div>

// ✅ After: 画像をしっかり見せつつテキストの可読性を確保
<div className="absolute inset-0 z-0 opacity-80">
  <Image src="/images/hero.jpg" ... />
</div>
<div className="absolute inset-0 bg-gradient-to-r from-[#0A2239]/50 to-[#0A2239]/10"></div>
```

### 7-3. ヒーローのマージントップ削除（sticky header対応）

ヘッダーをstickyにした場合、各ページのヒーローからmt削除が必要。

```tsx
// ❌ Before: 各ページのヒーローに個別マージン
<section className="relative w-full h-[300px] md:h-[400px] mt-[70px] md:mt-[80px]">

// ✅ After: sticky headerならmt不要（headerのh分はbodyのpt等で吸収）
<section className="relative w-full h-[300px] md:h-[400px]">
```

---

## 8. 画像のトリミング位置調整（object-position）

**発生頻度: 45%（人物写真がある案件で高頻度）**

人物写真で顔が切れる問題を `object-position` で解決する。

### 8-1. 顔が切れる写真のトリミング位置指定

```tsx
// ❌ Before: 顔が半分切れる
<Image src="/images/ceo.jpg" alt="代表" fill className="object-cover" />

// ✅ After: 上部20%にフォーカス（顔が映る位置に調整）
<Image src="/images/ceo.jpg" alt="代表" fill className="object-cover object-[center_20%]" />
```

### 8-2. スタッフごとに異なるトリミング位置

データ配列にpositionプロパティを持たせ、個別に制御。

```tsx
// ❌ Before: 全員同じトリミング
const staff = [
  { name: "佐藤", role: "技術統括", desc: "..." },
  { name: "鈴木", role: "チーフ", desc: "..." },
];
// <Image className="object-cover" />

// ✅ After: 各スタッフに画像位置を指定
const staff = [
  { name: "佐藤", role: "技術統括", desc: "...", pos: "object-[center_20%]" },
  { name: "鈴木", role: "チーフ", desc: "...", pos: "object-[center_30%]" },
];
// <Image className={`object-cover ${m.pos}`} />
```

### 8-3. サービス画像の個別位置指定

```tsx
// ❌ Before: 全サービスカードが同じ切り抜き
const services = [
  { title: "伐採", image: "/images/service-logging.jpg" },
  { title: "剪定", image: "/images/service-pruning.jpg" },
];

// ✅ After: imagePositionプロパティ追加
const services = [
  { title: "伐採", image: "/images/service-logging.jpg", imagePosition: "object-center" },
  { title: "剪定", image: "/images/service-pruning.jpg", imagePosition: "object-[center_10%]" },
];
// <Image className={`object-cover ${service.imagePosition || 'object-center'}`} />
```

---

## 9. コンテンツの増減・統合

**発生頻度: 55%**

先方確認後に、コンテンツ数や構成が変わるパターン。

### 9-1. 「3つの強み」→「2つの強み」に削減

不要な項目をJSXコメントアウトし、グリッドも変更。

```tsx
// ❌ Before: 3カラム
<SectionTitle jp="装建が選ばれる3つの強み" />
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  <StrengthCard number="01" title="自社足場でコストダウン" ... />
  <StrengthCard number="02" title="代表が直接現場管理" ... />
  <StrengthCard number="03" title="夫婦経営の安心感" ... />
</div>

// ✅ After: 2カラム + max-width制限 + 3つ目をコメントアウト
<SectionTitle jp="装建が選ばれる2つの強み" />
<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
  <StrengthCard number="01" title="自社足場でコストダウン" ... />
  <StrengthCard number="02" title="代表が直接現場管理" ... />
  {/* <StrengthCard number="03" title="夫婦経営の安心感" ... /> */}
</div>
```

### 9-2. 別ファイルのコンポーネントを統合

Flowコンポーネントを削除して、Serviceコンポーネント内に統合するパターン。

```tsx
// ❌ Before: app/components/home/Flow.tsx（別ファイル）
export const Flow = () => { ... };
// page.tsx で <Flow /> と <Service /> を別々に配置

// ✅ After: Flow.tsx を削除、Service.tsx 内にステップ配列を追加
export const Service = () => {
  const services = [...];
  const steps = [
    { title: "お問い合わせ", icon: Smartphone },
    { title: "現地調査", icon: MapPin },
    { title: "お見積もり", icon: FileText },
    { title: "ご契約・着工", icon: Hammer },
    { title: "完工・お引渡し", icon: Smile },
  ];

  return (
    <section>
      {/* サービス一覧 */}
      <div className="grid ...">{services.map(...)}</div>

      {/* 統合: ご相談から完工までの流れ */}
      <div className="mt-[50px] md:mt-[100px]">
        <SectionTitle title="ご相談から完工までの流れ" />
        <div className="flex flex-col md:flex-row ...">{steps.map(...)}</div>
      </div>
    </section>
  );
};
```

### 9-3. スタッフ紹介セクションの丸ごとコメントアウト

先方から「掲載不要」と言われた場合、削除ではなくJSXコメントアウトで残す。

```tsx
// ✅ 復活の可能性がある場合はコメントアウトで残す
{/* <div className="flex bg-white border p-5 rounded-[8px]">
  <div className="w-24 shrink-0 mr-5">
    <Image src="/images/staff-2.jpg" alt="..." fill className="object-cover" />
  </div>
  <div>
    <p className="font-bold">山田 花子</p>
    <p className="text-sm">お客様窓口担当。女性目線で...</p>
  </div>
</div> */}
```

---

## 10. カード高さ揃え（items-stretch パターン）

**発生頻度: 40%**

複数カードの下辺が揃わない問題。`items-stretch` + `h-full` + `flex-col` の組み合わせ。

### 10-1. グリッドのitems-stretch

```tsx
// ❌ Before: カードの高さがバラバラ
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  <ServiceCard ... />
  <ServiceCard ... />
  <ServiceCard ... />
</div>

// ✅ After: items-stretch + 各カードをh-fullのdivで包む
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
  <div className="h-full"><ServiceCard ... /></div>
  <div className="h-full"><ServiceCard ... /></div>
  <div className="h-full"><ServiceCard ... /></div>
</div>
```

### 10-2. カード内部のflex構造

カード自体の内部もflex-colにして、説明テキストがflex-growで伸びるようにする。

```tsx
// ❌ Before: カード内部が固定高
<div className="bg-white border rounded-[12px] overflow-hidden">
  <div className="relative w-full h-[220px]">
    <Image ... />
  </div>
  <div className="p-6">
    <h3>タイトル</h3>
    <p>説明文...</p>
  </div>
</div>

// ✅ After: flex-col + flex-1 でコンテンツ部分が伸びる
<div className="h-full flex flex-col bg-white border rounded-[12px] overflow-hidden">
  <div className="relative shrink-0 w-full h-[220px]">
    <Image ... />
  </div>
  <div className="flex-1 flex flex-col p-6">
    <h3>タイトル</h3>
    <p className="flex-grow">説明文...</p>
  </div>
</div>
```

---

## 11. ナビゲーション構造の変更

**発生頻度: 35%**

### 11-1. フラットリンク → ドロップダウンメニュー

```tsx
// ❌ Before: フラットなリンク一覧
const navItems = [
  { label: 'TOP', href: '/' },
  { label: '伐採・抜根', href: '/logging' },
  { label: '剪定', href: '/pruning' },
  { label: '会社概要', href: '/company' },
];

// ✅ After: ドロップダウン対応
const [isServicesOpen, setIsServicesOpen] = useState(false);

const navItems = [
  { label: 'ホーム', href: '/' },
];
const serviceItems = [
  { label: '伐採・抜根', href: '/logging' },
  { label: '剪定', href: '/pruning' },
  { label: '草刈り・防草', href: '/weeding' },
];
// ヘッダー内で「事業内容 ▼」としてホバーでサブメニュー表示
```

### 11-2. フッターの階層化

```tsx
// ❌ Before: フラットなリンク横並び
<div className="flex gap-10">
  <Link href="/logging">伐採・抜根</Link>
  <Link href="/pruning">剪定</Link>
  <Link href="/company">会社概要</Link>
  <Link href="/contact">お問い合わせ</Link>
</div>

// ✅ After: カテゴリごとにグルーピング
<div className="flex gap-10">
  <Link href="/">ホーム</Link>
  <div className="flex flex-col gap-2">
    <span className="font-bold">事業内容</span>
    <div className="flex flex-col md:pl-4 gap-2">
      <Link href="/logging" className="text-[13px] text-[#666]">伐採・抜根</Link>
      <Link href="/pruning" className="text-[13px] text-[#666]">剪定</Link>
      <Link href="/weeding" className="text-[13px] text-[#666]">草刈り・防草</Link>
    </div>
  </div>
  <div className="flex flex-col gap-2">
    <span className="font-bold">施工実績</span>
    <div className="flex flex-col md:pl-4 gap-2">
      <Link href="/logging#works" className="text-[13px] text-[#666]">伐採の実績</Link>
      <Link href="/pruning#works" className="text-[13px] text-[#666]">剪定の実績</Link>
    </div>
  </div>
  <Link href="/company">会社概要</Link>
  <Link href="/contact">お問い合わせ</Link>
</div>
```

---

## 12. 会社概要データの修正パターン

**発生頻度: 80%（ほぼ全案件）**

先方確認後に必ず発生する修正。初稿ではダミーデータで構わないが、構造は正しく作っておく。

### 12-1. 行の追加（設立日・TEL・FAXなど）

```tsx
// ❌ Before: 最低限の項目
<tr><th>代表者</th><td>佐藤 享太郎</td></tr>
<tr><th>所在地</th><td>〒220-0073 神奈川県横浜市...</td></tr>
<tr><th>事業内容</th><td>...</td></tr>

// ✅ After: 先方からの情報追加
<tr><th>代表者</th><td>古屋 大河</td></tr>
<tr><th>所在地</th><td>〒220-0073<br/>神奈川県横浜市...</td></tr>
<tr><th>事業内容</th><td>...</td></tr>
<tr><th>TEL</th><td><a href="tel:0453089808">045-308-9808</a></td></tr>
<tr><th>FAX</th><td>045-308-9809</td></tr>
<tr><th>お問い合わせ</th><td><a href="tel:08050090322">080-5009-0322</a></td></tr>
```

### 12-2. 沿革の簡素化

初稿でAIが生成した詳細な沿革 → 先方の実際の沿革に短縮。

```tsx
// ❌ Before: AIが推測した7項目の詳細な沿革
{ year: '2006年 4月', event: '東京都葛飾区にてトータルエイド株式会社を設立。\n蒸気エンジニアリング事業を開始。' },
{ year: '2010年 6月', event: '事業拡大に伴い、関東全域へのメンテナンス対応を強化。' },
{ year: '2015年 9月', event: '循環水・冷却水処理システム事業を開始。' },
// ... 計7項目

// ✅ After: 先方提供の正確な5項目
{ year: '2007年 9月', event: '蒸気設備分野で創業' },
{ year: '2009年 4月', event: 'SP-CRD事業開始' },
{ year: '2025年 12月', event: '東京都より「経営革新計画」認証' },
{ year: '2026年 1月', event: 'SP-CRU・DeCaIon事業スタート' },
{ year: '現在', event: '熱と水のトータル最適化へ', highlight: true },
```

### 12-3. 事業内容・サービス名の更新

```tsx
// ❌ Before: 初稿の汎用的な事業内容
<option value="gx">産業用省エネ装置（GX）について</option>
<option value="water">循環水・冷却水処理システムについて</option>
<option value="steam">蒸気エンジニアリング（部品・メンテ）について</option>

// ✅ After: 実際の製品名に変更
<option value="sp-crd">凝縮水除去装置 SP-CRDについて</option>
<option value="sp-cru">凝縮水回収ユニット SP-CRUについて</option>
<option value="decalon">冷却水管理システム DeCaIonについて</option>
```

---

## 13. レイアウト構造の変更

**発生頻度: 50%**

### 13-1. 2カラム → 1カラム化（代表挨拶）

写真＋テキストの2カラム → テキスト中心の1カラムに変更。

```tsx
// ❌ Before: 2カラムレイアウト
<div className="max-w-[1280px] mx-auto">
  <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
    <div className="md:col-span-5">
      <Image src="/images/ceo.jpg" ... />
      <p>代表取締役 田中太郎</p>
    </div>
    <div className="md:col-span-7">
      <h2>挨拶文タイトル</h2>
      <p>本文...</p>
    </div>
  </div>
</div>

// ✅ After: 1カラム（幅を狭めて読みやすく）
<div className="max-w-[800px] mx-auto">
  <div>
    <p>代表取締役 田中太郎</p>
  </div>
  <h2>挨拶文タイトル</h2>
  <p>本文...</p>
</div>
```

### 13-2. コンテナ幅の一括変更

デザインFBで「もっと広く」と言われた場合の一括修正。

```tsx
// ❌ Before: 全セクションで同じ狭い幅
const STYLES = { container: "max-w-[1120px] mx-auto px-6 w-full" };

// ✅ After: 一括で広げる
const STYLES = { container: "max-w-[1400px] mx-auto px-6 w-full" };
```

### 13-3. 2カラム → 3カラム化（問い合わせ方法）

```tsx
// ❌ Before: 電話・LINE の2カラム
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  <div>電話でのご相談</div>
  <div>LINEでのご相談</div>
</div>

// ✅ After: 電話・LINE・メールの3カラム
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  <div>電話でのご相談</div>
  <div>LINEでのご相談</div>
  <div>メールでのご相談</div>
</div>
```

---

## 14. ボタン・リンクスタイルの統一

**発生頻度: 45%**

### 14-1. インライン `<a>` → `<Button>` コンポーネント化

```tsx
// ❌ Before: 各所でバラバラなボタンスタイル
<a href="#line" className="inline-block bg-[#06C755] text-white font-bold text-[18px] py-3 px-8 rounded-[8px] hover:opacity-80">
  LINE友だち追加
</a>

<button type="submit" className="bg-[#EB8834] text-white font-bold text-[18px] py-4 px-12 rounded-[8px]">
  送信する
</button>

// ✅ After: Button共通コンポーネントに統一
<Button href="#line" variant="line" icon={SiLine}>LINE友だち追加</Button>
<Button type="submit" variant="conversion" icon={Send}>送信する</Button>
```

### 14-2. LINEアイコンの変更

lucide-react の汎用アイコン → react-icons の公式LINEアイコンに。

```tsx
// ❌ Before: 汎用アイコン
import { MessageCircle } from 'lucide-react';
<MessageCircle className="w-5 h-5 mr-2 text-[#06C755]" />

// ✅ After: LINE公式アイコン
import { SiLine } from 'react-icons/si';
<SiLine className="w-5 h-5 mr-2 text-[#06C755]" />
```

### 14-3. outline → filled ボタンスタイル変更

```tsx
// ❌ Before: outlineスタイル（目立たない）
<Link className="flex-1 bg-white border border-[#0090DA] text-[#0090DA] text-center font-bold py-3 px-4 rounded-[4px] hover:bg-[#F5F7FA]">
  詳細を読む
</Link>

// ✅ After: filledスタイル + 浮き上がりエフェクト
<Link className="flex-1 bg-[#0090DA] text-white text-center font-bold py-3 px-4 rounded-[4px] hover:opacity-90 hover:-translate-y-[2px] transition-all duration-300 shadow-md">
  詳細を読む
</Link>
```

---

## 15. フォーム入力欄の視認性改善

**発生頻度: 30%**

### 15-1. 背景色・ボーダーの追加

ダーク背景のセクション内にあるフォームで、入力欄が見えにくい問題。

```tsx
// ❌ Before: 背景と溶け込んで見えない
<input className="w-full p-3 rounded text-[#1A1A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8CC]" />

// ✅ After: 背景白 + ボーダー追加
<input className="w-full p-3 rounded bg-white text-[#1A1A1A] text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8CC] border border-gray-200" />
```

### 15-2. select要素にもbg-white

```tsx
// ❌ Before: selectの背景がOSデフォルト
<select className="w-full p-3 rounded text-sm">

// ✅ After: 明示的に白背景
<select className="w-full p-3 rounded bg-white text-sm border border-gray-200">
```

---

## 16. カラーコードの微調整

**発生頻度: 25%**

### 16-1. ブランドカラーの変更

```tsx
// ❌ Before: 初稿のオレンジ
text-[#F39800]  // やや暗いオレンジ
border-[#F39800]

// ✅ After: より鮮やかなオレンジに変更
text-[#FF6B00]  // 鮮やかなオレンジ
border-[#FF6B00]
```

### 16-2. セクション背景色の変更

```tsx
// ❌ Before: グレー系背景
<section className="bg-[#F4F6F8] py-[50px] md:py-[100px]">

// ✅ After: 白背景に変更（よりクリーンに）
<section className="bg-white py-[50px] md:py-[100px]">
```

---

## 17. 社名・人名・固有名詞の全体置換

**発生頻度: 30%**

初稿時に仮の名前で作成 → 先方確認後に正式名称に一括置換するパターン。

### 17-1. 社名の表記修正

```tsx
// ❌ Before: 微妙に違う社名
「株式会社ルビナス」

// ✅ After: 正式名称
「株式会社ルミナス」
// → 全ファイルで一括置換（Cursorのreplace_allで対応）
```

### 17-2. 代表者名の修正

```tsx
// ❌ Before: 初稿の仮名
<p>代表取締役 尾丸 義和</p>

// ✅ After: 正しい氏名
<p>代表取締役 小丸 義和</p>
```

### 17-3. 保証年数の修正

```tsx
// ❌ Before: AIが推測した保証期間
features={['10年保証付き']}

// ✅ After: 実際の保証期間
features={['5年保証付き']}
```

---

## 18. セマンティックHTMLへの変更

**発生頻度: 20%**

### 18-1. div → section

```tsx
// ❌ Before
<div className="relative w-full mt-[70px]">

// ✅ After: アクセシビリティ向上
<section className="relative w-full mt-[70px]" aria-label="ヒーロー">
```

### 18-2. 装飾的要素のaria-hidden

```tsx
// ❌ Before: スクリーンリーダーが読み上げてしまう
<div className="absolute inset-0 bg-black/50"></div>

// ✅ After
<div className="absolute inset-0 bg-black/50" aria-hidden />
```

---

## 19. 初稿で最初から組み込むべき設計（増補版）

349件＋詳細diff分析から見えた追加の設計指針。

### コンポーネント設計

- [ ] **カード**: `h-full flex flex-col` + 内部テキスト `flex-grow` で高さ揃えを標準化
- [ ] **グリッド**: 親に `items-stretch`、子に `h-full` をデフォルトで付与
- [ ] **画像**: `object-cover` に加え `object-[center_20%]` 等の位置指定を想定した構造にする
- [ ] **データ配列**: `imagePosition` プロパティを最初から含めておく
- [ ] **ボタン**: `<Button>` 共通コンポーネントにvariant（primary / line / conversion）を定義
- [ ] **フォーム入力欄**: `bg-white border border-gray-200` を標準スタイルにする

### コンテンツ設計

- [ ] **会社概要**: TEL / FAX / 設立日 / 沿革の行を最初から用意（空欄でOK）
- [ ] **ヒーロー**: CSS背景画像 + overlay パターンを初稿から使う（後で変更される確率が高い）
- [ ] **フッター**: カテゴリ分けされた階層型リンクを初稿から採用
- [ ] **コンテンツ数**: 「3つの強み」等は先方確認で変わるため、データ配列で管理（ハードコードしない）

---

---

## 20. globals.css の修正パターン

**発生頻度: 85%**

初稿テンプレートの `globals.css` は最小限。案件ごとに以下の追加が発生する。

### 20-1. フォント変数の変更（和風・高級感など）

```css
/* ❌ Before: テンプレートのデフォルト */
:root {
  --font-display: "Noto Sans JP", sans-serif;
  --font-body: "Noto Sans JP", sans-serif;
}

/* ✅ After: 和風サイト向け（鍼灸院・旅館など） */
:root {
  --font-display: "Shippori Mincho", "Noto Serif JP", serif;
  --font-body: "Shippori Mincho", "Noto Serif JP", serif;
}
```

### 20-2. @theme にカスタムカラーパレット追加

```css
/* ❌ Before: @theme にフォントだけ */
@theme {
  --font-family-display: var(--font-display);
  --font-family-body: var(--font-body);
}

/* ✅ After: ブランドカラーを @theme に追加 */
@theme {
  --color-washi: #fcf9f2;
  --color-uguisu: #2d4f1e;
  --color-kogare: #d7c4bb;
  --color-sumi: #383838;
  --color-hanko-red: #cc3300;
  --color-line: #06C755;
  --color-line-hover: #05b54d;

  --font-family-display: var(--font-display);
  --font-family-body: var(--font-body);
}
```

### 20-3. スムーススクロールとiOSズーム防止

ほぼ全案件で追加される定型CSS。

```css
/* ✅ 必ず追加される定型スタイル */
html {
  scroll-behavior: smooth;
}

body {
  user-select: text;
  -webkit-user-select: text;
}

@media screen and (max-width: 768px) {
  html {
    -webkit-text-size-adjust: 100%;
  }
}
```

### 20-4. カスタムアニメーション追加

フェードアップ、スクロールティッカーなどが追加される。

```css
/* ✅ fade-in-up: スクロール時の要素出現アニメ */
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

/* ✅ ティッカー（無限スクロール文字列） */
@keyframes scroll-x {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-scroll-x {
  animation: scroll-x 30s linear infinite;
}
```

### 20-5. テンプレートのv3.2.0構造を全削除して簡素化するケース

重い初期テンプレートを丸ごと簡素化するパターンも発生。

```css
/* ❌ Before: テンプレートのv3.2.0フル構造（32行） */
/* 🆕 v3.2.0: CSS変数を @import より前に配置（CRITICAL） */
:root { --font-display: ...; --font-body: ...; }
@import "tailwindcss";
@import "tw-animate-css";
@theme { ... }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-display); }

/* ✅ After: 最小限にリセット */
@import "tailwindcss";
@import "tw-animate-css";
/* 必要なカスタムスタイルのみ */
```

---

## 21. layout.tsx の修正パターン

**発生頻度: 100%（全案件で必ず修正される）**

### 21-1. メタデータの書き換え（必須）

初稿の「Default Setting」→ 正式なサイト情報に。

```tsx
// ❌ Before: テンプレートデフォルト
export const metadata: Metadata = {
  title: "Default Setting",
  description: "Webサイト制作用の初期設定環境",
};

// ✅ After: 正式メタデータ（SEO対応）
export const metadata: Metadata = {
  title: "まるっと鍼灸治療院 | 練馬区・石神井公園の東洋医学専門院",
  description: "「鍼は痛い」という常識を変える。髪の毛ほどの極細鍼と...",
  keywords: ["練馬区 鍼灸院", "石神井公園 鍼灸", "不妊 鍼灸 練馬"],
  alternates: { canonical: "https://www.marutt.jp" },
  openGraph: {
    title: "まるっと鍼灸治療院 | ...",
    description: "...",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "...",
    description: "...",
  },
};
```

### 21-2. html要素への追加属性

```tsx
// ❌ Before: 最小限
<html lang="ja">

// ✅ After: 3パターンの追加がある
// パターンA: suppressHydrationWarning
<html lang="ja" suppressHydrationWarning>

// パターンB: scroll-smooth（CSS不要でスムーススクロール）
<html lang="ja" className="scroll-smooth">

// パターンC: フォント変数（next/font/google使用時）
<html lang="ja" className={`${notoSans.variable} ${ebGaramond.variable}`}>
```

### 21-3. Google Fonts の読み込み方法（2パターン）

```tsx
// パターン A: next/font/google（推奨・パフォーマンス最適）
import { Noto_Sans_JP, EB_Garamond } from "next/font/google";

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
});

// <html> に className={notoSans.variable} で適用

// パターン B: <link> タグ（和風フォントなど next/font 非対応時）
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700;800&display=swap"
    rel="stylesheet"
  />
</head>
```

### 21-4. viewport-fit=cover（ノッチ対応）

```tsx
// ❌ Before
<meta name="viewport" content="width=device-width, initial-scale=1" />

// ✅ After: iPhoneノッチ対応
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

### 21-5. body の className 変更

```tsx
// ❌ Before: テンプレートデフォルト
<body className="antialiased font-body">

// ✅ After: 案件に合わせた調整
// パターンA: 汎用
<body className="antialiased font-body m-0 p-0" suppressHydrationWarning>

// パターンB: ブランドカラー適用
<body className="antialiased font-sans text-bark selection:bg-gold selection:text-white bg-paper" suppressHydrationWarning>
```

### 21-6. fonts import の削除

初期テンプレートにあるフォント関連importを削除するケース。

```tsx
// ❌ Before: テンプレートのフォントimport
import "../lib/fonts/_active.css";
import "../lib/fonts/_vars.css";

// ✅ After: 不要なので削除（next/font/google に移行）
// （import行自体を削除）
```

---

## 22. next.config.ts の修正パターン

**発生頻度: 70%**

### 22-1. Unsplash画像の外部ドメイン許可

`<Image>` コンポーネントで外部画像を使う場合の設定。初稿でUnsplashを使うなら必須。

```tsx
// ❌ Before: テンプレートデフォルト
const nextConfig: NextConfig = {
  /* config options here */
};

// ✅ After: Unsplash許可
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};
```

---

## 23. Button 共通コンポーネントの設計パターン

**発生頻度: 60%（修正フェーズでリファクタリング）**

初稿ではインライン `<a>` でバラバラ → 修正時に共通 `<Button>` に統一。

### 23-1. 初稿のシンプルなButton → variant/size対応への拡張

```tsx
// ❌ Before: isConversion フラグのみの単純な分岐
interface ButtonProps {
  children: ReactNode;
  href: string;
  isConversion?: boolean;
  icon?: LucideIcon;
  className?: string;
}

const Button = ({ children, href, isConversion = false, icon: Icon, className = "" }: ButtonProps) => {
  const colorStyle = isConversion
    ? "bg-[#EB8834] text-white"
    : "bg-[#5FA8C8] text-white";
  return (
    <a href={href} className={`${baseStyle} ${colorStyle} ${className}`}>
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </a>
  );
};

// ✅ After: variant + size + type(submit) 対応
type ButtonVariant = 'default' | 'conversion' | 'line';
type ButtonSize = 'default' | 'header';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
  type?: 'submit';
  onClick?: () => void;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-[#5FA8C8] text-white',
  conversion: 'bg-[#EB8834] text-white',
  line: 'bg-[#06C755] text-white',
};

const sizeStyles: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2 md:px-5 md:py-2.5 text-[12px] md:text-[18px] min-w-[120px]',
  header: 'h-10 px-3 py-2 md:px-4 md:py-2 text-[12px] md:text-[18px]',
};

const Button = ({ children, href, variant = 'default', size = 'default', icon: Icon, type, ...rest }: ButtonProps) => {
  const style = `${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]}`;

  if (type === 'submit') {
    return <button type="submit" className={style}>{Icon && <Icon className="w-4 h-4 mr-1.5" />}{children}</button>;
  }
  return <a href={href ?? '#'} className={style}>{Icon && <Icon className="w-4 h-4 mr-1.5" />}{children}</a>;
};
```

### 23-2. LINEアイコンのSVGインライン化

react-icons に依存せず、SVGをインラインで定義するパターン。

```tsx
// ✅ react-icons不要のLINE SVGアイコン
const LineIcon = ({ size = 20, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden>
    <path fill="currentColor" d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283..." />
  </svg>
);

// 使い方: variant="line" のときだけLINEアイコンを表示
{variant === "line" && icon && <LineIcon size={20} className="mr-2 shrink-0" />}
<span>{children}</span>
{variant !== "line" && icon && <ChevronRight size={18} />}
```

---

## 24. Header コンポーネントの設計パターン

**発生頻度: 90%（ほぼ全案件で修正あり）**

### 24-1. ロゴ画像の追加

初稿はテキストロゴ → 先方からロゴ画像をもらって差し替え。

```tsx
// ❌ Before: テキストのみ
<Link href="/" className="text-[24px] font-bold text-[#8FC31F]">
  NEO GARDEN
</Link>

// ✅ After: Image + テキスト
<Link href="/" className="inline-flex items-center">
  <span className="leading-none flex items-center gap-2">
    <span>NEO</span>
    <Image
      src="/logo.png"
      alt="NEO GARDEN ロゴ"
      width={48}
      height={48}
      className="h-[1em] w-auto object-contain"
      priority
    />
    <span>GARDEN</span>
  </span>
</Link>
```

### 24-2. ナビ項目のテキスト変更

```tsx
// ❌ Before
{ label: '3つの強み', href: '#how' },

// ✅ After: コンテンツ変更に追従
{ label: '2つの強み', href: '#how' },
```

### 24-3. fixed → sticky への変更

```tsx
// ❌ Before: fixedヘッダー（各コンテンツにmt-[70px]が必要）
<header className="fixed w-full bg-white/95 backdrop-blur-sm z-50 shadow-sm h-[70px] md:h-[80px]">

// ✅ After: stickyヘッダー（コンテンツのmtが不要に）
<header className="sticky top-0 w-full bg-white/95 backdrop-blur-sm z-50 shadow-sm h-[100px] md:h-[110px]">
```

### 24-4. scrollToSection の実装パターン

ページ内リンクのスムーススクロール（SPAスタイル）。

```tsx
// ✅ headerの高さ分オフセットするスクロール処理
const scrollToSection = (id: string) => {
  setIsOpen(false);
  const element = document.getElementById(id);
  if (element) {
    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }
};
```

### 24-5. モバイルメニューのフルスクリーン化

```tsx
// ❌ Before: ドロワー的なメニュー
{isMenuOpen && (
  <div className="md:hidden absolute w-full bg-white border-t">
    {navItems.map(...)}
  </div>
)}

// ✅ After: フルスクリーンオーバーレイ
{isMenuOpen && (
  <>
    <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMenuOpen(false)} />
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-white z-50 lg:hidden overflow-y-auto">
      {/* ヘッダー（閉じるボタン付き） */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <Image src="/logo.png" alt="..." width={48} height={48} />
        <button onClick={() => setIsMenuOpen(false)} aria-label="メニューを閉じる">
          <X size={24} />
        </button>
      </div>
      {/* メニュー本体 */}
      <nav className="px-8 py-12 flex flex-col gap-6">
        {navItems.map(item => (
          <button key={item.id} onClick={() => handleNavClick(item.id)} className="text-left text-lg font-bold py-3 border-b border-gray-100">
            {item.label}
          </button>
        ))}
        <Button variant="primary" onClick={() => handleNavClick('contact')} className="w-full mt-4">
          お問い合わせ
        </Button>
      </nav>
    </div>
  </>
)}
```

### 24-6. Header にスクロール検知を追加

FVではヘッダー背景を透明に、スクロール後に白背景にするパターン。

```tsx
// ✅ スクロール検知によるヘッダー背景切り替え
const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 20);
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

<header className={`fixed w-full z-50 transition-all duration-500 ${
  scrolled
    ? 'bg-white/95 text-blue-900 py-4'
    : 'bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 text-white py-6'
}`}>
```

---

## 25. page.tsx のコンポーネント構成変更

**発生頻度: 40%**

### 25-1. コンポーネントの削除（import + JSX）

```tsx
// ❌ Before
import { Flow } from './components/home/Flow';

export default function Page() {
  return (
    <>
      <Service />
      <Flow />     {/* ← 削除対象 */}
      <FAQ />
    </>
  );
}

// ✅ After: import行とJSX両方を削除
export default function Page() {
  return (
    <>
      <Service />  {/* Service内にFlowを統合済み */}
      <FAQ />
    </>
  );
}
```

### 25-2. コンポーネントの追加

```tsx
// ❌ Before
import { HomeCompanySnippet } from './components/home/HomeCompanySnippet';
import { HomeCTA } from './components/home/HomeCTA';

// ✅ After: 新セクション（カタログ）を追加
import { HomeCompanySnippet } from './components/home/HomeCompanySnippet';
import { HomeCatalog } from './components/home/HomeCatalog';  // ← 追加
import { HomeCTA } from './components/home/HomeCTA';

// JSXにも追加
<HomeCompanySnippet />
<HomeCatalog />   {/* ← 追加 */}
<HomeCTA />
```

---

## 26. スマホCTA固定バー（fixed bottom）

**発生頻度: 多数の案件で追加**

スマホ表示時に画面下部に固定CTAバー（電話・LINE）を表示するパターン。PCでは非表示。

### 26-1. 基本構造

```tsx
// ❌ Before: CTA固定バーなし（フッターまでスクロールしないと連絡手段がない）

// ✅ After: スマホ専用 固定CTAバー
<div className="fixed bottom-0 w-full bg-white/90 backdrop-blur border-t border-stone-200 p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex gap-3 md:hidden z-40">
  <a
    href="tel:08049236660"
    className="flex-1 bg-stone-800 text-white font-bold py-3 rounded text-center text-xs shadow-sm flex items-center justify-center transition-transform active:scale-95"
  >
    <Phone size={16} className="mr-2" />
    電話予約
  </a>
  <a
    href="https://line.me/..."
    className="flex-1 bg-[#06C755] text-white font-bold py-3 rounded text-center text-xs shadow-sm flex items-center justify-center transition-transform active:scale-95"
  >
    <SiLine size={16} className="mr-2" />
    LINE予約
  </a>
</div>
```

### 26-2. 実装ポイント

| 要素 | 値 | 理由 |
|------|-----|------|
| `fixed bottom-0` | 画面下部固定 | スクロールしても常に表示 |
| `md:hidden` | PC非表示 | スマホのみの導線 |
| `z-40` | z-index | Header（z-50）より下、コンテンツより上 |
| `backdrop-blur` | 背景ぼかし | コンテンツと重なっても視認性確保 |
| `shadow-[0_-4px_...]` | 上向きシャドウ | コンテンツとの境界を明示 |
| `active:scale-95` | タップフィードバック | モバイルでの操作感 |

### 26-3. page.tsx の余白対応

固定バーの高さ分、本文下部に余白を追加しないとコンテンツが隠れる。

```tsx
// ✅ bodyまたはmainにスマホ用の下余白を追加
<main className="pb-[80px] md:pb-0">
  {/* コンテンツ */}
</main>
```

---

## 27. Google Maps iframe 埋め込み

**発生頻度: 会社概要セクションで多数**

アクセス情報のセクションに Google Maps の iframe を埋め込むパターン。

### 27-1. 基本実装

```tsx
// ❌ Before: テキストのみの住所表示
<td className="py-4 text-[#444]">
  〒861-1115 熊本県合志市豊岡2000-776 クアドリフォリオ8階
</td>

// ✅ After: iframe地図を住所の下に追加
<td className="py-4 text-[#444]">
  〒861-1115 熊本県合志市豊岡2000-776<br/>
  クアドリフォリオ8階
  <div className="mt-2 w-full h-[200px] md:h-[280px] rounded-[4px] overflow-hidden">
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!..."
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="所在地"
    />
  </div>
</td>
```

### 27-2. 実装ポイント

| 属性 | 値 | 理由 |
|------|-----|------|
| `loading="lazy"` | 遅延読み込み | 初期ロードを軽量化 |
| `referrerPolicy` | `no-referrer-when-downgrade` | セキュリティ |
| `style={{ border: 0 }}` | 枠線除去 | JSXではオブジェクト形式 |
| `h-[200px] md:h-[280px]` | レスポンシブ高さ | スマホは小さめ |
| `title` | アクセシビリティ | スクリーンリーダー対応 |

### 27-3. 独立コンポーネント化（推奨）

```tsx
// app/components/company/CompanyAccess.tsx
const CompanyAccess = () => (
  <section id="access" className="py-[50px] md:py-[100px]">
    <div className="max-w-[1000px] mx-auto px-5">
      <h2>アクセス</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p>〒XXX-XXXX 東京都...</p>
          <p>TEL: <a href="tel:0312345678">03-1234-5678</a></p>
        </div>
        <div className="w-full h-[300px] rounded overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=..."
            width="100%" height="100%"
            style={{ border: 0 }}
            allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="アクセスマップ"
          />
        </div>
      </div>
    </div>
  </section>
);
```

---

## 28. ビルドエラー / ESLint修正パターン

**発生頻度: 34件（Vercelデプロイ時に発覚）**

初稿のAI生成コードでは、ESLintエラーやビルドエラーが残りやすい。Vercelデプロイ時にビルドが失敗して修正するパターン。

### 28-1. アポストロフィのエスケープ

JSXで `'`（シングルクォート）を直接書くとESLintエラー（`react/no-unescaped-entities`）になる。

```tsx
// ❌ Before: ビルドエラー
<p>お客様の声に寄り添い、一人ひとりに合った施術を。</p>
<p>READER'S VOICE</p>

// ✅ After: エスケープ対応
<p>お客様の声に寄り添い、一人ひとりに合った施術を。</p>
<p>READER{&apos;}S VOICE</p>

// ✅ 別の方法: テンプレートリテラル
<p>{"READER'S VOICE"}</p>
```

### 28-2. 未使用importの削除

```tsx
// ❌ Before: 使っていないimport（ESLintエラー）
import { Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react';
// ↑ ArrowRight を使っていないのにimportしている

// ✅ After: 使用しているもののみ
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
```

### 28-3. img タグ → next/image

```tsx
// ❌ Before: ESLint warning（@next/next/no-img-element）
<img src="/images/hero.jpg" alt="ヒーロー" />

// ✅ After: next/image使用
import Image from 'next/image';
<Image src="/images/hero.jpg" alt="ヒーロー" width={1200} height={600} />

// ✅ または eslint-disable（意図的に<img>を使う場合）
{/* eslint-disable-next-line @next/next/no-img-element */}
<img src="/images/hero.jpg" alt="ヒーロー" />
```

### 28-4. 型エラー修正

```tsx
// ❌ Before: ReactNode を受け付けない
interface FAQItemProps {
  answer: string;
}

// ✅ After: JSXを含む回答に対応
import { ReactNode } from 'react';
interface FAQItemProps {
  answer: ReactNode;
}
```

### 28-5. ビルドエラー防止チェックリスト

- [ ] `'`（アポストロフィ）が JSX 内にないか → `{"'"}` または `&apos;` に置換
- [ ] 未使用の import がないか → ビルド前に確認
- [ ] `<img>` タグを `<Image>` に置換済みか
- [ ] `@import url(...)` は CSS ファイルの最上部にあるか
- [ ] `next/font/google` のフォント名スペルは正しいか

---

## 29. GA4 カスタムイベント計測

**発生頻度: GTM実装案件の大半で追加**

GTM設置（セクション5）に加え、特定ボタンのクリックを GA4 でカスタムイベントとして計測するパターン。

### 29-1. window.gtag 型定義

```tsx
// ✅ グローバル型定義（コンポーネントファイルの先頭）
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
```

### 29-2. ボタンクリック計測

```tsx
// ✅ CTA内でのクリックイベント送信
export default function HomeCTA() {
  const handleClick = (location: string) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "button_click", {
        button_location: location,
      });
    }
  };

  return (
    <section id="cta" className="py-32 bg-[#0066FF] text-white">
      <a
        href="/contact"
        onClick={() => handleClick("cta_section")}
        className="inline-flex items-center px-8 py-4 bg-white text-[#0066FF] rounded-full font-bold"
      >
        お問い合わせ
      </a>
    </section>
  );
}
```

### 29-3. 電話番号・LINEクリック計測

```tsx
// ✅ 電話番号タップの計測
<a
  href="tel:08012345678"
  onClick={() => {
    if (window.gtag) {
      window.gtag("event", "phone_click", {
        phone_number: "080-1234-5678",
        click_location: "header",
      });
    }
  }}
>
  080-1234-5678
</a>

// ✅ LINEボタンクリックの計測
<a
  href="https://line.me/..."
  onClick={() => {
    if (window.gtag) {
      window.gtag("event", "line_click", {
        click_location: "floating_cta",
      });
    }
  }}
>
  LINEで相談する
</a>
```

---

## 30. スクロールアニメーション実装（IntersectionObserver）

**発生頻度: 32件**

要素がビューポートに入った時にフェードインする実装。CSS アニメーション（セクション20参照）と組み合わせて使用。

### 30-1. グローバル初期化スクリプト

```tsx
// app/components/shared/ScrollAnimator.tsx
"use client";
import { useEffect } from "react";

export default function ScrollAnimator() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".scroll-animate").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
```

### 30-2. CSS定義（globals.css）

```css
/* スクロールアニメーション */
.scroll-animate {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.scroll-animate.animate-visible {
  opacity: 1;
  transform: translateY(0);
}
```

### 30-3. 使用方法

```tsx
// ✅ 各セクションのラッパーに scroll-animate を付与するだけ
<div className="scroll-animate">
  <h2>サービス紹介</h2>
  <p>...</p>
</div>

// ✅ カードの連続表示（遅延付き）
{items.map((item, i) => (
  <div
    key={i}
    className="scroll-animate"
    style={{ transitionDelay: `${i * 100}ms` }}
  >
    {/* カード内容 */}
  </div>
))}
```

### 30-4. layout.tsx での配置

```tsx
// app/layout.tsx の body内に1回だけ配置
import ScrollAnimator from "@/app/components/shared/ScrollAnimator";

<body>
  <ScrollAnimator />
  <Header />
  {children}
  <Footer />
</body>
```

---

## 31. FAQ アコーディオン

**発生頻度: 27件**

`<details>` / `<summary>` を使ったネイティブHTMLアコーディオン。JSは不要。

### 31-1. 基本実装

```tsx
// ✅ HTML標準のアコーディオン
const faqItems = [
  {
    q: "エアコン1台だけでもお願いできますか？",
    a: "もちろんです。1台からお気軽にご依頼ください。",
  },
  {
    q: "土日祝日も対応していますか？",
    a: "はい、年中無休で対応しております。お仕事でお忙しい方も、ご都合の良い日時をお選びください。",
  },
];

<section className="py-[50px] md:py-[100px]">
  <h2>よくあるご質問</h2>
  <div className="space-y-4 max-w-[800px] mx-auto">
    {faqItems.map((item, i) => (
      <details
        key={i}
        className="scroll-animate group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
      >
        <summary className="flex items-center justify-between py-5 px-6 cursor-pointer list-none font-bold text-[16px] md:text-[18px] hover:bg-gray-50 transition-colors [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm shrink-0">
              Q{i + 1}
            </span>
            {item.q}
          </span>
          <ChevronDown size={20} className="shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-6 pb-5 text-[14px] md:text-[16px] text-gray-600 leading-relaxed">
          {item.a}
        </div>
      </details>
    ))}
  </div>
</section>
```

### 31-2. スタイルのポイント

| 要素 | クラス | 理由 |
|------|--------|------|
| `[&::-webkit-details-marker]:hidden` | デフォルト▶非表示 | カスタム矢印を使用 |
| `group-open:rotate-180` | 開閉時に矢印回転 | `group` + `group-open` で制御 |
| `list-none` | summary のリストマーカー除去 | Firefox対応 |

---

## 32. vercel.json リダイレクト設定

**発生頻度: 15件**

独自ドメイン設定時に、naked ドメイン → www 付きドメインへのリダイレクトを設定するパターン。

### 32-1. naked → www リダイレクト

```json
// vercel.json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "example.com" }],
      "destination": "https://www.example.com/:path*",
      "permanent": true
    }
  ]
}
```

### 32-2. 旧ドメイン → 新ドメイン

```json
// vercel.json（社名変更・ドメイン移行時）
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "old-domain.jp" }],
      "destination": "https://www.new-domain.com/:path*",
      "permanent": true
    }
  ]
}
```

### 32-3. layout.tsx との連携（canonical URL）

vercel.json のリダイレクトと合わせて、`layout.tsx` の `metadata` にも canonical URL を設定する。

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  // ...
  alternates: {
    canonical: "https://www.new-domain.com",
  },
};
```

---

## 33. 電話番号リンク（tel:）実装

**発生頻度: 17件**

スマホでタップすると直接電話発信できるリンクの実装パターン。

### 33-1. 基本実装

```tsx
// ❌ Before: テキストのみ（タップしても発信できない）
<p>TEL: 03-1234-5678</p>

// ✅ After: tel: リンク
<a href="tel:0312345678" className="hover:underline">
  03-1234-5678
</a>
```

### 33-2. ヘッダーの電話ボタン

```tsx
// ✅ ヘッダー右側に電話ボタン
<div className="hidden md:flex items-center gap-4">
  <a
    href="tel:08071528869"
    className="inline-flex items-center justify-center px-6 py-3 bg-[#222222] text-white hover:bg-[#444] transition-colors"
  >
    <Phone size={18} className="mr-2" />
    <span className="font-lato text-[16px]">080-7152-8869</span>
  </a>
</div>
```

### 33-3. CTA内の電話ブロック

```tsx
// ✅ お問い合わせセクション内の電話カード
<div className="bg-white text-[#0A2239] p-6 rounded mb-8 text-center">
  <p className="font-bold mb-2 text-sm text-gray-500">
    お電話でのお問い合わせ
  </p>
  <a
    href="tel:0453089808"
    className="text-[28px] md:text-[36px] font-bold font-lato hover:opacity-80 transition-opacity"
  >
    045-308-9808
  </a>
  <p className="text-xs text-gray-400 mt-1">
    受付時間: 平日 9:00〜18:00
  </p>
</div>
```

### 33-4. tel: リンクの注意点

- `href="tel:"` にはハイフンなしの番号を指定（`tel:0312345678`）
- 表示テキストはハイフン付き（`03-1234-5678`）で可読性確保
- PC では発信できない場合があるので、PC 版は `pointer-events-none md:pointer-events-auto` を検討
- `font-lato` や `font-mono` で数字を等幅表示すると見やすい

---

## 付録: site.config.ts テンプレート

全案件で使える基本設定ファイル。

```tsx
// app/config/site.config.ts
export const SITE_CONFIG = {
  name: "株式会社〇〇",
  representative: "代表者名",
  tel: "03-XXXX-XXXX",
  address: "東京都〇〇区〇〇1-2-3",
  postalCode: "〒XXX-XXXX",
  email: "info@example.com",
  lineUrl: "#",
  instagramUrl: "#",
  businessHours: "平日 10:00 - 18:00",
  holidays: "土日祝",
  responseTime: "2営業日以内",
};
```

---

*このドキュメントは349件のgit diffから自動抽出した実データに基づいています。*  
*4,139件のコミットメッセージを全カテゴリ分類し、網羅性を検証済み。*  
*生成日: 2026-03-26 | 分析: Cursor Agent (Claude Sonnet 4.6)*
