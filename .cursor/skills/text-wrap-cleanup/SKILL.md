---
name: text-wrap-cleanup
description: >-
  text-wrap: balance + word-break: keep-all（見出し）を活かし、
  不要な手動改行（<br>）や禁止プロパティを自動スクリプトで一括除去する。
  ※このスキルは /review text-wrap コマンド経由でのみ実行する。
  会話中のキーワードでは自動起動しない。
---

# text-wrap-cleanup — keep-all + balance 前提の一括リファクタリング

## 実行方法

### STEP 1 — dry-run（変更なし・レポートのみ）

```bash
node .cursor/skills/text-wrap-cleanup/scripts/cleanup.mjs
```

レポートを確認し、問題なければ STEP 2 へ。

### STEP 2 — 適用

```bash
node .cursor/skills/text-wrap-cleanup/scripts/cleanup.mjs --apply
```

### STEP 3 — 要確認リストの対応

スクリプトが「要確認（nowrap — 意図的な可能性）」として出力した項目を目視チェック。
ナビ・ボタン等の1行テキストに `whitespace-nowrap` が付いているケースは意図的なので残す。

---

## スクリプトが自動処理する内容

| 対象 | 処理 |
|------|------|
| 素の `<br />` / `<br>` / `<br/>`（className なし） | 除去 |
| `break-all` | 除去 |
| `break-keep` | 除去 |
| `overflow-x-hidden` | 除去 |
| `whitespace-nowrap` / `text-nowrap`（見出し・本文） | 除去 |
| `whitespace-nowrap` / `text-nowrap`（ナビ・ボタン等） | 要確認リストに出力（自動除去しない） |
| `text-balance` / `text-pretty`（globals.css と重複） | 除去 |

## スクリプトが警告する内容（自動修正しない）

| 対象 | 問題 | 対処 |
|------|------|------|
| `<div>` に本文テキスト | 本文は `<p>` / `<li>` で書くのが正しい | `<div>` を `<p>` に変更（`[text-wrap:pretty]` の付与は禁止 — iOS Safari で右余白がガタつく） |
| Flex 子に `min-w-0` なし | Flex の `min-width: auto` がテキスト折り返しを阻害 | テキストを含む Flex 子に `min-w-0` を追加 |
| `<span>短文</span>`（className なし） | auto-phrase が要素境界をまたいで文節を認識できない | span を除去してテキストを連結 |
| `<span className="...">短文</span>` | 同上だがスタイル目的の可能性あり | 不要なら除去、スタイル必要なら残す |
| globals.css に unlayered 要素セレクタ | `span { font-size: 13px; }` 等が Tailwind ユーティリティに勝ってしまう | 削除するか `@layer base { ... }` の中に移動 |

### 誤検出を避ける条件

- div 検出: `flex` / `grid` / `gap-` / `relative` 等のレイアウト用 div は対象外
- div 検出: 子に `<p>` / `<li>` / `<h1-6>` がある div は対象外（ラッパーなので問題ない）
- div 検出: CJK 10文字未満のラベル的テキストは対象外
- Flex 検出: `flex-col` は対象外（縦レイアウトはこの問題が起きにくい）
- span 検出: `sr-only` / `icon` / `aria-` / `role=` を含む span は対象外
- span 検出: 4文字以上の日本語テキストは対象外（文節として十分な長さ）
- CSS 検出: `font-family` / `text-wrap` / `word-break` / `scroll-behavior` は許可（初期セットアップ用）
- CSS 検出: `@layer` / `@theme` 内のルールは対象外

## スクリプトが触らないもの

| 対象 | 理由 |
|------|------|
| **同一行に `<h1` がある素の `<br>`** | h1 キャッチコピーは意図的な改行位置の制御が必要なため残す |
| `<br className="md:hidden" />` | SP専用改行（意図的） |
| `<br className="hidden md:inline" />` | PC専用改行（意図的） |
| `dangerouslySetInnerHTML` 内の `<br>` | JSX ではないため対象外 |

---

## マルチエージェント実行（推奨）

cleanup スクリプトは一瞬で終わる。時間がかかるのは**検証（スクショ撮影 + 目視）**。
これを SP / PC で並列化する。

### 実行パターン

```
[メインエージェント]
  │
  ├─ 1. node cleanup.mjs --apply        ← 即完了
  │
  ├─ 2. Task (並列起動)
  │     ├─ Agent A: SP 検証
  │     │   CAPTURE_VIEWPORTS=sp node .cursor/skills/director-visual/scripts/capture-sections.mjs
  │     │   → SP フルページ画像を確認 → 見切れがあれば修正
  │     │
  │     └─ Agent B: PC 検証
  │         CAPTURE_VIEWPORTS=pc node .cursor/skills/director-visual/scripts/capture-sections.mjs
  │         → PC フルページ画像を確認 → 見切れがあれば修正
  │
  └─ 3. 結果統合 → レポート出力
```

### Task tool での並列起動例

メインエージェントが以下のように **1つのメッセージで2つの Task を同時呼び出し** する:

```
Task A:
  subagent_type: "shell"
  prompt: |
    CAPTURE_VIEWPORTS=sp node .cursor/skills/director-visual/scripts/capture-sections.mjs
    撮影した .cache/visual-review/sp/*/00-fullpage.png を確認し、
    テキスト見切れ・はみ出しがあれば報告して。

Task B:
  subagent_type: "shell"
  prompt: |
    CAPTURE_VIEWPORTS=pc node .cursor/skills/director-visual/scripts/capture-sections.mjs
    撮影した .cache/visual-review/pc/*/00-fullpage.png を確認し、
    テキスト見切れ・はみ出しがあれば報告して。
```

### 他スキルとの並列実行

cleanup 完了後、以下のスキルも **同時に** 走らせられる:

| Agent | スキル | 内容 |
|-------|--------|------|
| A | overflow-check | SP スクショで見切れ検出 |
| B | overflow-check | PC スクショで見切れ検出 |
| C | font-review | フォントサイズ・ウェイトの整合性チェック |

---

## 前提条件

- `globals.css` に以下の改行ルールが存在すること:
  - `body` → `word-break: normal; overflow-wrap: anywhere;`
  - `h1, h2, h3, h4, h5, h6` → `word-break: keep-all; text-wrap: balance;`
  - `p, li`（本文）→ **text-wrap は適用しない**（iOS Safari で `text-wrap: pretty` が右側余白をガタつかせるため）
  - リード文 `<p>` にはコンポーネント側で `[word-break:auto-phrase]` (Tailwind) を個別適用する
  - リード文の句点「。」直後に `<br className="hidden md:block" />` で PC のみ改行を入れる
- `<html lang="ja">` が設定されていること

いずれかが欠けている場合はスクリプト実行前に追加する。
