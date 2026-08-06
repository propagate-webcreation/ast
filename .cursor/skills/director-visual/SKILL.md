---
name: director-visual
description: >-
  ディレクター視点の総合ビジュアルレビュー。
  コード監査 → SP/PCセクション別検証 → PCビュー改行調整 を一貫して行う。
  ※このスキルは /review director コマンド経由でのみ実行する。
  会話中のキーワードでは自動起動しない。
---

# director-visual — ディレクターレビュー + PC改行調整

## ビューポート定義

| | 幅 | 高さ | 用途 |
|---|---|---|---|
| **SP** | **375px** | 844px | iPhone SE〜15 相当 |
| **PC** | 1280px | 800px | 一般的なノートPC |

## 前提

- `npm run dev` 起動済み
- Playwright: `npm install playwright --save-dev && npx playwright install chromium`

### ポート検出の仕組み

キャプチャスクリプトは以下の優先順で開発サーバーのポートを自動検出する:

1. **`PREVIEW_BASE_URL` 環境変数** — 指定されていればそのまま使う
2. **`.next/server.port` ファイル** — `next dev` が書き出すポート番号を読む（最も正確）
3. **`lsof` によるスキャン** — Node プロセスがリッスンしているポートを探す
4. **フォールバック: 3000** — いずれも見つからない場合

開始時にコンソールに `Dev server detected on port XXXX` と表示されるので、意図したポートか確認すること。

## SP改行について

**このスキルではSP改行の修正は行わない。**
SP改行の問題を発見した場合はレポートに記載し、
「sp-responsive スキルでの対応を推奨」と注記する。
SP改行の修正は `sp-responsive` スキルが担当する。

---

## ビューポート分離の原則（絶対厳守）

**PC改行の修正がSP表示に影響を与えることは絶対に許されない。**
Tailwind のレスポンシブプレフィックス（`md:` = 768px以上）で物理的に分離する。

### `<br />` タグの影響範囲

`text-wrap: balance` が自動最適化するため、見出しへの `<br>` は原則不要。
SP/PC で異なる位置に改行したい場合のみ以下を使う。

| 書き方 | SP (< 768px) | PC (≥ 768px) | このスキルで |
|--------|:-----------:|:-----------:|:----------:|
| `<br />` （素） | 表示される | 表示される | **新規挿入 禁止** |
| `<br className="md:hidden" />` | 表示される | 非表示 | **挿入 禁止**（sp-responsive の担当） |
| `<br className="hidden md:inline" />` | 非表示 | 表示される | **使用OK** — PC専用改行 |

### クラスの影響範囲

| 書き方 | SP (< 768px) | PC (≥ 768px) | このスキルで |
|--------|:-----------:|:-----------:|:----------:|
| `md:min-h-[60px]` | 無効 | 適用 | **使用OK** — PC専用 |
| `md:max-w-5xl` | 無効 | 適用 | **使用OK** — PC専用 |
| `min-h-[60px]`（ベース値） | 適用 | 適用 | **変更 禁止** — SP に影響 |
| `text-[13px]`（ベース値） | 適用 | 適用 | **変更 禁止** — SP に影響 |

### 既存の素 `<br />` の扱い

素の `<br />` は SP/PC 両方に表示されている。これを修正する場合:

| PCでの扱い | 操作 | SP への影響 |
|-----------|------|:----------:|
| PCで不要 → 除去したい | `<br className="md:hidden" />` に変更 | **なし** （SPは引き続き表示） |
| PCで位置が悪い | 上記 + 正しい位置に `<br className="hidden md:inline" />` 追加 | **なし** |
| PCで必要・そのまま | 触らない | **なし** |

**原理:** `md:hidden` は「768px以上で非表示」→ SP表示はそのまま、PCからのみ除去される。

---

## STEP 1 — フルページスクリーンショット撮影

```bash
mkdir -p .cache/visual-review
node .cursor/skills/director-visual/scripts/capture-sections.mjs
```

出力:
```
.cache/visual-review/
  sp/{page}/00-fullpage.png, 01-header.png, 02-hero.png, ...
  pc/{page}/00-fullpage.png, 01-header.png, 02-hero.png, ...
  manifest.json
```

**manifest.json を Read** して全キャプチャの一覧とメタ情報を把握する。

> **レビューはフルページ画像をベースに行う。**
> `keep-all` + `text-wrap: balance` でテキストが自然に折り返されるため、
> セクション個別画像は問題箇所を拡大確認したい場合にのみ参照する。

---

## STEP 2 — コード監査

品質基準は `10-typography.mdc` 〜 `16-content-rules.mdc` が Single Source of Truth。

### 2-A. フォントサイズ照合

```bash
rg 'text-\[\d+px\]' app/components/ --no-heading
rg 'text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)' app/components/ --glob '*.tsx'
```

Tailwind 相対サイズは全面禁止。例外: input/select/textarea の `text-base`。

### 2-B. 禁止クラス・装飾

```bash
rg 'break-keep|break-all' app/components/
rg 'white-space:\s*nowrap|whitespace-nowrap|text-nowrap' app/components/ --glob '*.tsx'
rg 'shadow-' app/components/ --glob '*.tsx'
rg 'bg-transparent|bg-white' app/components/ --glob '*.tsx'
rg '!important' app/components/ --glob '*.tsx'
```

### 2-C. ボタン・CTA

```bash
rg '<(a|button|Link)\s' app/components/ --glob '*.tsx' -A 3
rg 'rounded-' app/components/ --glob '*.tsx'
```

全ボタン: アイコン＋ラベル、`rounded-2xl`、有彩色充填背景。

### 2-D. セクション構造

```bash
rg '<section' app/components/ --glob '*.tsx' -A 1
rg 'aria-label' app/components/ --glob '*.tsx'
```

全 section に `id`。`<div>` ではなく `<section>` 使用。

### 2-E. 見出し・画像

```bash
rg '<h1' app/components/ --glob '*.tsx' -c
rg 'alt="[A-Za-z]' app/components/ --glob '*.tsx'
rg '<img ' app/ --glob '*.tsx'
```

### 2-F. SP レスポンシブ基本

```bash
rg 'grid-cols-[2-9]' app/components/ --glob '*.tsx' | rg -v 'md:|lg:|sm:'
```

### 2-G. Layout 基盤・保護

```bash
rg 'site-annotator' app/layout.tsx
rg 'tracker.js' app/layout.tsx
```

### 2-H. パターンDB照合（349案件ベース）

```bash
rg 'unsplash\.com|pexels\.com|pixabay\.com' app/ --glob '*.tsx'
rg '>\s*(About|Service|Services|Contact|Company|News|Blog|FAQ|Access|Flow|Features?|Recruit|Staff|Works|Gallery|Price|Menu|Top)\s*<' app/components/ --glob '*.tsx'
rg '最先端|革新的|シームレス|ワンストップ|トータルサポート' app/components/ --glob '*.tsx'
rg 'Lorem|ipsum|ダミー|テスト文' app/components/ --glob '*.tsx'
rg '\d{2,4}-\d{2,4}-\d{4}' app/components/ --glob '*.tsx' | rg -v 'tel:|placeholder'
rg 'fixed.*bottom-0|bottom-0.*fixed' app/components/ --glob '*.tsx'
rg '<iframe' app/ --glob '*.tsx' -A 5
rg '<details|<summary' app/components/ --glob '*.tsx'
```

| パターン | アクション |
|---------|-----------|
| 英語ラベル / 電話tel:なし / Maps属性不足 / 抽象placeholder | 自動修正 |
| 外部画像URL / AI冗長表現 / ダミーテキスト | 指摘のみ |

### 2-I. PC改行 事前監査

```bash
# 改行ルールの適用確認
rg 'keep-all|text-wrap|overflow-wrap' app/globals.css
# text-balance がコンポーネント側で個別適用されている箇所
rg 'text-balance' app/components/ --glob '*.tsx' -B 1 -A 3
# className なしの <br />
rg '<br\s*/?\s*>' app/components/ --glob '*.tsx'
# リード文に auto-phrase が適用されているか
rg 'auto-phrase' app/components/ --glob '*.tsx'
```

**改行ルール適用確認:**
- `globals.css` に以下が設定されているか:
  - `body` → `word-break: normal; overflow-wrap: anywhere;`
  - `h1, h2, h3, h4, h5, h6` → `word-break: keep-all; text-wrap: balance;`
  - `p, li`（本文）→ **text-wrap は適用しない**（iOS Safari で `text-wrap: pretty` が右側余白をガタつかせるため）
- リード文 `<p>` にコンポーネント側で `[word-break:auto-phrase]` (Tailwind) が適用されているか
- リード文の句点「。」直後に `<br className="hidden md:block" />` で PC のみ改行が入っているか
- `html lang="ja"` が `layout.tsx` に存在するか
- 未設定の場合はテンプレートに従い追加する

**PC改行の高リスク要素（keep-all 適用済みでも残る可能性）:**
- キャッチコピー等の短い重要テキスト（句読点がない長い見出しは keep-all でも折り場所がない）
- `className` なしの `<br />` (SP/PC両方に影響)
- 動詞活用（する/される/ている/できる）を含む見出し

### 2-J. 監査サマリー

```
| チェック | 結果 | 違反数 | 備考 |
|----------|------|--------|------|
```

---

## STEP 3 — SP ビジュアルレビュー

**`.cache/visual-review/sp/{page}/00-fullpage.png` を Read してページ全体を通しで確認する。**
問題箇所を詳細確認したい場合のみ、個別セクション画像を参照する。

### 確認ポイント

| 項目 | 確認 |
|------|------|
| 文字サイズ | 13px以上（キャプション10px以上） |
| ボタン | 有彩色充填、アイコン付、h-12以上 |
| 背景色 | 白→グレー→白 の交互配置 |
| 横スクロール | はみ出しなし |
| 余白 | セクション50px、h2下20px |
| 画像 | 欠落なし、object-cover |
| テキスト折り返し | keep-all + balance により自然な位置で改行されているか |

**SP改行の問題（途中切れ等）を発見した場合:**
→ レポートに記録するが、修正はしない。
→ 「sp-responsive スキルでの対応を推奨」と注記する。

---

## STEP 4 — PC ビジュアルレビュー + PC改行品質チェック

**`.cache/visual-review/pc/{page}/00-fullpage.png` を Read してページ全体を通しで確認する。**
問題箇所を詳細確認したい場合のみ、個別セクション画像を参照する。

### 共通確認

| 項目 | 確認 |
|------|------|
| カード垂直揃え | h3 下端、本文上端が水平に揃っているか |
| 配色 | 背景色交互、装飾shadow なし |
| 言語 | 英語ラベルなし、alt日本語 |
| 画像 | 比率統一、object-cover |
| テキスト折り返し | balance による見出しの均等化、pretty による段落末孤立防止 |

### PC改行品質チェック

`keep-all` + `text-wrap: balance` が適用済みなら大半の途中切れは解消されている。
以下の残存問題のみ確認する:

**PC-1. keep-all でも途中切れする場合（稀）:**
- 句読点のない長い見出し（keep-all でも折り場所がなく `overflow-wrap: anywhere` で語中割れする）
- 「す↩る」「でき↩る」「ティ↩ング」等の動詞・カタカナ分割

**PC-2. 見出しの不要折り返し:**
- `max-w-3xl` 等の幅制約で折り返しが発生 → `md:max-w-5xl` 以上に変更

**PC-3. カード垂直揃え:**
- 横並びカードの h3 下端、本文上端が水平に揃っているか
- ずれている場合 → `md:min-h-[Xpx]` で h3 高さ統一

**PC-4. `className` なしの `<br />` がPCで不要な改行を生んでいないか**

### PC改行の判定基準

| 分類 | 状態 | 判定 |
|------|------|------|
| A | 見出しが自然な位置で収まっている | OK |
| B | keep-all 適用後も単語途中切れが残存 | **要修正** |
| C | max-w 制約で不要な折り返し | **要修正** |
| D | `<br />` がPCでも効いている (hidden md:inline なし) | **要修正** |
| E | カード h3 の高さが不揃い | **要修正** |

---

## STEP 5 — コード監査違反の修正

修正順: パターンDB自動修正 → コード監査違反 → SPビジュアル問題（改行以外）→ PCビジュアル問題（改行以外）

**大原則:**
- パディングの一律変更はしない
- Tailwind のみ（globals.css 禁止）
- `tracker.js` は削除しない
- 修正は1箇所ずつ

---

## STEP 6 — PC改行の修正

### 許可される操作（SP非影響が技術的に保証される）

| 操作 | 例 | なぜSP安全か |
|------|-----|------------|
| `hidden md:inline` 付き `<br />` を**新規追加** | `<br className="hidden md:inline" />` | `hidden` で SP は非表示。`md:inline` で PC のみ表示 |
| `md:` 付きクラスを**新規追加** | `md:min-h-[66px]` | `md:` は 768px 以上のみ適用。SP に一切影響しない |
| `md:max-w-*` の**値を拡大** | `md:max-w-3xl` → `md:max-w-5xl` | `md:` プレフィックス付きのため SP に影響しない |
| 既存の素 `<br />` を `md:hidden` に変更 | `<br />` → `<br className="md:hidden" />` | `md:hidden` は PC でのみ非表示。SP では引き続き表示される |
| コンポーネント個別の `text-balance` 削除 | `text-balance` クラス削除 | globals.css で全見出しに適用済み。個別指定は不要 |

### 絶対禁止（SP に影響する操作）

| 禁止操作 | 理由 |
|---------|------|
| プレフィックスなし `<br />` の新規挿入 | SP/PC 両方に改行が出現する |
| `md:hidden` 付き `<br />` の新規挿入 | SP に新しい改行が出現する（sp-responsive の担当） |
| SPベース値（`text-[Xpx]`, `min-h-[Xpx]` 等）の変更 | SP レイアウトが変わる |
| 既存の `md:hidden` 付き `<br />` の削除・変更 | SP から改行が消える |
| DOM構造の変更（要素の追加・削除・移動） | 予測不能な SP 影響 |

### keep-all 適用後も途中切れが残る場合の修正例

`globals.css` の `word-break: keep-all` で大半は解消されるが、
句読点のない長い見出しでは `overflow-wrap: anywhere` で語中割れするケースがある:

```tsx
// ⚠️ keep-all でも句読点がないと語中で割れる場合がある
<h3 className="leading-snug">定着まで伴走するコミットメント</h3>

// ✅ 自然な位置に PC 専用改行を挿入
<h3 className="leading-snug">
  定着まで伴走する<br className="hidden md:inline" />コミットメント
</h3>
```

> **注意:** `globals.css` で `text-wrap: balance` が全見出しに適用されているため、
> コンポーネント側で個別に `text-balance` を付ける必要はない。
> 既存コードに `text-balance` クラスが残っている場合は削除してよい（globals で適用済み）。

### カード h3 高さ揃えの修正例

```tsx
// ❌ h3 の文字数が異なり下端がずれる
<h3 className="text-[18px] md:text-[20px]">短い見出し</h3>
<h3 className="text-[18px] md:text-[20px]">少し長めの見出しテキスト</h3>

// ✅ md:min-h で PC のみ高さを統一
<h3 className="text-[18px] md:text-[20px] md:min-h-[60px]">短い見出し</h3>
<h3 className="text-[18px] md:text-[20px] md:min-h-[60px]">少し長めの見出しテキスト</h3>
```

---

## STEP 7 — SP非破壊検証（PC改行修正後）

```bash
CAPTURE_VIEWPORTS=sp node .cursor/skills/director-visual/scripts/capture-sections.mjs
```

**修正後の SP フルページ画像を、STEP 1 のベースラインと比較する。**

| 確認項目 | 差分があればNG |
|----------|-------------|
| 見出しの改行位置 | SPで新しい改行が発生していないか |
| カードのレイアウト | 1カラム配置が崩れていないか |
| テキストの配置 | text-left / text-center が変わっていないか |
| 余白 | SPの余白が変わっていないか |

**1箇所でも差分があれば、該当修正を取消して別の方法で再修正する。**

---

## STEP 8 — 再撮影・最終確認

```bash
node .cursor/skills/director-visual/scripts/capture-sections.mjs
```

SP/PC 両方を再撮影し、フルページ画像を Read して確認:
- コード監査違反が解消されているか
- PC改行の問題が解消されているか
- 修正で新たな問題が発生していないか
- 修正前よりビジュアル品質が低下していないか

**1つでも問題が残っていれば STEP 4 に戻る。**

---

## レポートフォーマット

```
## ディレクターレビュー結果

### コード監査
| チェック | 結果 | 違反数 | 備考 |
|----------|------|--------|------|

### パターンDB照合
| パターン | 検出 | アクション | 対象ファイル |
|---------|------|-----------|------------|

### SP セクション別レビュー
| ページ | セクション | 観点 | 問題 | 対応 |
|--------|-----------|------|------|------|
（※SP改行の問題は「sp-responsive スキル推奨」と記載）

### PC セクション別レビュー + PC改行
| ページ | セクション | 観点 | 問題 | 修正内容 |
|--------|-----------|------|------|---------|

### SP非破壊検証（PC改行修正後）
| ページ | セクション | SP差分 | 結果 |
|--------|-----------|--------|------|

### 修正済み一覧
- ファイル: 変更内容

### ルール準拠率
- 初回: X/Y 合格
- 修正後: Y/Y 合格

### SP改行の未対応事項（sp-responsive スキル推奨）
| ページ | セクション | 要素 | 問題 |
|--------|-----------|------|------|
```

---

## 注意事項

- **`tracker.js` は削除・変更禁止**
- **`globals.css` は編集しない**（Tailwind のみ）
- **`line-clamp-*` による意図的な truncation はバグではない**
- **スクショの目視確認を省略しない** — JSON だけで判断しない
- **検出した問題は1つも残さず修正する**（SP改行を除く）
- **SP改行は絶対に修正しない** — sp-responsive スキルに委ねる
