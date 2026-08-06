# domain-connect スクリプト化と n8n 連携ガイド

他の AI エージェントが n8n ノードを作成する際の参照用ドキュメントです。

---

## 1. 背景・目的

### 元の仕組み
- Cursor の `/domain-connect` コマンドは、ドメイン接続用の `vercel.json` を生成する
- このコマンドは Cursor のチャット内でしか実行できない（外部 API なし）

### 実現したいこと
- **n8n から domain-connect の処理を実行したい**
- Cursor を開かず、自動化フローで `vercel.json` を生成したい

### 解決策
- domain-connect の **vercel.json 生成部分のみ** を Node.js スクリプトに切り出した
- スクリプトは n8n の Execute Command ノードから実行可能

---

## 2. 実装済みの内容

### 2-1. スクリプトの場所
```
scripts/domain-connect.js
```

### 2-2. スクリプトの処理内容
1. `memories/connect_domain.yaml` を読み込む
2. 正規表現で `APEX_DOMAIN` と `WWW_DOMAIN` を抽出（YAML 全体パースは行わない）
3. ドメインを正規化（プロトコル除去・末尾スラッシュ除去・小文字化）
4. `vercel.json` を生成し、プロジェクトルートに書き込む
5. 結果を JSON 形式で標準出力する

### 2-3. 入力元
- **ファイル**: `memories/connect_domain.yaml`
- **抽出対象**: `domain_config` セクション内の以下の行
  ```yaml
  APEX_DOMAIN: "example.jp"           # wwwなし（購入ドメイン）
  WWW_DOMAIN: "www.example.jp"        # wwwあり（正規側）
  ```
- 正規表現で `APEX_DOMAIN:\s*["']([^"']+)["']` と `WWW_DOMAIN:\s*["']([^"']+)["']` にマッチする値を取得

### 2-4. 出力
- **ファイル**: プロジェクトルートの `vercel.json`
- **標準出力**: `{"success":true,"apex":"example.jp","www":"www.example.jp","output":"絶対パス"}`

### 2-5. npm スクリプト
- **package.json** の `scripts` に以下が登録済み:
  ```json
  "domain-connect": "node scripts/domain-connect.js"
  ```

---

## 3. 実行方法

### 手動実行（ターミナル）
```bash
# プロジェクトルートで実行
npm run domain-connect
```
または
```bash
node scripts/domain-connect.js
```

### 実行時の前提条件
- **作業ディレクトリ**: プロジェクトルート（`DefaultSetting-1` など）であること
- **必須ファイル**: `memories/connect_domain.yaml` が存在すること
- **Node.js**: プロジェクトの `node_modules` がインストール済みであること（本スクリプトは js-yaml に依存しない）

---

## 4. n8n でのノード作成手順

### 4-1. 前提
- n8n がプロジェクトと同じマシンで動いている、またはプロジェクトディレクトリにアクセスできる
- プロジェクトの絶対パス例: `C:\Users\takato.s\propagate\DefaultSetting-1`（Windows）

### 4-2. Execute Command ノードの設定

| 設定項目 | 値 |
|----------|-----|
| **ノードタイプ** | Execute Command |
| **Command** | `node scripts/domain-connect.js` |
| **Working Directory** | `C:\Users\takato.s\propagate\DefaultSetting-1`（プロジェクトルートの絶対パス） |

### 4-3. Windows の場合の Command 例
```
node scripts/domain-connect.js
```
- `cd` は不要（Working Directory で指定するため）
- PowerShell の場合、Working Directory が正しく設定されていれば上記で動作する

### 4-4. Linux / macOS の場合
```
node scripts/domain-connect.js
```
- Working Directory をプロジェクトルートの絶対パスに設定

### 4-5. 出力の利用
- スクリプトは標準出力に JSON を出力する
- n8n では `$json.success`、`$json.apex`、`$json.www` などで参照可能
- 成功時: `success: true`
- 失敗時: スクリプトは `process.exit(1)` で終了し、標準エラーにメッセージを出力

---

## 5. フロー例（n8n）

```
[トリガー] → [Execute Command] → [IF] → [成功時: 通知など]
                      ↓
              失敗時: エラー通知
```

### Execute Command ノードの詳細設定
- **Command**: `node scripts/domain-connect.js`
- **Working Directory**: プロジェクトルートの絶対パス
- **Options**: 特になし

### 成功判定
- 前ノードの出力に `success: true` が含まれるか、終了コードが 0 かで判定

---

## 6. 案件ごとのドメイン変更

スクリプトは YAML を読み込むため、**実行前に** `memories/connect_domain.yaml` を編集する必要がある。

```yaml
domain_config:
  APEX_DOMAIN: "example.jp"      # ← 案件のドメインに変更
  WWW_DOMAIN: "www.example.jp"   # ← 案件のドメインに変更
```

- n8n から実行する場合、YAML の編集は手動または別フローで行う
- コマンドライン引数でドメインを上書きする機能は **未実装**

---

## 7. 注意事項・制限

| 項目 | 内容 |
|------|------|
| SEO 情報生成 | 含まれていない（vercel.json 生成のみ） |
| 日本語ドメイン（IDN） | 未対応。ASCII ドメインのみ |
| 既存 vercel.json | 上書きされる |
| 複数プロジェクト | 各プロジェクトでスクリプトを実行する必要がある。Working Directory をプロジェクトごとに変更 |

---

## 8. ファイル構成（参照用）

```
DefaultSetting-1/
├── memories/
│   ├── connect_domain.yaml    # ドメイン設定（APEX_DOMAIN, WWW_DOMAIN）
│   └── domain-connect-n8n-flow.md  # 本ドキュメント
├── scripts/
│   └── domain-connect.js      # 実行スクリプト
├── package.json              # "domain-connect" スクリプト登録済み
└── vercel.json               # スクリプト実行時に生成される
```

---

## 9. トラブルシューティング

| 現象 | 原因 | 対処 |
|------|------|------|
| `memories/connect_domain.yaml が見つかりません` | 作業ディレクトリがプロジェクトルートでない | Working Directory をプロジェクトルートに設定 |
| `APEX_DOMAIN または WWW_DOMAIN が設定されていません` | YAML に該当行がない、または形式が異なる | `APEX_DOMAIN: "xxx"` 形式で記述されているか確認 |
| `node` コマンドが見つからない | Node.js がパスに含まれていない | n8n の実行環境に Node.js をインストールし、パスを通す |

---

## 10. 変更履歴

- 2025-02-24: 初版作成。YAML パースを正規表現に変更（connect_domain.yaml の構文エラー回避）
