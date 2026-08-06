# Excel Site Guide

サイト構成ガイドのExcelファイルを生成します（クライアント向け修正指示用）。

## Context Files

- `Site-Fix/Cursor-Instructions.md`
- `Site-Fix/generate_site_guide.py`
- `Site-Fix/config_sample.yaml`
- `memories/excel_guide_workflow.yaml`

## Instructions

**🚨 重要: サイトのコンポーネントを読み込んで config.yaml を作成し、Excelファイルを生成します。**

### Step 1: Site-Fix ディレクトリのファイルを読み込む

- `Site-Fix/Cursor-Instructions.md` （ツールの使い方）
- `Site-Fix/generate_site_guide.py` （生成スクリプト）
- `Site-Fix/config_sample.yaml` （config.yamlの書き方）

### Step 2: サイト構造を把握

- `app/components/shared/Header.tsx` → ナビゲーション順でページ順を決定
- `app/components/shared/Footer.tsx` → フッター内容を把握

### Step 3: 各ページの構造を確認

- 各ページの `page.tsx` を読み、コンポーネントの並び順を把握
- 各コンポーネント `.tsx` を読み、テキスト要素を抽出

### Step 4: config.yaml を作成（必ず新規作成・ターミナル経由で書き込み）

**🚨 重要: 既存の config.yaml があっても、必ず現在のサイトファイルから新規作成する**

**🚨 ファイル書き込みは必ずターミナルコマンド（`cat > Site-Fix/config.yaml << 'EOF'`）を使用する**
- Cursorのwriteツールはファイルシステムと同期しない場合があるため、ターミナルコマンドで直接書き込む
- 既存の `Site-Fix/config.yaml` は上書きする
- 現在の `.tsx` ファイルからテキスト要素を抽出して作成
- config_sample の形式に従う

**書き込み方法:**
```bash
cat > Site-Fix/config.yaml << 'EOF'
# ここにconfig.yamlの内容を記載
site_name: "SITE_NAME"
# ...
EOF
```

### Step 5: Excelファイルを生成（既存ファイル対応）

1. `Site-Fix/input/` に既存の `.xlsx` ファイルがあるか確認
2. **既存ファイルがある場合:**
   - そのExcelファイルを開く
   - 「サイト構成ガイド_YYYYMMDD_HHMMSS」という新しいシートを**一番左（先頭）**に追加
   - 既存のシートは削除せず保持
   - 新しいシートにサイト構成ガイドの内容を書き込む
3. **既存ファイルがない場合:**
   - 新規Excelファイルを `Site-Fix/input/` に作成

### Pythonスクリプト（既存ファイル対応版）

```python
import openpyxl
import os
import glob
from datetime import datetime
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side

# 既存ファイルを検索
input_dir = 'Site-Fix/input'
existing_files = glob.glob(os.path.join(input_dir, '*.xlsx'))
existing_files = [f for f in existing_files if not os.path.basename(f).startswith('~$')]

# タイムスタンプを生成
timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
sheet_name = f"サイト構成ガイド_{timestamp}"

if existing_files:
    # 既存ファイルを開く（最新のもの）
    existing_files.sort(key=os.path.getmtime, reverse=True)
    filepath = existing_files[0]
    wb = openpyxl.load_workbook(filepath)
    
    # 新しいシートを作成し、一番左に移動（既存シートは保持）
    ws = wb.create_sheet(sheet_name, 0)
else:
    # 新規ファイルを作成
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "サイト構成ガイド"
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filepath = os.path.join(input_dir, f'site_guide_{timestamp}.xlsx')

# シートにサイト構成ガイドの内容を書き込む
# ... (generate_site_guide.py の内容と同様)

wb.save(filepath)
```

## Config.yaml の作成ルール

- `site_name`: 英数字のみ（ファイル名に使用）
- `common_sections`: ヘッダー・フッター（全ページ共通）
- `pages`: 各ページの定義（Header.tsx のナビ順に従う）
  - `name`: ページ名
  - `sections`: セクション一覧（page.tsx の並び順に従う）
    - `name`: セクション名
    - `content`: 内容（テキスト）

## Content の記載ルール

- 【セクション名】で始める
- 見出し、説明文、ボタンを改行区切りで記載
- ボタン・リンクは ► を先頭につける
- 箇条書きは ・ を使用
- サブセクションは ■ を使用

## Execution Example

**User:** `/excel-guide`

**AI Action:**
```
[Step 1] Site-Fix ディレクトリのファイルを読み込み
  ✅ README、スクリプト、サンプル確認

[Step 2] サイト構造を把握
  ✅ Header.tsx → ナビ順確認
  ✅ Footer.tsx → フッター内容確認

[Step 3] 各ページの構造を確認
  ✅ home/page.tsx → セクション順確認
  ✅ 各コンポーネント → テキスト抽出

[Step 4] config.yaml を作成
  ✅ Site-Fix/config.yaml 生成

[Step 5] Excelファイルを生成
  ✅ Site-Fix/input/ に既存ファイルあり → シート追加
  または
  ✅ Site-Fix/input/ に新規ファイル作成

✅ サイト構成ガイドのExcel生成が完了しました！
```

## Notes

- 既存Excelファイルがある場合は、新しいシートを**一番左（先頭）**に追加
- シート名にはタイムスタンプを付与（例：`サイト構成ガイド_20251128_160000`）
- 既存のシートは削除せず保持（履歴として残る）
- 既存ファイルがない場合は新規作成
- **config.yaml の書き込みは必ずターミナルコマンド（`cat > ... << 'EOF'`）を使用すること**
  - Cursorのwriteツールはファイルシステムと同期しない場合がある
  - ターミナルコマンドなら確実にディスクに書き込まれる
