---
name: localize-images
description: >-
  プロジェクト内のUnsplash等の外部画像URLを検出し、
  ローカルにダウンロードしてパスを置換する一括変換スキル。
  ※このスキルは /unsplash コマンド経由でのみ実行する。
  会話中のキーワードでは自動起動しない。
---

# localize-images — 外部画像のローカル化

## 実行方法

### STEP 1 — dry-run（変更なし・レポートのみ）

```bash
node .cursor/skills/localize-images/scripts/localize.mjs
```

対象ファイルと外部URL一覧が出力される。問題なければ STEP 2 へ。

### STEP 2 — 適用（ダウンロード＋コード置換）

```bash
node .cursor/skills/localize-images/scripts/localize.mjs --apply
```

### STEP 3 — 確認

- ターミナルに出力された置換レポートを確認
- 開発サーバーで画像が正常に表示されることを目視確認

---

## スクリプトが自動処理する内容

| ステップ | 処理 |
|----------|------|
| 1. 検索 | `app/` および `src/` ディレクトリ以下の `.tsx` / `.jsx` / `.ts` / `.js` ファイルを再帰走査し、外部画像URL（`https://images.unsplash.com/...` など）を検出 |
| 2. ダウンロード | 検出したURLから画像を `public/images/unsplash/` にダウンロード。ファイル名はURLのphoto IDまたは連番（`unsplash-001.jpg`） |
| 3. コード置換 | 対象ファイルの `src` 属性等に指定されていた外部URLを、ローカルパス（`/images/unsplash/unsplash-001.jpg`）に書き換え |
| 4. レポート | 置換済みファイル一覧・保存画像枚数を出力 |

## 検出対象URL

| パターン | 例 |
|----------|-----|
| Unsplash | `https://images.unsplash.com/photo-...` |
| Pexels | `https://images.pexels.com/photos/...` |
| その他外部画像 | `https://` で始まり `.jpg` / `.jpeg` / `.png` / `.webp` / `.gif` / `.avif` / `.svg` で終わるURL |

※ `next/image` の `remotePatterns` に依存せず、ローカルファイルとして管理することで
ビルドの安定性・表示速度・オフライン開発を改善する。

## スクリプトが触らないもの

| 対象 | 理由 |
|------|------|
| `node_modules/` 以下 | 外部依存 |
| `.next/` 以下 | ビルド成果物 |
| OGP用の外部URL（メタデータ内） | SNSクローラーが直接取得するため |
| Google Maps iframe の `src` | 画像ではない |

## 前提条件

- Node.js 18+ がインストールされていること（`fetch` API を使用）
- `public/images/unsplash/` ディレクトリは自動作成される
