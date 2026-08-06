# /spreadsheet-form-api — フォーム送信内容を Google スプレッドシートに保存

お問い合わせフォームの送信内容を、メール通知だけでなく **Google スプレッドシートにも自動で1行ずつ追記**できるようにするコマンド。

> **このコマンドは、すでに動いているお問い合わせフォームに対して「スプシ転記機能」を後付けするためのものです。**
> 単独で実行しても、フォーム本体（`app/contact/page.tsx`）が無ければ動きません。
> まずは送信→メール通知が動く状態のフォームを用意した上で、このコマンドを使ってください。

---

## このコマンドでできること（要約）

1. `app/api/contact/route.ts` を作成（POST を受けて Google Sheets に書き込む API）
2. フォームの送信成功後に `fetch('/api/contact', ...)` を呼ぶよう、フォームコードを修正
   - **v3.0.0（Server Action 方式）**: `handleSubmit` 内で `submitContactForm()` の戻り値が `ok: true` のときに追記
   - **v2.0.0（旧 form-handler.js 方式）**: `FormHandler.init({ onSuccess: ... })` の `onSuccess` 内に追記
3. `.env.example` にスプシ用の環境変数の説明を追記
4. **初回送信時のみ** 1行目に列タイトル（`name` / `email` / `phone` 等）、2行目に1件目データを書き込み
5. **2件目以降は最下行に追記**

完成後の動き：

```
ユーザーがフォームを送信
   ↓
[既存] UFA に送信 → 管理者にメール通知    ← フォーム本体（Server Action または form-handler.js）
   ↓ (送信成功時のみ)
[新規] POST /api/contact   → Google スプシに1行追記   ← このコマンドで追加
```

> 💡 **このコマンドは UFA 経由のメール通知とは独立して動く別系統の処理です**。
> スプシ書き込みが失敗してもメール通知には影響しません。逆も同様です。

---

## 実行手順

### STEP 0 — 前提チェック（実行前に必ず確認）

以下が**すべて満たされている**ことを確認してください。

| チェック項目 | 確認方法 |
|---|---|
| ✅ お問い合わせフォーム本体が存在する | `app/contact/page.tsx` が存在し、送信処理が実装済み |
| ✅ ローカルでフォーム送信→メール通知が動いている | `npm run dev` → `/contact` から実送信して通知メール到達を確認 |
| ✅ `.env.local` がプロジェクトルートに存在する | エディタで開いて確認（無い場合は新規作成可） |

> ⚠️ お問い合わせフォーム本体が未実装の場合は、**先にフォーム本体を完成させてから**このコマンドを使ってください（`/form-implement` を先に実行）。

#### フォーム実装方式の自動判定

AI は以下のシグナルから、フォームが v2 と v3 のどちらで実装されているかを判定します。

| 方式 | 判別シグナル | スプシ呼び出しを差し込む場所 |
|---|---|---|
| **v3.0.0（Server Action）** | `app/actions/submit-contact.ts` が存在、または `app/contact/page.tsx` が `submitContactForm` を import している | `handleSubmit` 内、`result.ok` が `true` の分岐 |
| **v2.0.0（form-handler.js）** | `app/contact/page.tsx` に `FormHandler.init` の呼び出しがある、または `<Script src="...form-handler.js" />` が読み込まれている | `FormHandler.init({ onSuccess: ... })` の `onSuccess` コールバック内 |
| **不明** | 上記いずれにも該当しない | ユーザーに確認 |

---

### STEP 1 — Google 側の準備（**人が手動で実施**）

このステップが**最も詰まりやすいポイント**です。落ち着いて1つずつ進めてください。

#### 1-1. スプレッドシートを作成し、タブ名を決める

1. [Google スプレッドシート](https://docs.google.com/spreadsheets/) で新規スプレッドシートを作成
2. 左下のタブ（シート名）をダブルクリックして、**任意の名前**にリネーム
   - 例: `フォーム送信` / `問い合わせ` / `送信ログ`
3. **タブ名をメモしておく**（このあとコマンド実行時に使います）

> ⚠️ タブ名は**1文字でもズレると転記が失敗します**。スペース・全角半角・記号も含めて完全一致が必須。

#### 1-2. スプレッドシート ID をメモする

URL の `/d/` と `/edit` の間が ID です。

```
https://docs.google.com/spreadsheets/d/  1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890  /edit
                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                                  これが SPREADSHEET_KEY
```

#### 1-3. Google Cloud でサービスアカウントを作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 上部のプロジェクト選択 → **「新しいプロジェクト」**
   - プロジェクト名: 任意（例: `form-spreadsheet`）
3. 左メニュー → **「APIとサービス」** → **「ライブラリ」**
4. 検索欄に `Google Sheets API` → 開いて **「有効にする」** をクリック
5. 左メニュー → **「APIとサービス」** → **「認証情報」**
6. 上部 **「+ 認証情報を作成」** → **「サービスアカウント」**
   - サービスアカウント名: 任意（例: `form-writer`）
   - **「作成して続行」**
   - ロール: 設定不要（スキップ）
   - **「完了」**
7. 作成したサービスアカウントの行をクリック
8. **「キー」タブ** → **「鍵を追加」** → **「新しい鍵を作成」**
9. キーのタイプ: **JSON** → **「作成」**
10. **JSON ファイルが自動ダウンロードされます**（あとで `.env.local` に貼り付けます）

#### 1-4. スプレッドシートをサービスアカウントに共有

1. ダウンロードした JSON ファイルを開き、`"client_email"` の値（`xxx@xxx.iam.gserviceaccount.com` のような文字列）をコピー
2. 1-1 で作成したスプレッドシートを開き、右上の **「共有」** をクリック
3. コピーしたメールアドレスを貼り付け
4. 権限を **「編集者」** に設定 → **「送信」**

> ⚠️ ここを忘れると `403 Permission denied` エラーで転記が失敗します。

---

### STEP 2 — コマンドを実行（AI に依頼）

Cursor のチャットに以下のように入力します。

```
/spreadsheet-form-api タブ名は "フォーム送信"
```

タブ名は STEP 1-1 で決めた名前を `"..."` で囲んで指定してください。

| 入力例 | 抽出されるタブ名 |
|---|---|
| `タブ名は "フォーム送信"` | フォーム送信 |
| `タブ名は '問い合わせ'` | 問い合わせ |
| `タブ名は 送信ログ`（クォート省略） | 送信ログ |

#### このとき AI が自動でやること

| # | 作業 | 出力先 |
|---|---|---|
| 1 | `googleapis` パッケージをインストール | `npm install googleapis` |
| 2 | `app/api/contact/route.ts` を新規作成（既にあればタブ名のみ更新） | 新規ファイル |
| 3 | フォーム実装方式（v2 / v3）を判定し、送信成功後に `fetch('/api/contact', ...)` が呼ばれるよう修正 | `app/contact/page.tsx`（v3 の場合は `handleSubmit` 内、v2 の場合は `onSuccess` 内） |
| 4 | `.env.example` にスプシ用変数の説明を追記 | 既存ファイル修正 |
| 5 | 完了報告と「人がやるべき次の手順」を提示 | チャット |

#### v3.0.0（Server Action 方式）の場合の挿入イメージ

```tsx
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setIsSubmitting(true);
  
  const form = e.currentTarget;
  const fd = new FormData(form);
  const payload = {
    name: String(fd.get("name") ?? ""),
    email: String(fd.get("email") ?? ""),
    phone: String(fd.get("phone") ?? ""),
    message: String(fd.get("message") ?? ""),
  };
  
  const result = await submitContactForm(payload);
  setIsSubmitting(false);

  if (result.ok) {
    // ✅ ここに /api/contact 呼び出しを追加（スプシ書き込み）
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((err) => {
      // スプシ書き込み失敗はメール通知の成否に影響させない
      console.error("[spreadsheet sync] failed:", err);
    });

    setStatus({ type: "success", message: "送信完了しました。" });
    form.reset();
  } else {
    setStatus({ type: "error", message: result.message });
  }
}
```

> 💡 **`.catch()` で握りつぶす理由**: メール通知は既に成功しているので、スプシ書き込みが落ちてもユーザーに「送信失敗」と見せたくないため。失敗はコンソールログだけに残す。

#### v2.0.0（旧 form-handler.js 方式）の場合の挿入イメージ

```tsx
(window as any).FormHandler.init("site_id", token, {
  apiBaseUrl: "https://universal-form-api.vercel.app",
  beforeSend: (data) => { /* sanitize */ },
  onSuccess: (response) => {
    // ✅ ここに /api/contact 呼び出しを追加
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    }).catch((err) => console.error(err));
    // 既存の成功処理（リセット、メッセージ表示など）
  },
  onError: (err) => { /* ... */ },
});
```

---

### STEP 3 — 環境変数を `.env.local` に追記（**人が手動で実施**）

プロジェクトルートの `.env.local` を開き、**末尾に以下の2行を追加**します。

```bash
# Google スプレッドシート連携
GOOGLE_SPREADSHEET_API='<STEP 1-3 でダウンロードした JSON ファイルの中身を1行に貼り付け>'
SPREADSHEET_KEY=<STEP 1-2 でメモしたスプレッドシート ID>
```

#### `GOOGLE_SPREADSHEET_API` の貼り付け方（重要）

ダウンロードした JSON ファイルをエディタで開くと、こんな複数行の内容になっています：

```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n",
  ...
}
```

これを**`.env.local` に貼り付けるときは、シングルクォート `'...'` で囲んで全体を1行にする**のが安全です。

```bash
# ✅ シングルクォートで囲む（中身の改行は \n のまま残してOK）
GOOGLE_SPREADSHEET_API='{"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n",...}'

# ❌ ダブルクォートだと中身の " と衝突して壊れる
GOOGLE_SPREADSHEET_API="{"type":"service_account",..."

# ❌ 改行をそのまま残すと .env として読み取れない
GOOGLE_SPREADSHEET_API={
  "type": "service_account",
  ...
}
```

#### 設定後の `.env.local` のイメージ

```bash
GOOGLE_SPREADSHEET_API='{"type":"service_account",...}'
SPREADSHEET_KEY=1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

---

### STEP 4 — ローカルでテスト送信

```bash
# 開発サーバーを再起動（環境変数の変更を反映するため必須）
npm run dev
```

ブラウザで `http://localhost:3000/contact` を開き、フォームから1件送信してください。

#### 確認ポイント

1. ✅ **管理者宛のメール通知が届く**（既存動作に影響がないことを確認）
2. ✅ **スプレッドシートの 1 行目に列タイトル**（`name` / `email` / `phone` 等）が入っている
3. ✅ **2 行目に1件目のデータ**が入っている
4. もう 1 件送信して、**3 行目に追記される**ことを確認

---

### STEP 5 — 本番反映（Vercel）

#### 5-1. コードを push

```bash
git add .
git commit -m "Add Google Spreadsheet form sync"
git push origin main
```

#### 5-2. Vercel に環境変数を追加

1. Vercel ダッシュボード → 該当プロジェクト → **Settings** → **Environment Variables**
2. 以下の **2つ** を追加（既存の環境変数はそのまま残す）

| Key | Value | Environment |
|---|---|---|
| `GOOGLE_SPREADSHEET_API` | `.env.local` と同じ JSON 1行 | Production / Preview / Development |
| `SPREADSHEET_KEY` | `.env.local` と同じスプレッドシート ID | Production / Preview / Development |

3. Vercel 上で **Redeploy** を実行（環境変数の反映には再デプロイが必要）
4. 本番 URL の `/contact` から実送信して、スプシに転記されることを確認

---

## 役割分担まとめ

### AI が自動でやること

| カテゴリ | 内容 |
|---|---|
| パッケージ | `npm install googleapis` の実行 |
| API ルート | `app/api/contact/route.ts` の新規作成・タブ名更新 |
| 実装方式判定 | フォームが v3（Server Action）か v2（form-handler.js）かを自動判定 |
| フォーム接続 | 送信成功時に `fetch('/api/contact', ...)` が呼ばれるよう挿入（v3: `handleSubmit` 内、v2: `onSuccess` 内） |
| 環境変数の説明 | `.env.example` への追記 |
| ロジック | 1行目に列タイトル → 2行目以降にデータ追記、JST タイムスタンプ付与 |

### 人が手動でやること

| カテゴリ | 内容 | やる場所 |
|---|---|---|
| スプシ作成 | スプレッドシート作成、タブ名設定、ID 取得 | Google スプレッドシート |
| GCP 設定 | プロジェクト作成、Sheets API 有効化、サービスアカウント作成、JSON キーDL | Google Cloud Console |
| 共有設定 | スプシをサービスアカウントに「編集者」権限で共有 | Google スプレッドシート |
| 環境変数 | `.env.local` に `GOOGLE_SPREADSHEET_API` と `SPREADSHEET_KEY` を追記 | エディタ |
| ローカルテスト | `npm run dev` 再起動 → 実送信 → スプシ確認 | ターミナル＋ブラウザ |
| 本番反映 | `git push` + Vercel に環境変数追加 + Redeploy | ターミナル＋Vercel |

---

## トラブルシューティング

| 症状 | 原因 | 対処 |
|---|---|---|
| `403 Permission denied` | サービスアカウントにスプシの編集権限が無い | STEP 1-4 を実施。`client_email` をコピーしてスプシで「共有」 |
| `Unable to parse range: ○○!A:A` | スプシ側のタブ名と、コマンドで指定したタブ名が一致していない | スプシ下部のタブ名を確認し、半角/全角・スペースまで完全一致させる |
| `error:0909006C:PEM routines:get_name:no start line` | `GOOGLE_SPREADSHEET_API` の改行処理に失敗している | JSON を**1行に圧縮し、シングルクォート `'...'` で囲む**。`private_key` の `\n` はそのまま残す |
| ローカルで動くが本番で失敗 | Vercel に環境変数が登録されていない/Redeploy していない | STEP 5-2 を実施 |
| メールは届くがスプシに記録されない | フォーム送信成功時に `fetch('/api/contact', ...)` が呼ばれていない | **v3**: `app/contact/page.tsx` の `handleSubmit` 内、`result.ok` の分岐に `fetch` 呼び出しがあるか確認 / **v2**: `FormHandler.init({ onSuccess })` の中に `fetch` 呼び出しがあるか確認 |
| スプシ書き込みでフォーム送信全体が失敗する | `await fetch('/api/contact', ...)` で例外が握りつぶされていない | `.catch((err) => console.error(err))` を付けて、スプシ書き込みの失敗がメール通知の成否に影響しないようにする |
| 1行目にデータが書かれて列タイトルが無い | `route.ts` の初回判定（`nextRow === 1`）が壊れている | コマンドを再実行するか、スプシを一度空にして再送信 |
| Next.js が `Module not found: googleapis` で落ちる | パッケージが入っていない | `npm install googleapis` を手動実行 |

---

## AI への指示（Instructions）

> ここから下は、コマンド実行時に AI が参照する内部仕様です。**通常ユーザーは読み飛ばして OK**。

### Context Files

- `memories/spreadsheet_form_api.yaml`（ワークフロー全体・API 仕様・接続手順）
- `app/api/contact/route.ts`（存在する場合は参照・更新）
- お問い合わせフォーム本体（`app/contact/page.tsx` 等）

### 実行手順（スキップ禁止）

1. **🚨 CRITICAL: 必ず以下を読み込む**
   - `memories/spreadsheet_form_api.yaml`
   - お問い合わせフォームがどこにあるか特定（`app/contact/page.tsx`、`ContactForm.tsx` 等）

2. **ユーザー入力からタブ名を解析**
   - `タブ名は "..."` または `タブ名は '...'` 形式から抽出
   - クォートが無い場合はコマンド直後の1単語をタブ名とする
   - 前後の空白はトリム

3. **前提チェック + フォーム実装方式の自動判定**
   - `app/contact/page.tsx` が存在するか
   - フォーム送信処理が実装済みか
   - **🚨 v3 判定**: `app/actions/submit-contact.ts` の存在 / `submitContactForm` の import / `"use server"` ディレクティブ
   - **🚨 v2 判定**: `FormHandler.init` の呼び出し / `<Script src="...form-handler.js" />` / `(window as any).FormHandler` の参照
   - どちらにも該当しない場合はユーザーに確認
   - 不足があれば「先にお問い合わせフォーム本体を完成させてください（`/form-implement` を使用）」と案内して中断

4. **`googleapis` パッケージのインストール**
   - `package.json` に `googleapis` が無ければ `npm install googleapis` を実行

5. **API ルートの作成または更新**
   - `app/api/contact/route.ts` が無ければ新規作成、あればタブ名のみ search_replace で置換
   - `POST` を受け取り、`googleapis` 経由で Google Sheets に追記
   - **初回のみ（`nextRow === 1`）：1 行目に列タイトル（リクエスト body のキー名）、2 行目に1件目データ**
   - 2件目以降は最下行に追記
   - 列構成例: 送信日時(JST), name, email, phone, ...
   - 電話番号は先頭に `'` を付けて文字列として書き込み

6. **フォーム接続（実装方式に応じて挿入位置を切り替え）**

   **v3.0.0（Server Action 方式）の場合:**
   - `app/contact/page.tsx` の `handleSubmit` 内、`submitContactForm()` の戻り値が `ok: true` の分岐に `fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch((err) => console.error(err))` を追記
   - **🚨 重要**: `.catch()` で握りつぶす（メール通知は成功済みなので、スプシ書き込みの失敗をユーザーに見せない）
   - `await` を付けないことを推奨（ユーザー体験を遅延させない）

   **v2.0.0（form-handler.js 方式）の場合:**
   - `FormHandler.init({ onSuccess: (response) => {...} })` の `onSuccess` コールバック内に `fetch('/api/contact', ...)` を追記
   - 同様に `.catch()` で握りつぶす

   **共通:**
   - 既に呼ばれている場合はスキップ（タブ名のみ更新）
   - 送信ペイロードはフォームの `name` 属性に対応するキーで構築

7. **環境変数の説明**
   - `.env.example` に `GOOGLE_SPREADSHEET_API` と `SPREADSHEET_KEY` の説明を追記

8. **完了報告**
   - 実施した変更内容を簡潔に列挙（判定した実装方式も明示）
   - **STEP 1（Google 側準備）と STEP 3（`.env.local` 設定）は人がやるべき作業として明示**
   - スプシのタブ名を完全一致させること、サービスアカウントへの共有を忘れないことを強調

### 入力パース例

| ユーザー入力 | 抽出するタブ名 |
|---|---|
| `タブ名は "問い合わせ"` | 問い合わせ |
| `タブ名は 'フォーム送信'` | フォーム送信 |
| `タブ名は 送信ログ` | 送信ログ |

### Critical Rules

- **目的の絶対化**: タブ名の変更だけにとどめず、API ルートの作成・フォーム接続・環境変数説明をまとめて行う
- **API ルート**: `app/api/contact/route.ts` で POST を受け取り、`GOOGLE_SPREADSHEET_API` と `SPREADSHEET_KEY` を使って Google Sheets に追記。range は `タブ名!A:A`、`タブ名!A1:Z1`、`タブ名!A${nextRow}` のように使用
- **初回行の扱い（必須）**: シートが空（`nextRow === 1`）のときは **1行目に列タイトルのみ**、2行目に1件目データ。2件目以降は最下行に追記
- **フォーム実装方式の判定（v3 / v2）**:
  - **v3（Server Action）**: `app/actions/submit-contact.ts` の存在 / `submitContactForm` の import を確認
  - **v2（form-handler.js）**: `FormHandler.init` / `<Script src="...form-handler.js" />` を確認
  - 判定結果を完了報告で明示する
- **フォーム接続（v3）**: `handleSubmit` 内、`submitContactForm()` の戻り値が `ok: true` の分岐に `fetch("/api/contact", ...).catch(...)` を追記
- **フォーム接続（v2）**: `FormHandler.init({ onSuccess })` の `onSuccess` 内に `fetch("/api/contact", ...).catch(...)` を追記
- **エラー握りつぶし（必須）**: `/api/contact` の呼び出しは必ず `.catch((err) => console.error(err))` を付ける。スプシ書き込み失敗がメール通知の成否に影響しないようにするため
- **秘密情報**: コード内に秘密を書かず、`.env.example` には説明のみ。実値は `.env.local` に人が手動で追記する形にする
- **依存パッケージ**: `googleapis` は必ず `npm install` する（package.json への手書きだけで終わらせない）
- **UFA トークンには触れない**: このコマンドは UFA とは独立した別系統の処理。`FORM_API_TOKEN` 等の UFA 関連環境変数を読んだり書いたりしない

### Execution Example

**User**: `/spreadsheet-form-api タブ名は "フォーム送信"`

**AI Action**:

```
[1] memories/spreadsheet_form_api.yaml を読み込み、app/contact/page.tsx を確認しました
[2] タブ名を解析: "フォーム送信"
[3] 前提チェック: お問い合わせフォーム本体は実装済みです
    → 実装方式を判定: v3.0.0（Server Action 方式）を検出
      - app/actions/submit-contact.ts が存在
      - app/contact/page.tsx が submitContactForm を import
[4] googleapis をインストールしました（npm install googleapis）
[5] app/api/contact/route.ts を新規作成しました
    - タブ名: "フォーム送信"
    - 初回は1行目に列タイトル、2行目に1件目データ、2件目以降は最下行に追記
[6] app/contact/page.tsx の handleSubmit 内、result.ok 分岐に fetch('/api/contact', ...).catch(...) を追記しました
    （v3 の Server Action 成功後にスプシ書き込みを実行）
[7] .env.example に GOOGLE_SPREADSHEET_API と SPREADSHEET_KEY の説明を追記しました

✅ コード側の作業は完了です。次は人がやる作業です：

【人がやる作業】
1. Google スプレッドシートで「フォーム送信」というタブ名のシートを作成
2. Google Cloud でサービスアカウントを作成し、JSON キーをダウンロード
3. スプシをサービスアカウントの client_email に「編集者」権限で共有
4. .env.local に GOOGLE_SPREADSHEET_API と SPREADSHEET_KEY を追記
5. npm run dev を再起動して /contact から実送信テスト

詳細は .cursor/commands/spreadsheet-form-api.md の STEP 1, 3, 4 を参照してください。
```

---

## Notes

- スプレッドシート側に、指定した名前のシート（タブ）を**事前に作成**し、サービスアカウントに編集権限を付与すること
- タブ名にスペースや特殊文字を含む場合は、そのまま文字列で指定して OK
- フォーム実装パターンは送信成功時の `onSuccess`（または送信ハンドラ）内で `/api/contact` を呼ぶ形を標準とする
- 個人情報を扱うため、**スプレッドシートの共有範囲（誰が閲覧できるか）も必ず確認**すること
