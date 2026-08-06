# プロジェクト同梱スキル

クリエイティブチェック用の **SKILL.md** と Playwright 用 **`.mjs`** をこのリポジトリ内に置いている。
グローバルの `~/.cursor/skills/` は不要。エージェントは各フォルダの `SKILL.md` を読んで手順に従う。

## スキル一覧

### レビュー系（/review コマンド経由で実行）

| フォルダ | 用途 | トリガー |
|----------|------|---------|
| `director-visual/` | 総合ビジュアルレビュー + PC改行調整 | `/review director` |
| `sp-responsive/` | SP（375px）改行品質レビュー・修正 | `/review sp` |
| `overflow-check/` | テキスト見切れ・はみ出し検出 | `/review overflow` |
| `text-wrap-cleanup/` | 不要 `<br>` / 禁止プロパティ一括除去 | `/review text-wrap` |
| `font-review/` | フォントサイズ・ウェイト・行間チェック | `/review font` |
| `color-review/` | 配色比率・コントラストチェック | `/review color` |
| `image-icon-review/` | 画像・アイコン統一性チェック | `/review image` |
| `layout-principles-review/` | デザイン4原則チェック | `/review layout` |
| `lp-structure-review/` | LP 構成・ストーリーラインチェック | `/review lp-structure` |
| `lp-design-review/` | LP 各セクションデザインチェック | `/review lp-design` |
| `corporate-design-review/` | コーポレートサイトデザインチェック | `/review corporate` |

### SP最適化系（/sp-optimize コマンド経由で実行）

| フォルダ | 用途 | Phase |
|----------|------|-------|
| `text-wrap-cleanup/` | コードクリーンアップ | Phase 1 |
| `ios-viewport-fix/` | iOS ビューポートジャンプ修正 | Phase 2 |
| `overflow-check/` | テキスト見切れ修正 | Phase 3 |
| `font-review/` | フォントサイズ正規化 | Phase 4 |
| `sp-responsive/` | SP 改行品質レビュー | Phase 5 |

### その他

| フォルダ | 用途 | トリガー |
|----------|------|---------|
| `localize-images/` | Unsplash 画像のローカル化 | 手動実行 |

## キャプチャスクリプト

複数スキルが共有する **`capture-sections.mjs`**（`director-visual/scripts/` に配置）で
セクション単位のスクリーンショットを撮影する。

```bash
# SP + PC 両方（デフォルト）
node .cursor/skills/director-visual/scripts/capture-sections.mjs

# SP のみ
CAPTURE_VIEWPORTS=sp node .cursor/skills/director-visual/scripts/capture-sections.mjs

# PC のみ
CAPTURE_VIEWPORTS=pc node .cursor/skills/director-visual/scripts/capture-sections.mjs

# 特定ページのみ
PREVIEW_ROUTES="/,/about" node .cursor/skills/director-visual/scripts/capture-sections.mjs

# ポート指定
PREVIEW_BASE_URL=http://127.0.0.1:4000 node .cursor/skills/director-visual/scripts/capture-sections.mjs
```

### 出力構造

```
.cache/visual-review/
  sp/
    home/
      00-fullpage.png
      01-header.png
      02-hero.png
      ...
  pc/
    home/
      00-fullpage.png
      01-header.png
      ...
  manifest.json
```

ポートは自動検出される（`lsof` で Node.js のリッスンポートを探索）。
`npm run dev` が起動していれば `PREVIEW_BASE_URL` の指定は不要。
