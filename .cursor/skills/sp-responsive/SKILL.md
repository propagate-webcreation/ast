---
name: sp-responsive
description: >-
  SP（375px）の改行品質をセクション単位でレビュー・修正するスキル。
  修正後は必ずPCビューへの非破壊検証を行う。
  ※このスキルは /review sp コマンド経由でのみ実行する。
  会話中のキーワードでは自動起動しない。
---

# sp-responsive — SP改行最適化

**実行条件: ユーザーが「スマホ最適化」「SP改行」「レスポンシブ対応」等を明示した場合のみ。**

## ビューポート定義

| | 幅 | 高さ | 用途 |
|---|---|---|---|
| **SP** | **375px** | 844px | iPhone SE〜15 相当。SP確認は必ず 375px 幅で行う |
| **PC** | 1280px | 800px | 一般的なノートPC |

capture-sections.mjs がこの値でキャプチャする。
手動ブラウザ確認時も DevTools を **375px** に設定すること。

## 設計原則

1. **セクション単位で確認** — フルページ画像では見逃す問題を個別セクション画像で検出する
2. **SP修正はPC非破壊** — SP改行の修正後にPCの全セクションが変わっていないことを検証する
3. **全テキスト要素を1つずつ** — 「問題なさそう」で飛ばさない

---

## ビューポート分離の原則（絶対厳守）

**SP改行の修正がPC表示に影響を与えることは絶対に許されない。**
Tailwind のレスポンシブプレフィックス（`md:` = 768px以上）で物理的に分離する。

### `<br />` タグの影響範囲

`text-wrap: balance` + `keep-all` が自動最適化するため、手動 `<br>` の必要性は大幅に減少。
SP/PC で異なる位置に改行したい場合のみ以下を使う。

| 書き方 | SP (< 768px) | PC (≥ 768px) | このスキルで |
|--------|:-----------:|:-----------:|:----------:|
| `<br />` （素） | 表示される | 表示される | **新規挿入 禁止** |
| `<br className="md:hidden" />` | 表示される | 非表示 | **使用OK** — SP専用改行 |
| `<br className="hidden md:inline" />` | 非表示 | 表示される | **挿入 禁止**（director-visual の担当） |

### クラスの影響範囲

| 書き方 | SP (< 768px) | PC (≥ 768px) | このスキルで |
|--------|:-----------:|:-----------:|:----------:|
| `text-left`（ベース値）+ 既存 `md:text-center` | 適用 | md:で上書き | **使用OK** — SP変更、PC不変 |
| `text-[13px]`（ベース値）+ 既存 `md:text-[16px]` | 適用 | md:で上書き | **使用OK** — SP変更、PC不変 |
| ベース値の変更で `md:` 上書きが**存在しない**場合 | 適用 | **適用** | **変更 禁止** — PC に影響 |
| `md:*` 付きクラスの値変更 | — | 変化 | **変更 禁止** — PC に影響 |

### 既存の素 `<br />` の扱い

素の `<br />` は SP/PC 両方に表示されている。これを修正する場合:

| SPでの扱い | 操作 | PC への影響 |
|-----------|------|:----------:|
| SPで不要 → 除去したい | `<br className="hidden md:inline" />` に変更 | **なし** （PCは引き続き表示） |
| SPで位置が悪い | **位置はそのまま** + 正しい位置に `<br className="md:hidden" />` を新規追加 | **なし** |
| SPで必要・そのまま | 触らない | **なし** |

**原理:** `hidden md:inline` は「デフォルト非表示、768px以上で表示」→ PC表示はそのまま、SPからのみ除去される。

---

## 前提

- `npm run dev` 起動済み
- Playwright: `npm install playwright --save-dev && npx playwright install chromium`
- ポート検出は `director-visual` と同じスクリプトを使用（`.next/server.port` → lsof → 3000 フォールバック）

---

## STEP 1 — ベースライン撮影（SP + PC）

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

**manifest.json を Read** して全キャプチャの一覧を把握する。

> **レビューはフルページ画像をベースに行う。**
> `keep-all` + `text-wrap: balance` でテキストが自然に折り返されるため、
> セクション個別画像は問題箇所を拡大確認したい場合にのみ参照する。

PC のフルページスクリーンショットは **STEP 5 の非破壊検証用ベースライン** として使う。

---

## STEP 2 — コード事前監査

### 2-A. 改行ルール適用確認

```bash
rg 'keep-all|text-wrap|overflow-wrap' app/globals.css
rg 'lang="ja"' app/layout.tsx
rg 'auto-phrase' app/components/ --glob '*.tsx'
```

`globals.css` に以下が設定済みであること:
- `body` → `word-break: normal; overflow-wrap: anywhere;`
- `h1, h2, h3, h4, h5, h6` → `word-break: keep-all; text-wrap: balance;`
- `p, li`（本文）→ **text-wrap は適用しない**（iOS Safari で `text-wrap: pretty` が右側余白をガタつかせるため）
- `html lang="ja"` が存在する
- リード文 `<p>` にコンポーネント側で `[word-break:auto-phrase]` (Tailwind) が適用されているか
- リード文の句点「。」直後に `<br className="hidden md:block" />` で PC のみ改行が入っているか

**未設定の場合はテンプレートに従い追加する。**
`keep-all` が適用済みなら、SP での自然な改行が CSS だけで実現され、
手動 `<br />` の必要性が大幅に減少する。

### 2-B. break-keep の検出

```bash
rg 'break-keep' app/components/
```

**全面禁止。** 検出したら即削除する。
（`keep-all` + `overflow-wrap: anywhere` が `break-keep` の上位互換。文節単位改行を横スクロールなしで実現する）

### 2-C. プレフィックスなし `<br />` の検出

```bash
rg '<br\s*/?\s*>' app/components/ --glob '*.tsx'
```

`className` なしの `<br />` → PC/SP 両方に影響する。
SP改行として活かす場合は `md:hidden` を付与する。

> **keep-all 適用済みの場合:** 手動 `<br />` が不要になっているケースがある。
> keep-all + balance による自然な改行で十分な箇所では、不要な `<br />` を削除してよい。

### 2-D. コンポーネント個別の text-balance

```bash
rg 'text-balance' app/components/ --glob '*.tsx' -B 1 -A 3
```

`globals.css` で `text-wrap: balance` が全見出しに適用済みなら、
コンポーネント側の個別 `text-balance` クラスは**不要**。削除してよい。

### 2-E. 横スクロール防止・禁止プロパティ

```bash
rg 'w-\[\d{3,}px\]' app/components/ --glob '*.tsx'
rg 'text-nowrap|whitespace-nowrap' app/components/ --glob '*.tsx'
rg 'break-all' app/components/ --glob '*.tsx'
rg 'overflow-x:\s*hidden|overflow-x-hidden' app/components/ --glob '*.tsx'
```

`word-break: break-all` / `white-space: nowrap` / `overflow-x: hidden` は全面禁止。

### 2-F. viewport

```bash
rg 'viewport' app/layout.tsx
```

`user-scalable=no` / `maximum-scale=1` 禁止。

---

## STEP 3 — SP ビジュアルレビュー

**`.cache/visual-review/sp/{page}/00-fullpage.png` を Read してページ全体を通しで確認する。**
問題箇所を詳細確認したい場合のみ、個別セクション画像を参照する。

`keep-all` が適用済みなら、大半のテキスト折り返しは自然な位置で行われている。
以下の残存問題に注目して確認する。

### 見出し・テキスト折り返しの判定

| 分類 | `<br>` | 折り返し | 判定 |
|------|:------:|---------|------|
| A | なし | なし or 自然な位置 | OK |
| B | なし | 不自然（途中切れ・端数落ち） | 要修正 |
| C | あり | 自然 | OK |
| D | あり | 不自然 | 要修正 |
| E | あり | PCでも効いている（md:hidden なし） | 要修正 |

**「不自然」の定義:**
- 単語途中切れ（「リーダ↩ー層」「コミットメ↩ント」「す↩る」）
- 助詞（は/が/を/に/で/と）の直前で切れる
- 2文字以下の端数が次行に落ちる
- 括弧の直前で切れる

### 本文（p）の配置

- SP 4行以上 → `text-left` 必須
- SP 1〜3行の `text-center` → 折り返し位置を重点確認

---

## STEP 4 — SP 修正

### 許可される操作（PC非影響が技術的に保証される）

| 操作 | 例 | なぜPC安全か |
|------|-----|------------|
| `md:hidden` 付き `<br />` を**新規追加** | `<br className="md:hidden" />` | `md:hidden` で PC は非表示。SP のみに改行が出現する |
| SPベース値の変更（`md:` 上書き**既存**の場合のみ） | `text-[13px]`（`md:text-[16px]` が既にある） | PC は `md:` 値を使うためベース値の変更は無視される |
| 既存の素 `<br />` を `hidden md:inline` に変更 | `<br />` → `<br className="hidden md:inline" />` | `hidden` で SP から除去。`md:inline` で PC は引き続き表示 |
| SP フォントサイズの縮小（`md:` 上書き**既存**の場合のみ） | `text-[18px]` → `text-[16px]`（`md:text-[26px]` が既にある） | PC は `md:` 値を使うためベース値の変更は無視される |
| SP コンテナの padding 縮小（`md:` 上書き**既存**の場合のみ） | `px-8` → `px-4`（`md:px-8` が既にある） | 同上 |
| SP コンテナの max-width 拡大（`md:` 上書き**既存**の場合のみ） | `max-w-[280px]` → `max-w-[340px]`（`md:max-w-[280px]` が既にある） | 同上 |

#### `<br>` で解決できない場合の判断フロー

`<br>` の挿入だけでは自然な改行位置が作れない場合、根本原因はコンテナ幅やフォントサイズにある。
以下の順で調整する:

1. **padding / margin を詰める** → テキスト領域を広げる（最も影響が小さい）
2. **コンテナの max-width を広げる** → テキスト領域を広げる
3. **フォントサイズを下げる** → 1行の文字数を増やす（フォントサイズテーブルの下限まで）

いずれも `md:` 上書きが既に存在する場合のみ許可。存在しない場合は先に `md:` 値を追加してから SP ベース値を変更する。

### 絶対禁止（PC に影響する操作）

| 禁止操作 | 理由 |
|---------|------|
| **テキスト内容の変更（文言の書き換え・短縮・削除）** | コンテンツはディレクター管轄。AIが勝手に変えてはならない |
| プレフィックスなし `<br />` の新規挿入 | SP/PC 両方に改行が出現する |
| `hidden md:inline` 付き `<br />` の新規挿入 | PC に新しい改行が出現する（director-visual の担当） |
| `md:` / `lg:` 付きクラスの値変更 | PC レイアウトが変わる |
| 既存の `hidden md:inline` 付き `<br />` の削除・変更 | PC から改行が消える |
| SPベース値の変更で `md:` 上書きが**存在しない**場合 | PC もベース値を参照するため PC が変わる |
| DOM構造の変更（要素の追加・削除・移動） | 予測不能な PC 影響 |

### SP改行の挿入位置（優先順）

1. **`・`（中黒）がある場合** → 中黒の位置で改行

```tsx
<h3>
  企画<span className="md:inline hidden">・</span>
  <br className="md:hidden" />立案サポート
</h3>
```

2. **`、`（読点）がある場合** → 読点の直後

```tsx
<h2>門真の医療と介護を、<br className="md:hidden" />真心で。</h2>
```

3. **上記がない場合** → 助詞の直後（意味の切れ目）

---

## STEP 5 — PC非破壊検証（SP修正後）

```bash
CAPTURE_VIEWPORTS=pc node .cursor/skills/director-visual/scripts/capture-sections.mjs
```

**修正後の PC フルページ画像を、STEP 1 のベースラインと比較する。**

| 確認項目 | 差分があればNG |
|----------|-------------|
| 見出しの改行位置 | PCで新しい改行が発生していないか |
| カードのレイアウト | 横並び・高さ・余白が変わっていないか |
| テキストの配置 | text-center / text-left が変わっていないか |
| 余白・パディング | PCの余白が広がった/狭まっていないか |

**1箇所でも差分があれば、該当修正を取消して別の方法で再修正する。**

---

## STEP 6 — 最終確認

```bash
CAPTURE_VIEWPORTS=sp node .cursor/skills/director-visual/scripts/capture-sections.mjs
```

SP を再撮影し、フルページ画像を Read して確認:

1. STEP 3 で検出した問題がすべて解消されているか
2. 修正で新たな問題が発生していないか

**1つでも問題が残っていれば STEP 3 に戻る。**

---

## レポートフォーマット

```
## SP改行最適化レビュー結果

### コード事前監査
| チェック | 結果 | 件数 | 備考 |
|----------|------|------|------|

### SP セクション別レビュー
| ページ | セクション | 要素 | 問題 | 修正内容 |
|--------|-----------|------|------|---------|

### PC非破壊検証（SP修正後）
| ページ | セクション | PC差分 | 結果 |
|--------|-----------|--------|------|

### 最終確認
| ページ | セクション | SP問題解消 | 結果 |
|--------|-----------|:---------:|------|

### 修正済み一覧
- ファイル: 変更内容
```

---

## 注意事項

- **`tracker.js` は削除・変更禁止**
- **`globals.css` は編集しない**（Tailwind のみ）
- **`line-clamp-*` による意図的な truncation はバグではない**
- **スクショの目視確認を省略しない** — JSON だけで判断しない
- **検出した問題は1つも残さず修正する**
- **PC改行は絶対に修正しない** — PC改行は director-visual スキルの担当
