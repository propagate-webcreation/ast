# Excel Apply - 修正指示の適用

Excelファイルに記入された修正指示を読み取り、サイトに反映します。

## Context Files

- `Site-Fix/input/` (Excelファイルの検索対象)
- `app/components/` (修正対象のコンポーネント)
- `memories/excel_apply_workflow.yaml`

## Instructions

**🚨 重要: Excelファイルの修正指示を読み取り、サイトを修正します。**

### Step 1: Excelファイルを特定

1. `Site-Fix/input/` ディレクトリ内の最新の `.xlsx` ファイルを検索
2. ファイルが見つからない場合はエラーメッセージを表示して終了

### Step 2: 修正指示を抽出

1. Pythonスクリプトで以下を実行:
   ```python
   import openpyxl
   wb = openpyxl.load_workbook('ファイルパス')
   ws = wb.active
   for row in ws.iter_rows(min_row=7, values_only=True):
       page, section, content, revision = row
       if revision and str(revision).strip():
           print(f'【ページ】{page}')
           print(f'【セクション】{section}')
           print(f'【修正内容】{revision}')
   ```
2. 修正指示がない場合は「修正指示がありません」と表示して終了

### Step 3: サイト構造を把握（動的解決）

1. `app/components/shared/Header.tsx` を読み、ナビゲーションのリンク順でページを特定
2. 各ページの `page.tsx` を読み、コンポーネントの並び順を把握
3. セクション名とコンポーネントの対応を動的に構築:
   - Excelのセクション名（例：「ヒーローセクション」「VALUE」）
   - page.tsx 内のコンポーネント呼び出し順（例：`<HomeHero />`, `<AboutValue />`）
   - セクション名のキーワードとコンポーネント名を照合して対応付け

### Step 4: 修正を実行

1. 各修正指示について:
   - Step 3 で特定したコンポーネントファイルを読み込む
   - 修正内容を解釈してコードを修正
   - 修正完了をユーザーに報告

2. セクション名からコンポーネントを特定する方法:
   - セクション名に含まれるキーワードで照合
   - 例：「ヒーロー」→ `*Hero*.tsx`
   - 例：「VALUE」→ `*Value*.tsx`
   - 例：「トレンド」→ `*Trend*.tsx`
   - 例：「コラム」→ `*Column*.tsx`
   - 例：「CTA」→ `*Cta*.tsx`
   - 例：「フォーム」→ `*Form*.tsx`

## セクション名 → コンポーネント照合ルール

セクション名に含まれるキーワードでコンポーネントを特定：

| キーワード | 検索パターン |
|-----------|-------------|
| ヘッダー | `Header.tsx` |
| フッター | `Footer.tsx` |
| ヒーロー | `*Hero*.tsx` |
| 特徴 / Feature | `*Feature*.tsx` |
| 記事 / Article | `*Article*.tsx` |
| トレンド / Trend | `*Trend*.tsx` |
| コラム / Column | `*Column*.tsx` |
| CTA | `*Cta*.tsx` |
| コンセプト / Concept | `*Concept*.tsx` |
| ミッション / MISSION | `*Mission*.tsx` |
| バリュー / VALUE | `*Value*.tsx` |
| ビジョン / VISION | `*Vision*.tsx` |
| フォーム / Form | `*Form*.tsx` |
| イントロ / Intro | `*Intro*.tsx` |

※ ページ名も考慮して対象を絞り込む（例：「記事・トレンドページ」の「カード記事」→ `contents/` 内を検索）

## Execution Example

**User:** `/excel-apply`

**AI Action:**
```
[Step 1] Excelファイルを特定
  📁 Site-Fix/input/SITE_site_guide_YYYYMMDD.xlsx

[Step 2] 修正指示を抽出
  ✅ N件の修正指示を検出

[Step 3] サイト構造を把握
  ✅ Header.tsx からページ構成を取得
  ✅ 各page.tsx からコンポーネント構成を取得
  ✅ セクション名とコンポーネントの対応を構築

[Step 4] 修正を実行
  ✅ 対象コンポーネントを特定して修正

✅ 修正適用が完了しました！
```

## Notes

- 修正指示は自然言語で記載可能（AIが解釈）
- セクション名とコンポーネントの対応は動的に解決
- プロジェクトごとの固有設定は不要（汎用的に動作）
- 1回の実行で複数の修正を適用可能
- `/excel-apply` はD列（修正内容）のみを適用
- `/excel-apply-director` はE列（ディレクター確認欄）のみを適用
