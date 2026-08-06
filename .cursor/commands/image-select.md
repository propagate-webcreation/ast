# Image Select

AI対話形式で画像を選定します（Step 2 専用コマンド）。

## Context Files

- `memories/image_fetch_workflow.yaml` （v2.1.0 - Step 2 セクション）
- `.cursor/rules/workflows.md` （Image Fetch Workflow セクション）
- `scripts/photos_index.json` （必須）
- `scripts/backgrounds_index.json` （必須）
- `scripts/prev_selected.json` （存在する場合のみ、重複防止用）

## Instructions

**🚨 重要: このコマンドは Step 2（AI対話形式での画像選定 + 重複チェック）のみを実行します。**

1. **🚨 CRITICAL: 必ず以下のファイルを読み込む（読まずに実行することは禁止）:**
   - `memories/image_fetch_workflow.yaml` の Step 2 セクション（critical_rules を含む）
   - `scripts/prev_selected.json` （存在する場合は読み込み、重複回避用）

2. **重複チェック（最初のステップ）:**
   - **scripts/prev_selected.json の存在を確認**
   - **存在する場合:** ファイルを読み込み、既存ファイルを除外
   - **存在しない場合:** 初回選定なので除外なし

3. **画像を順番に閲覧する方式:**
   - **❌ 禁止: grep検索で絞り込むこと**
   - **✅ 必須: read_file の offset/limit で順番に全て閲覧**
   - **動的分割**: 1回250枚ずつ、必要な回数だけ繰り返す
   - 計算式: `総行数 ÷ 250 = 必要回数（切り上げ）`
   - 例: 935行 ÷ 250 = 3.74 → 4回必要

4. **AIとユーザーの対話を開始:**
   - AIが質問: 「どのような画像を選定しますか？」
   - ユーザーの回答を待つ
   - 回答に基づいて画像を選定（**prev_selected.json に含まれるファイルは除外**）

5. **必須ルールに従って選定・検証を実行**

## AI の役割

### 0. 重複チェック（最初のステップ）
**画像選定前に必ず実行:**

1. `scripts/prev_selected.json` の存在を確認
2. **存在する場合:**
   - ファイルを読み込む
   - `prev_selected.json.photos` および `prev_selected.json.backgrounds` を確認
   - これらに含まれるファイル名は**絶対に選定しない**
3. **存在しない場合:**
   - 初回選定なので除外対象なし

### 1. ユーザーに質問
**必ず以下の質問から開始:**

```
どのような画像を選定しますか？

例:
- about.yaml の要件に合う写真をお願いします
- 〇〇セクションに合うような画像
- ヒーローセクション用の画像を選んでください
- design.yaml に基づいて背景素材を選定してください
```

### 2. ユーザーの回答を受けて選定実行

ユーザーの要件に基づいて、以下の必須ルールに従って画像を選定します。

## ⚠️ CRITICAL RULES（絶対に守らなくてはいけないルール）

**これらのルールを守らないと、次の `/image-download` コマンドがエラーします。**

### Rule 0: 重複防止（prev_selected.json確認）
1. **scripts/prev_selected.json の存在を確認する**
2. **存在する場合:**
   - prev_selected.json を読み込む
   - prev_selected.json.photos に含まれるファイル名は絶対に選定しない
   - prev_selected.json.backgrounds に含まれるファイル名は絶対に選定しない
   - これにより、過去にダウンロード済みの画像の重複選定を防止する
3. **存在しない場合:**
   - 初回選定なので除外対象なし
   - 通常通り選定を進める

**重要性:**
- 同じ画像を二重にダウンロードすることを防ぐ
- ストレージの無駄遣いを防止
- prev_selected.json の有無で初回か2回目以降かを自動判定できる

### Rule 1: ファイル名の完全一致
1. **順番に全て閲覧する（grep検索禁止）:**
   - **動的に分割読み込み**: 1回250行、総行数に応じて必要回数を計算
   - 手順:
     1. ファイルの総行数を確認（例: 935行）
     2. 必要回数を計算: `ceil(総行数 ÷ 250)`（例: ceil(935÷250) = 4回）
     3. 各バッチで読み込み:
        - Batch 1: offset=1,           limit=250
        - Batch 2: offset=251,         limit=250
        - Batch 3: offset=501,         limit=250
        - Batch N: offset=(N-1)*250+1, limit=250 or 残り行数
2. 配列の各要素（ファイル名）を**1文字も変更せず、そのままコピー**して選定する
3. **grep検索で絞り込むことは絶対禁止**（重要な写真を見落とす原因）
4. 選定後、各ファイル名が元のJSONに存在するか**再確認**する

### Rule 2: 除外条件
- ファイル名に「`, `」（カンマ+スペース）を含むものは選ばない
- ファイル名に特殊文字（カンマ、セミコロン等）を含むものは避ける
- **scripts/prev_selected.json に既に含まれるファイル名は選ばない**（重複防止）

### Rule 3: 出力形式（JSON構造）
- **構造化JSON形式**で `scripts/selected.json` として保存
- 既存の `selected.json` が存在する場合は読み込み、**該当キーのみ更新**
- 他のキー（photos, backgrounds, illusts）はそのまま保持
- 各ファイル名は拡張子込みで完全一致
- **説明やコードブロック、コメントは一切付けない**

**出力例:**
```json
{
  "photos": ["選定した写真1.jpeg", "選定した写真2.jpeg"],
  "backgrounds": ["選定した背景1.png"],
  "illusts": []
}
```

### Rule 4: 検証手順（必須）
選定完了後、選んだファイル名が `photos_index.json` または `backgrounds_index.json` に実在することを**grep完全一致検索（-F オプション）で1件ずつ確認**してから保存する。

## Background Filename Pattern

背景ファイルは以下の形式で命名されています：

```
bg--vibe--pattern_type--repeatability--palette--brightness--contrast--busyness--gradient_axis--size.拡張子
```

**例:** `bg--simple--gradient--non-tile--warm--light--mid--calm--vertical--1920x1080.png`

- vibe: シンプル
- pattern_type: グラデーション
- repeatability: タイル不可
- palette: 暖色系
- brightness: 明るい
- contrast: 中程度のコントラスト
- busyness: 落ち着いた
- gradient_axis: 縦方向
- size: 1920x1080

## Validation After Selection

選定完了後、以下を確認:

1. ✅ `scripts/selected.json` が作成されている
2. ✅ 正しいJSON形式か確認（パースエラーがないか）
3. ✅ photos, backgrounds, illusts キーが存在する
4. ✅ 各ファイル名が元のJSONに完全一致で存在する

## Output

選定完了時の出力例:

```
✅ scripts/selected.json の生成を確認しました

選定された画像:
- Photos: 5件
- Backgrounds: 3件

次のステップ:
画像をダウンロードするには `/image-download` を実行してください。
```

## Next Step

画像選定完了後、以下のコマンドで画像をダウンロードしてください：

```
/image-download
```

## Execution Example

**User:** `/image-select`

**AI Action:**
```
[必須ファイルを読み込む]
✅ memories/image_fetch_workflow.yaml (Step 2)

[重複チェック]
scripts/prev_selected.json の存在確認
  → 存在しない → 初回選定なので除外なし
  → 存在する → 既存ファイルを読み込み、重複を除外

[AI が質問]
どのような画像を選定しますか？

例:
- about.yaml の要件に合う写真をお願いします
- 〇〇セクションに合うような画像
- ヒーローセクション用の画像を選んでください
```

**User:** `about.yaml の要件に合う写真をお願いします`

**AI Action:**
```
[ユーザーの要件を受けて選定開始]
  → scripts/prev_selected.json を確認（存在する場合は読み込み）
  → about.yaml を読み込む
  
  → photos_index.json を順番に閲覧開始（grep検索は使用しない）
  
  [総行数確認] 935行
  [必要回数計算] ceil(935 ÷ 250) = 4回
  
  [Batch 1/4] offset=1, limit=250 → 1-250行目
    → 要件に合う写真をピックアップ
  
  [Batch 2/4] offset=251, limit=250 → 251-500行目
    → 要件に合う写真をピックアップ
  
  [Batch 3/4] offset=501, limit=250 → 501-750行目
    → 要件に合う写真をピックアップ
  
  [Batch 4/4] offset=751, limit=185 → 751-935行目（残り185行）
    → 要件に合う写真をピックアップ
  
  → backgrounds_index.json を全て読み込み（58行）
    read_file(scripts/backgrounds_index.json)
    → 要件に合う背景を選定
  
  → prev_selected.json に含まれないファイルのみを選定（重複回避）
  → 必須ルールに従ってファイル名を完全一致でコピー
  → scripts/selected.json に保存
  → grep -F で完全一致確認

✅ scripts/selected.json の生成を確認しました

選定された画像:
- Photos: 15件
- Backgrounds: 5件

次のステップ:
画像をダウンロードするには `/image-download` を実行してください。
```

## Important Notes

- このコマンドは**画像選定のみ**を行います
- ダウンロードは含まれません（`/image-download` で実行）
- 必須ルールを守らないと次のステップでエラーが発生します
- 手を抜かず、丁寧に選定してください

