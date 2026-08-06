# Image Download

選定した画像を Google Drive からダウンロードします（Step 3 + Step 4 専用コマンド）。

## Context Files

- `memories/image_fetch_workflow.yaml` （v2.1.0 - Step 3 & Step 4 セクション）
- `.cursor/rules/workflows.md` （Image Fetch Workflow セクション）
- `scripts/selected.json` （必須）

## Prerequisites

**このコマンドを実行する前に:**

1. ✅ `/image-fetch-list` で画像リストを取得済み
2. ✅ `/image-select` で画像を選定済み
3. ✅ `scripts/selected.json` が存在する

## Instructions

**このコマンドは Step 3（画像ダウンロード）+ Step 4（履歴記録）を実行します。**

1. **🚨 CRITICAL: 必ず以下のファイルを読み込む:**
   - `memories/image_fetch_workflow.yaml` の Step 0, Step 3, Step 4 セクション
   - `scripts/selected.json` （ダウンロード対象の画像リスト）

2. **OS選択（Step 0 で選択したOSを再確認）**

3. **ダウンロード実行（1コマンド）**

4. **ダウンロード履歴の記録（自動）**
   - 初回: `selected.json` を `prev_selected.json` にコピー
   - 2回目以降: 既存履歴とマージして更新

## Workflow

### Step 0: OS確認（CRITICAL）
- ユーザーのOSを確認（Mac または Windows）
- OS に応じたコマンドを使用

### Step 3: ダウンロード実行（CRITICAL）
- `selected.json` に基づいて、Google Drive から画像を一括ダウンロード
- run_terminal_cmd で **1コマンド**を実行
- photos と backgrounds を同時にダウンロード
- `public/img/photos/` と `public/img/backgrounds/` に保存

### Step 4: ダウンロード履歴の記録（AUTOMATIC）
- ダウンロード後、自動的に履歴を記録
- `scripts/prev_selected.json` の存在を確認
  - **存在しない（初回）:** `cp scripts/selected.json scripts/prev_selected.json`
  - **存在する（2回目以降）:** マージコマンドで既存履歴と統合
- これにより、次回の画像選定時に重複を自動回避

## Output Directories

- `public/img/photos/` - 写真ファイル
- `public/img/backgrounds/` - 背景ファイル

## Output Files

- `scripts/prev_selected.json` - ダウンロード履歴（累積記録）

## Validation

ダウンロード完了後、以下を確認:

1. ✅ `public/img/photos/` に画像ファイルが存在する
2. ✅ `public/img/backgrounds/` に画像ファイルが存在する
3. ✅ ダウンロード数が `selected.json` の件数と一致
4. ✅ `scripts/prev_selected.json` が作成または更新されている

## Output

ダウンロード完了時の出力例:

**初回実行:**
```
✅ 画像のダウンロードが完了しました！

保存先:
- public/img/photos/ （5件）
- public/img/backgrounds/ （3件）

✅ ダウンロード履歴を記録しました（初回）

記録ファイル: scripts/prev_selected.json
- Photos: 5件
- Backgrounds: 3件

💡 次のステップ:
ダウンロードした画像をコンポーネントで使用できます。
```

**2回目以降:**
```
✅ 画像のダウンロードが完了しました！

保存先:
- public/img/photos/ （5件）
- public/img/backgrounds/ （3件）

✅ ダウンロード履歴を更新しました

記録ファイル: scripts/prev_selected.json
累計: 20件
- Photos: 15件
- Backgrounds: 5件

💡 次のステップ:
ダウンロードした画像をコンポーネントで使用できます。
```

## Execution Example

**User:** `/image-download`

**AI Action:**
```
[必須ファイルを読み込む]
✅ memories/image_fetch_workflow.yaml (Step 0, Step 3, Step 4)
✅ scripts/selected.json

[Step 0] OS確認
AI: 使用しているOSを教えてください: Mac または Windows
User: Mac

[Step 3] ダウンロード実行（1コマンド）
  → Mac版コマンド実行（photos + backgrounds 一括）
  → DRIVE_IMG_FOLDER_ID="1poeKyfUs85CqmPv5Tg6-aoWQs2cQiYPL" で photos をダウンロード
  → DRIVE_IMG_FOLDER_ID="1Dq5z-ct5w5QF8_xSM5RRjyksvwdnKZyw" で backgrounds をダウンロード
  ✅ public/img/photos/ に保存
  ✅ public/img/backgrounds/ に保存

✅ 画像のダウンロードが完了しました！

保存先:
- public/img/photos/ （5件）
- public/img/backgrounds/ （3件）

[Step 4] ダウンロード履歴の記録（自動）
  → scripts/prev_selected.json の存在確認
  → 存在しない（初回）
  → cp scripts/selected.json scripts/prev_selected.json 実行

✅ ダウンロード履歴を記録しました（初回）

記録ファイル: scripts/prev_selected.json
- Photos: 5件
- Backgrounds: 3件
```

## Error Handling

**エラーが発生した場合:**

### Error 1: selected.json が存在しない
```
❌ scripts/selected.json が見つかりません

解決策:
まず `/image-select` を実行して画像を選定してください。
```

### Error 2: selected.json の形式が不正
```
❌ scripts/selected.json の形式が不正です

解決策:
`/image-select` を再実行して、正しい形式で selected.json を生成してください。
```

### Error 3: ファイル名が見つからない
```
❌ 指定されたファイルが Google Drive に見つかりません

原因:
- selected.json のファイル名が photos_index.json/backgrounds_index.json と一致していない
- ファイル名が推測・構築されている可能性

解決策:
`/image-select` を再実行して、ファイル名を完全一致でコピーしてください。
```

## Important Notes

- このコマンドは**画像ダウンロード + 履歴記録**を行います
- 画像選定は含まれません（`/image-select` で実行）
- OS選択は毎回確認します（セッションをまたぐ場合があるため）
- ダウンロード後、自動的に `prev_selected.json` を作成または更新します
- 次回の `/image-select` 実行時に、`prev_selected.json` を参照して重複選定を自動回避します

