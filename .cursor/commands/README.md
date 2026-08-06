# Cursor Commands

サイトリポジトリで使うスラッシュコマンド一覧。各コマンドの詳細は同ディレクトリの `.md` を参照。

| コマンド | 概要 |
|---------|------|
| `/design-feedback` | 修正前後のデザイン差分を MD 化し、`design-feedback-stock` へ PR（bot-v3 は後から取り込み） |
| `/sp-optimize` | SP 表示の grep 静的解析・修正（スクショ不要） |
| `/review` | レビュー系スキルのエントリポイント |
| `/design-recommend` | デザインストックからリファレンスを統合 |
| `/excel-apply` | Excel 修正指示の適用 |

---

# /design-feedback — デザインフィードバック

ポリッシュ後のサイトと修正前（省略時 `origin/main`）の差分から、デザイン変更を構造化 MD にまとめる。

- 詳細: [`design-feedback.md`](./design-feedback.md)
- ローカル: `Site-Fix/output/{案件番号}-{案件名}/`
- 送信先（既定）: [`propagate-webcreation/design-feedback-stock`](https://github.com/propagate-webcreation/design-feedback-stock) へ PR
- **bot-v3 の clone / 書き込み権限は不要**（`propagate-webcreation` の `gh` 認証があれば可）
- upload 時の stock clone は **サイトリポ外の一時ディレクトリ**（サイトへ push しない）
- タイミング: **main へ push する前**（commit 後）が安全
- オプション: `--shots=skip` / `--upload=skip`

```
/design-feedback
/design-feedback origin/main --shots=skip
/design-feedback origin/main --upload=skip
```

---

# /sp-optimize — スマホ表示最適化コマンド

PC版を人手修正した後に壊れがちなSPレイアウトを、grep静的解析で一括検知・修正するコマンド。
スクショ不要、1〜2分で完結。

## 何が直るか

| カテゴリ | 検知する問題 |
|---------|------------|
| 横はみ出し | 固定幅がモバイル超え、absolute要素の画面外はみ出し、横スクロールUI |
| レイアウト崩れ | grid/flexがモバイルで折り返さない、gap/paddingが大きすぎ/小さすぎ |
| 画像 | w-fullなし、固定高さにブレークポイントなし、vh単位（iOS Safari問題） |
| FV | Hero見出し大きすぎ、ダークオーバーレイ濃すぎ、ヘッダー高すぎ |
| タッチ | タップターゲット44px未満、ボタン間隔狭すぎ、デッドリンク |
| フォント | SP/PC 2段指定なし、Tailwind相対サイズ、サイズ小さすぎ、行間詰まりすぎ |
| 禁止パターン | carousel/lenis/marquee、不要な`<br>`、text-wrap: pretty |

## できないこと

スクショの目視が必要な作業（テキスト見切れ検出、改行品質レビュー、PC非破壊検証）は対象外。
必要に応じて `/review sp` `/review overflow` `/review director` を別途実行する。

## 使い方

```
/sp-optimize
```

## 処理フロー（4 Phase）

```
Phase 1: コードクリーンアップ  ← 不要<br>・禁止プロパティの自動除去
    ↓
Phase 2: 静的解析（30ルール）  ← grepで横はみ出し・レイアウト崩れ等を検知・修正
    ↓
Phase 3: iOS ビューポート修正  ← vh単位・smooth-scroll等のiOS Safari問題を修正
    ↓
Phase 4: フォントサイズ正規化  ← SP/PCの2段指定、サイズテーブル準拠
```

## 制約

- テキスト内容の変更は絶対禁止
- PC版（`md:` 以上のクラス）は一切変更しない
- `globals.css` は原則編集しない
