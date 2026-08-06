# /review — レビュー統合コマンド

レビュー系スキルを一括管理するエントリポイント。
**レビュー系スキルはすべてこのコマンド経由でのみ実行する。**

## 使用方法

```
/review [タイプ]
```

## レビュータイプ一覧

| タイプ | スキル | 内容 | 速度 |
|--------|--------|------|------|
| `director` | director-visual | 総合ビジュアルレビュー（コード監査 + SP/PC検証 + PC改行調整） | 🐢 重い |
| `overflow` | overflow-check | スクショで見切れ・はみ出し検出 → 修正 | 🐇 軽い |
| `text-wrap` | text-wrap-cleanup | 不要な `<br>` / 禁止プロパティの一括除去 | ⚡ 最速 |
| `sp` | sp-responsive | SP（375px）の改行品質レビュー・修正 | 🐢 重い |
| `font` | font-review | フォントサイズ・ウェイト・行間の整合性チェック | 🐇 軽い |
| `color` | color-review | 配色比率・コントラスト・色使いチェック | 🐇 軽い |
| `image` | image-icon-review | 画像・アイコン統一性・写真トーンチェック | 🐇 軽い |
| `layout` | layout-principles-review | デザイン4原則（近接・整列・コントラスト・反復） | 🐇 軽い |
| `lp-structure` | lp-structure-review | LP 構成・ストーリーラインチェック | 🐇 軽い |
| `lp-design` | lp-design-review | LP 各セクションデザインチェック | 🐇 軽い |
| `corporate` | corporate-design-review | コーポレートサイトデザインチェック | 🐇 軽い |

## 使用例

```
/review director         ← 総合レビュー
/review overflow         ← 見切れチェックだけ
/review text-wrap        ← 改行整理だけ（スクリプト自動実行）
/review font color       ← フォント + 配色を同時実行
/review lp               ← LP 系をまとめて実行（lp-structure + lp-design）
/review              ← 全レビュー実行
```

## 実行ルール

### 1. スキルファイルを読む

指定されたタイプに対応するスキルの SKILL.md を **必ず読んでから** 実行する。

| タイプ | 読むファイル |
|--------|-------------|
| `director` | `.cursor/skills/director-visual/SKILL.md` |
| `overflow` | `.cursor/skills/overflow-check/SKILL.md` |
| `text-wrap` | `.cursor/skills/text-wrap-cleanup/SKILL.md` |
| `sp` | `.cursor/skills/sp-responsive/SKILL.md` |
| `font` | `.cursor/skills/font-review/SKILL.md` |
| `color` | `.cursor/skills/color-review/SKILL.md` |
| `image` | `.cursor/skills/image-icon-review/SKILL.md` |
| `layout` | `.cursor/skills/layout-principles-review/SKILL.md` |
| `lp-structure` | `.cursor/skills/lp-structure-review/SKILL.md` |
| `lp-design` | `.cursor/skills/lp-design-review/SKILL.md` |
| `corporate` | `.cursor/skills/corporate-design-review/SKILL.md` |

### 2. 複数タイプ指定時は並列実行

2つ以上のタイプが指定された場合、**Task tool で並列起動** する。
各 Task の prompt にスキルの SKILL.md の内容を含めること。

### 3. ショートカット

| 入力 | 展開先 |
|------|--------|
| `all` | 全11タイプ |
| `lp` | `lp-structure` + `lp-design` |
| `quick` | `text-wrap` + `overflow`（最速コンボ） |
| `design` | `font` + `color` + `image` + `layout` |

### 4. タイプ省略時

タイプを指定しなかった場合、上記の一覧テーブルを表示してユーザーに選択を求める。

## 前提

- `npm run dev` 起動済み（スクショ系レビューの場合）
- Playwright インストール済み（`npx playwright install chromium`）
