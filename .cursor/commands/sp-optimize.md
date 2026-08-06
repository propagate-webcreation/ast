# /sp-optimize — スマホ表示最適化コマンド

SP（375px）の表示品質を grep 静的解析で診断・修正する軽量コマンド。
スクショ不要。コードだけで 1〜2 分で完結し、PC非破壊を保証する。

> スクショベースの目視レビュー（改行品質・見切れ確認）が必要な場合は `/review sp` や `/review overflow` を別途実行する。

## 使用方法

```
/sp-optimize
```

## 前提

- 対象はモバイル（< 768px）のみ。PC版（`md:` 以上のクラス）は一切変更しない

---

## Phase 1 — コードクリーンアップ（自動）

**対応スキル: text-wrap-cleanup**

不要な手動改行・禁止プロパティをスクリプトで一括除去する。

### 1-1. dry-run

```bash
node .cursor/skills/text-wrap-cleanup/scripts/cleanup.mjs
```

レポートを確認し、問題なければ適用。

### 1-2. 適用

```bash
node .cursor/skills/text-wrap-cleanup/scripts/cleanup.mjs --apply
```

### 1-3. 要確認リストの対応

スクリプトが「要確認（nowrap — 意図的な可能性）」として出力した項目を目視チェック。
ナビ・ボタン等の1行テキストに `whitespace-nowrap` が付いているケースは意図的なので残す。

---

## Phase 2 — 静的解析（grep ベース）

mobile-polish-bot の 30 ルールに基づき、grep / 正規表現でモバイル表示の不具合を機械的に検知・修正する。

### 2-A. 横はみ出し / 横スクロール

```bash
# 横スクロール UI
rg 'overflow-x-(?:auto|scroll)' app/ --glob '*.tsx' -n

# 固定幅がモバイル幅超え（300px+）
rg 'w-\[(?:[3-9]\d{2}|[1-9]\d{3,})px\]' app/ --glob '*.tsx' -n

# section に overflow-hidden 不在 + 子に absolute + 負オフセット
rg 'absolute' app/components/ --glob '*.tsx' -n -B 5 | grep -E '-(left|right)-\[(?:[4-9]\d|[1-9]\d{2,})px\]'

# text-wrap: pretty（p/li に適用されていると iOS Safari で右余白ガタつき）
rg 'text-wrap:\s*pretty' app/ --glob '*.{tsx,css}' -n
```

| 問題 | 修正パターン |
|------|-------------|
| `overflow-x-auto/scroll` | 縦積みレイアウトに変換。テーブルの場合は `overflow-x-auto` のラッパーで囲む |
| `w-[300px+]` でモバイル超え | `w-full md:w-[600px]` に |
| absolute 要素が画面外はみ出し | 親要素に `overflow-hidden` 追加 |
| `text-wrap: pretty`（p/li） | 削除（見出しの `balance` は残す） |

### 2-B. レイアウト崩れ

```bash
# grid-cols-3+ がモバイルで折り返さない
rg 'grid-cols-[3-9]' app/ --glob '*.tsx' -n | grep -v 'md:grid-cols\|lg:grid-cols\|sm:grid-cols'

# flex-row がモバイルで折り返さない（flex-col への切り替えなし）
rg 'flex-row' app/ --glob '*.tsx' -n | grep -v 'flex-col'

# gap が大きすぎ（gap-16+ = 64px+）でブレークポイントなし
rg 'gap-(?:1[6-9]|[2-9]\d)\b' app/ --glob '*.tsx' -n | grep -v 'md:gap\|lg:gap'

# padding が大きすぎ（py/px-24+ = 96px+）でブレークポイントなし
rg '(?:px|py|pt|pb|pl|pr|p)-(?:2[4-9]|[3-9]\d)\b' app/ --glob '*.tsx' -n | grep -v 'md:p\|lg:p'

# 横 padding が小さすぎ（px-0/1/2 = 0-8px）で窮屈
rg '\bpx-[0-2]\b' app/ --glob '*.tsx' -n
```

| 問題 | 修正パターン |
|------|-------------|
| `grid-cols-3+` 折り返しなし | `grid-cols-1 md:grid-cols-3` に |
| `flex-row` 折り返しなし | `flex-col md:flex-row` に |
| `gap-16+` ブレークポイントなし | `gap-6 md:gap-16` に |
| `py-24+` ブレークポイントなし | `py-16 md:py-28` に |
| `px-0/1/2` で窮屈 | `px-5`（20px）以上に |

### 2-C. 画像 / メディア

```bash
# 画像に w-full なし + 大きい固定幅
rg '<Image' app/ --glob '*.tsx' -n -A 3 | grep -v 'w-full'

# 固定高さ（h-[300px+]）でブレークポイントなし
rg 'h-\[(?:[3-9]\d{2}|[1-9]\d{3,})px\]' app/ --glob '*.tsx' -n | grep -v 'md:h\|lg:h'

# vh 単位（iOS Safari アドレスバー問題）
rg 'h-\[\d+(?:vh|svh|dvh)\]' app/ --glob '*.tsx' -n
```

| 問題 | 修正パターン |
|------|-------------|
| 画像に `w-full` なし | `className="w-full h-auto"` 追加 |
| `h-[300px+]` ブレークポイントなし | `h-[200px] md:h-[400px]` に |
| `h-[Nvh]` | `min-h-[500px] md:h-[90vh]`（FV は `min-h` 必須） |

### 2-D. FV（ファーストビュー）特有

```bash
# Hero 見出し 40px+ でブレークポイントなし
rg 'text-\[(?:4[0-9]|[5-9]\d|[1-9]\d{2,})px\]' app/components/*ero* app/components/*eader* --glob '*.tsx' -n 2>/dev/null | grep -v 'md:text\|sm:text'

# FV ダークオーバーレイが濃すぎ（bg-black/50+）
rg 'inset-0' app/ --glob '*.tsx' -n -A 2 | grep -E 'bg-(black|slate-9)|/[5-9]\d|/100'

# 固定ヘッダーが高すぎ（h-20+ = 80px+）
rg '(?:fixed|sticky)' app/components/*eader* --glob '*.tsx' -n -A 5 2>/dev/null | grep -E 'h-(?:[2-9]\d)'
```

| 問題 | 修正パターン |
|------|-------------|
| Hero 見出し 40px+ | `text-[28px] md:text-[48px]` に（375px で 10〜13文字/行が目安） |
| ダークオーバーレイ濃すぎ | 明るいすりガラスに置換: `bg-white/50 backdrop-blur-xl` + `mask-image` |
| 固定ヘッダー高すぎ | `h-16`（64px）以下に |

### 2-E. タッチ / ボタン品質

```bash
# タップターゲット 44px 未満（a/button が h-5〜8 / p-0〜1）
rg '<(?:a|button)\s' app/ --glob '*.tsx' -n -A 3 | grep -E 'h-[5-8]\b|p-[01]\b'

# ボタン間 gap が小さすぎ（gap-0.5/1 = 2-4px）
rg 'gap-(?:0\.5|1|px)\b' app/ --glob '*.tsx' -n

# デッドリンク
rg 'href="#"|href=""|href=\{"#"\}' app/ --glob '*.tsx' -n

# LINE ボタンが非ブランドカラー
rg 'line\.me\|lin\.ee' app/ --glob '*.tsx' -n -B 3 -A 3 | grep -v '06C755'
```

| 問題 | 修正パターン |
|------|-------------|
| タップターゲット 44px 未満 | `min-h-[44px] min-w-[44px]` + padding 増加 |
| ボタン間 gap 小さすぎ | `gap-3`（12px）以上に |
| `href="#"` / `href=""` | `<a>` → `<div>` / `<span>` に変更、または正しいリンク先を設定 |
| LINE ボタン非ブランドカラー | `bg-[#06C755] text-white` に |

### 2-F. テーブル / その他

```bash
# テーブル横はみ出し（レスポンシブ対応なし）
rg '<table\b' app/ --glob '*.tsx' -n

# max-width が狭すぎ（max-w-xs/sm = 320-384px）
rg 'max-w-(?:xs|sm)\b' app/ --glob '*.tsx' -n

# 禁止ライブラリ
rg 'swiper|embla|react-slick|keen-slider|splide|flickity' app/ --glob '*.{tsx,ts}' -n
rg 'lenis|@studio-freight|ReactLenis' app/ --glob '*.{tsx,ts}' -n
rg '<marquee|animate-marquee' app/ --glob '*.{tsx,css}' -n
```

| 問題 | 修正パターン |
|------|-------------|
| テーブル横はみ出し | `<div className="overflow-x-auto">` で囲む |
| `max-w-xs/sm` で不自然な改行 | `max-w-full md:max-w-sm` に |
| 禁止ライブラリ（carousel/lenis/marquee） | インポート・コンポーネントを削除。グリッド配置 or 静的表示に |

### 2-G. 抑制条件（false positive 防止）

以下の場合は違反としない:

| ルール | 抑制条件 |
|--------|---------|
| `grid-cols-3+` | 同じ行に `md:grid-cols` / `lg:grid-cols` があれば OK |
| `flex-row` | 同じ行に `flex-col` があれば OK |
| `gap-16+` / `py-24+` | 同じ行に `md:gap` / `md:py` があれば OK |
| absolute はみ出し | 親要素に `overflow-hidden` があれば OK |
| Hero 見出し 40px+ | 同じ行に `md:text-` / `sm:text-` があれば OK |
| `px-0/1/2` | `max-w-` で幅制限されていれば OK |
| `text-wrap: pretty` | `h1〜h6` への適用は OK（p/li のみ NG） |

---

## Phase 3 — iOS ビューポート修正

**対応スキル: ios-viewport-fix**

iOS Safari のアドレスバー伸縮に起因するスクロールジャンプを診断・修正する。

### 3-1. 診断（以下を Grep で検索）

```bash
# ビューポート単位（画像を含む要素）
rg '\b(h|min-h|max-h)-\[[\d.]+(vh|svh|dvh)\]' app/ components/ --glob '*.tsx' -n

# scroll-behavior: smooth
rg 'scroll-smooth|scroll-behavior:\s*smooth' app/ --glob '*.{tsx,css}' -n

# fixed + mix-blend-multiply
rg 'fixed.*mix-blend|mix-blend.*fixed' app/ components/ --glob '*.tsx' -n

# transition-all
rg 'transition-all' app/ components/ --glob '*.tsx' -n

# backdrop-blur の動的付与
rg 'backdrop-blur' app/ components/ --glob '*.tsx' -n -B 2 -A 2

# passive: true なしのスクロールリスナー
rg 'addEventListener\s*\(\s*["\x27]scroll' app/ components/ --glob '*.tsx' -n -A 1
rg 'addEventListener\s*\(\s*["\x27]touchmove' app/ components/ --glob '*.tsx' -n -A 1

# viewport meta
rg 'viewport' app/layout.tsx
```

### 3-2. 修正（優先順）

| 優先度 | 問題 | 修正パターン |
|:------:|------|-------------|
| 1 | ビューポート単位 | SP は `min-h` + JS で最低高さ保証。CSS は `min-h-[500px] md:h-[90vh]`。`h-` 固定禁止（テキストオーバーフロー防止） |
| 2 | scroll-behavior: smooth | `<html className="scroll-auto md:scroll-smooth">` |
| 3 | fixed + mix-blend-multiply | `hidden md:block` でモバイル非表示 |
| 4 | backdrop-blur | `md:backdrop-blur-sm` でPC版のみ |
| 5 | transition-all | `transition-[background-color,box-shadow]` 対象明示 |
| 6 | passive なしリスナー | `{ passive: true }` 付与 |

### 3-3. 禁止事項

- `user-scalable=no` / `maximum-scale=1` 禁止
- resize リスナーは付けない（ビューポート固定の目的が崩れる）

---

## Phase 4 — フォントサイズ正規化

**対応スキル: font-review**

### 4-1. 診断

```bash
# Tailwind 相対サイズの検出（全面禁止）
rg '\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b' app/ components/ --glob '*.tsx' -n

# md: プレフィックスなしの text-[Xpx] のみ（レスポンシブ未対応）
rg 'text-\[\d+px\]' app/ components/ --glob '*.tsx' -n | grep -v 'md:text'

# 14px 未満のフォントサイズ（キャプション以外で使用禁止）
rg 'text-\[(1[0-2])px\]|text-\[9px\]|text-\[8px\]' app/ components/ --glob '*.tsx' -n

# 本文の行間が詰まりすぎ
rg 'leading-(none|tight)' app/components/ --glob '*.tsx' -n
```

### 4-2. SP フォントサイズテーブル

| 要素 | SP (ベース) | PC (`md:`) |
|------|-----------|-----------|
| ホームヒーロー h1 | `text-[32px]` | `md:text-[40px]` |
| 下層ヒーロー h1 | `text-[30px]` | `md:text-[36px]` |
| h2 | `text-[24px]` | `md:text-[32px]` |
| h3 | `text-[18px]` | `md:text-[26px]` |
| h4 | `text-[16px]` | `md:text-[20px]` |
| 本文 p | `text-[13px]` | `md:text-[16px]` |
| ボタン / ラベル | `text-[13px]` | `md:text-[20px]` |
| キャプション | `text-[10px]` | `md:text-[14px]` |

**最小フォントサイズ: SP 10px（キャプションのみ）、それ以外は 13px 以上。**

### 4-3. 修正ルール

- すべてのテキスト要素が SP (ベース) + PC (`md:`) の 2 段指定になっていること
- Tailwind 相対サイズ (`text-sm` 等) → px 固定値に変換
- 見出し: `font-bold` / 本文: `font-normal` or `font-medium`（両方太字は NG）
- 本文の行間: `leading-relaxed`（1.625）
- input / select / textarea は `text-base` のまま（iOS ズーム防止）

---

## レポートフォーマット

```
## SP 表示最適化レポート

### Phase 1 — コードクリーンアップ
| 処理 | 件数 | 備考 |
|------|------|------|

### Phase 2 — 静的解析
| # | ルール | ファイル | 行 | 問題 | 修正内容 |
|---|--------|---------|-----|------|---------|

### Phase 3 — iOS ビューポート修正
| # | 問題 | ファイル | 行 | 修正内容 |
|---|------|---------|-----|---------|

### Phase 4 — フォントサイズ正規化
| 要素 | 修正前 | 修正後 | ファイル |
|------|--------|--------|---------|

### 修正済み一覧
- ファイル: 変更内容
```

---

## 注意事項

- **テキスト内容の変更（文言の書き換え・短縮・削除）は絶対禁止**
- **`tracker.js` は削除・変更禁止**
- **`globals.css` は原則編集しない**（Tailwind のみ）
- **`line-clamp-*` による意図的な truncation はバグではない**
- **PC 改行は絶対に修正しない** — PC 改行は director-visual スキルの担当
- **検出した問題は1つも残さず修正する**
