# サイト構成ガイド生成ツール

Webサイトの構成情報をYAML形式で定義し、クライアント向けの修正指示用Excelファイルを自動生成するツールです。

---

## ファイル構成

```
generate_site_guide.py   # メインスクリプト（必須）
config_sample.yaml       # サンプル設定ファイル（参考用）
README.md                # このファイル
```

---

## Claudeへの指示文（プロジェクト指示に追加）

```
【サイト構成ガイドの出力手順】

サイト構成を出力する際は、以下の手順で行ってください。

1. generate_site_guide.py を /home/claude にコピー
2. app/ ディレクトリを参照し、以下の順序で config.yaml を作成：
   a. Header.tsx を確認し、ナビゲーションのリンク順でページ順を決定する
   b. 各ページの page.tsx を確認し、コンポーネントの並び順を把握する
   c. 各コンポーネントファイル（.tsx）の内容を読み込む
   d. ページ順・セクション順に従って config.yaml を記載する
3. 以下のコマンドを実行：
   pip install openpyxl pyyaml --break-system-packages -q
   python generate_site_guide.py config.yaml output
4. 出力されたExcelファイルを /mnt/user-data/outputs/ にコピー

【config.yaml の作成ルール】
- site_name: 英数字のみ（ファイル名に使用）
- common_sections: ヘッダー・フッター（全ページ共通）
- pages: 各ページの定義（※ Header.tsx のナビ順に従う）
  - name: ページ名
  - sections: セクション一覧（※ page.tsx の並び順に従う）
    - name: セクション名
    - content: 内容（テキスト）

【ページ順の決定方法】
- Header.tsx のナビゲーションリンクの並び順 = ページの順番
- 例: ホーム → 記事一覧 → 当メディアについて → お問い合わせ の順なら
      config.yaml の pages も同じ順番で記載する

【セクション順の決定方法】
- 必ず該当ページの page.tsx を最初に確認する
- page.tsx 内でコンポーネントが呼び出されている順番 = セクションの順番
- 例: <HomeHero /> → <HomeCategoryOverview /> → <HomeLatestArticles /> の順なら
      config.yaml の sections も ヒーロー → カテゴリ概要 → 最新記事 の順に記載

【contentの記載ルール】
- 【セクション名】で始める
- 見出し、説明文、ボタンを改行区切りで記載
- ボタン・リンクは ► を先頭につける
- 箇条書きは ・ を使用
- サブセクションは ■ を使用
```

---

## 出力Excelの構成

| 列 | 内容 |
|---|---|
| A列 | ページ名 |
| B列 | セクション名 |
| C列 | 内容（現在のテキスト） |
| D列 | 修正内容（クライアント記入欄） |

---

## 注意事項

- 先頭行固定（freeze panes）は適用されません
- ファイル名に日本語は使用しないでください
