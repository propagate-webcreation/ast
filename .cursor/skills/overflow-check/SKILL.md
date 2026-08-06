---
name: overflow-check
description: >-
  スクリーンショットを撮影し、テキストの見切れ・はみ出し・オーバーフローを
  目視検出して修正するスキル。軽量な3ステップ（撮影→検出→修正）で完結する。
  ※このスキルは /review overflow コマンド経由でのみ実行する。
  会話中のキーワードでは自動起動しない。
---

# overflow-check — テキスト見切れ検出・修正

## 目的

スクリーンショットを撮影し、**テキストが見切れている・はみ出している箇所**を
検出して修正する。軽量・高速に完結することを優先する。

---

## ビューポート定義

| | 幅 | 高さ |
|---|---|---|
| **SP** | 375px | 844px |
| **PC** | 1280px | 800px |

## 前提

- `npm run dev` 起動済み
- Playwright インストール済み（`npx playwright install chromium`）
- ポート検出は `director-visual` と同じスクリプトを使用

---

## STEP 1 — スクリーンショット撮影

```bash
mkdir -p .cache/visual-review
node .cursor/skills/director-visual/scripts/capture-sections.mjs
```

**`.cache/visual-review/sp/{page}/00-fullpage.png` と `pc/{page}/00-fullpage.png` を Read する。**

---

## STEP 2 — 見切れ検出

SP / PC のフルページ画像を上から下まで確認し、以下の問題を探す。

### 検出対象

| # | 問題 | 典型的な原因 | 優先度 |
|---|------|------------|--------|
| 1 | テキストが右端で途切れている | 固定幅 + `overflow: hidden`、`white-space: nowrap` | 🔴 即修正 |
| 2 | テキストが容器の外にはみ出している | 固定幅に収まらない長文、`w-[Xpx]` が狭い | 🔴 即修正 |
| 3 | 横スクロールが発生している | 要素がビューポート幅を超えている | 🔴 即修正 |
| 4 | テキストが固定高さで下が切れている | `h-[Xpx]` + `overflow-hidden` で下部が非表示 | 🔴 即修正 |
| 5 | ボタン内テキストが収まっていない | ボタン幅が狭い、テキストが長い | 🔴 即修正 |
| 6 | 画像の上にテキストが重なって読めない | `z-index` 不足、オーバーレイなし | 🔴 即修正 |
| 7 | `line-clamp` / `truncate` で意図しない省略 | 意図的なら OK。情報が欠落していれば問題 | 🟡 確認 |

### 検出しないもの（このスキルの範囲外）

- 改行位置の美しさ → `sp-responsive` / `director-visual` の担当
- フォントサイズの適正 → `font-review` の担当
- デザイン4原則 → `layout-principles-review` の担当
- 配色 → `color-review` の担当

### コードからの裏付け確認

画像で問題箇所を特定したら、対応するコンポーネントのコードを確認する。

```bash
# 横スクロール・はみ出しの原因になるクラスを検索
rg 'overflow-hidden|overflow-x-hidden' app/components/ --glob '*.tsx'
rg 'whitespace-nowrap|text-nowrap' app/components/ --glob '*.tsx'
rg 'truncate|line-clamp' app/components/ --glob '*.tsx'
rg 'w-\[\d+px\]|h-\[\d+px\]' app/components/ --glob '*.tsx'
```

---

## STEP 3 — 修正

### 修正パターン

| 原因 | 修正方法 |
|------|---------|
| `overflow-hidden` でテキスト切れ | `overflow-hidden` を除去、または高さ制約を緩和 |
| `white-space: nowrap` + 固定幅 | `nowrap` を除去（ナビ等の意図的な使用は除く） |
| 固定幅 `w-[Xpx]` が狭い | `w-full` / `max-w-[Xpx]` に変更、または幅を広げる |
| 固定高さ `h-[Xpx]` でテキスト下部切れ | `min-h-[Xpx]` に変更（高さを最低保証に） |
| ボタン内テキストがはみ出し | `px` を増やす、`whitespace-nowrap` を除去、文言を短縮 |
| SP で横スクロール | 原因要素の幅を `max-w-full` に制限 |
| テキストが画像に重なって読めない | オーバーレイ `bg-black/50` を追加、または `drop-shadow` |

### 修正ルール

- **`md:` プレフィックス付きの値は変更しない**（PC に影響する）— SP のみ修正する場合
- **`line-clamp-*` / `truncate` が意図的な場合は触らない**
- **DOM構造の変更は最小限に**（クラスの変更で解決できるならクラスのみ）
- 修正後は該当ビューポートのスクリーンショットを再撮影して確認する

---

## STEP 4 — 再撮影・確認

```bash
node .cursor/skills/director-visual/scripts/capture-sections.mjs
```

修正前後のフルページ画像を比較し:

1. 見切れが解消されているか
2. 修正で新たな問題（レイアウト崩れ等）が発生していないか
3. SP修正の場合、PC側に影響がないか

**問題が残っていれば STEP 2 に戻る。**

---

## レポートフォーマット

```
## テキスト見切れチェック結果

### 検出した問題
| # | ビューポート | 箇所 | 問題 | 原因 | 修正内容 |
|---|------------|------|------|------|---------|

### 修正済み一覧
- ファイル: 変更内容

### 確認事項（意図的な可能性）
| # | 箇所 | 状態 | 備考 |
|---|------|------|------|
```
