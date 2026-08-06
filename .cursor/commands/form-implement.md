# Form Implementation

お問い合わせフォーム実装ワークフローを実行します（Universal Form API - Server Action 方式 / v3.0.0）。

## Context Files

- `memories/form_workflow.yaml` （v3.0.0 - Server Action 方式・完全な仕様を含む）
- `.cursor/rules/workflows.md` （Contact Form Implementation Workflow セクション）

## Instructions

**🚨 重要: このコマンドファイルは指示のみです。詳細なワークフロー（全7ステップ）は yaml ファイルに記載されています。**

1. **🚨 CRITICAL: 必ず以下のファイルを読み込む（読まずに実行することは禁止）:**
   - `memories/form_workflow.yaml` （詳細ワークフロー・v3.0.0・Server Action 方式）
   - `.cursor/rules/workflows.md` の Contact Form Implementation Workflow セクション
2. **yaml ファイルを読み込んでから、7つのステップを順番に実行し、絶対にスキップしない**

## 🚨 v3.0.0 で変わったこと（最新 UFA 対応）

**旧方式（v2.0.0）は廃止。理由：**

- `form-handler.js` をブラウザで読み込み、`NEXT_PUBLIC_FORM_API_TOKEN` をブラウザに露出していた
- 最新 UFA では Token 認証サイトは **Server Action 経由でのサーバー送信が推奨**
- ブラウザにトークンを露出させない `FORM_API_TOKEN`（`NEXT_PUBLIC_` なし）を使う
- 2026-05-04 以降の UFA には `_hp_field` honeypot があり、空文字で送信しないと bot 判定される

**v3.0.0 の方針：**

- `form-handler.js` の `<Script>` 読み込みは **使わない**
- `FormHandler.init()` は **呼ばない**
- `app/actions/submit-contact.ts` に Server Action を作る
- Client Component からは Server Action を `await` で呼ぶだけ
- 環境変数は `FORM_API_URL` / `FORM_API_SITE_ID` / `FORM_API_TOKEN` の3つ（すべて `NEXT_PUBLIC_` なし）
- honeypot 用に `_hp_field: ""` を送信ペイロードに含める

## Critical Rules

### Information Collection

1. **app/ のファイル（実際のページ）から情報を収集（優先）:**
   - app/\*\*/page.tsx を検索
   - 各ページを読み込んで内容を分析
   - h1, h2, metadata, サービス説明から会社名・業種を特定
   - Footer から連絡先メールアドレスを取得
   - vercel.json から BASE_URL を取得
   - 業種に応じて適切なフォームフィールドを推測
     - BtoB企業: 会社名、部署名
     - 予備校・教育: 学年、学校名
     - 不動産: 物件種別、希望エリア
     - 一般企業: 会社名、電話番号

2. **about.yaml（補完的・基本情報のみ）:**
   - app/ で情報が不足する場合に使用
   - **⚠️ フォームフィールド情報は取得しない**（デザイン完成後に修正されている可能性があるため）
   - 会社名、メールアドレスなどの基本情報のみ

3. **ユーザーに確認:**
   - app/ と about.yaml のどちらからも情報が取得できない場合
   - サイトID、会社名、メールアドレス
   - フィールド定義は app/contact/ の既存フォームが最優先

### JSON Generation (Token 認証 + 新スキーマ)

- 管理画面登録用の JSON を生成
- **site_id: 英小文字・数字・アンダースコア(\_)のみ（ハイフン使用不可、テーブル名として使用されるため）**
- **requireToken: true** （Token 認証を使用）
- **productionDomain: 不要**（Token 認証のため）
- **emailTemplate: HTML 文字列をそのまま入れる**（旧 `emailTemplateId` は deprecated・API 側で警告が出る）
- **emailFromName: 指定不要**（システム固定の送信者名になるため、API 側で警告が出る）
- fields: 各フィールドの name, label, type, required

### Email Template Generation

- HTML メールテンプレートを生成（JSON の `emailTemplate` に直接入れる文字列）
- 必須フィールド: 常に表示
- 任意フィールド: 条件分岐で表示（`{{#if field}}...{{/if}}`）
- 未入力メッセージ: 任意フィールドが空の場合（`{{^field}}...{{/field}}`）
- テンプレート ID 方式は廃止

### Server Action 実装（v3.0.0）

新しいファイル構成:

```
app/
  actions/
    submit-contact.ts  ← 新規作成（Server Action）
  contact/
    page.tsx           ← 既存フォームを修正（"use client" のまま）
```

#### `app/actions/submit-contact.ts` の構造

- 先頭に `"use server";`
- 環境変数から `FORM_API_URL` / `FORM_API_SITE_ID` / `FORM_API_TOKEN` を読み、いずれかが欠ければ早期 return
- フォームの各フィールドをサニタイズ
- **honeypot として `_hp_field: ""` を必ず追加**（空文字なので bot 判定されない）
- `fetch(API_URL, { method: "POST", headers: { Authorization: "Bearer ..." }, body: JSON.stringify({ site_id, formData }) })`
- 返り値は `{ ok: true } | { ok: false; message: string }`

#### Client Component（`app/contact/page.tsx`）の修正

**追加するもの:**

1. `"use client"` ディレクティブ（既存になければ）
2. `useState` import（既存になければ）
3. Server Action の import: `import { submitContactForm } from "@/app/actions/submit-contact";`
4. `useState` で `isSubmitting`, `status` を管理
5. `handleSubmit`: 既存フォームのデータを `FormData` で取り出し、`submitContactForm()` を `await`
6. `<form>` に `id="contactForm"` と `onSubmit={handleSubmit}` を追加
7. **honeypot 用 hidden input を追加**（`<input type="text" name="_hp_field" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden />`）
8. `<button>` に `disabled={isSubmitting}` と動的テキスト
9. `</form>` の直後にステータスメッセージ

**削除するもの:**

- `import Script from "next/script";`
- `<Script src="https://universal-form-api.vercel.app/form-handler.js" ...>` タグ
- `(window as any).FormHandler` への参照
- `FormHandler.init(...)` の呼び出し
- `formHandlerLoaded` state
- `useEffect` で FormHandler を待つロジック

### Security Measures (🚨 MANDATORY)

**All generated forms MUST include:**

- ✅ **maxLength attribute** (文字数制限)
- ✅ **pattern attribute** (危険な文字制限: JSX では `pattern={"[^<>&\"']+"}` と書く。🚨 `\<` `\>` `\&` のような不要なバックスラッシュは入れない。キャラクタークラス内の不要なエスケープは ES2024 の `v` フラグ正規表現でエラーになり、ブラウザのコンソールに `Invalid escape` / `is not a valid regular expression` が出る)
- ✅ **sanitize 関数** (Server Action 内で HTML タグ除去)
- ✅ **validateForm 関数** (Server Action または Client で送信前バリデーション)
- ✅ **honeypot** (`_hp_field` hidden input + Server Action で `_hp_field: ""` を送信)

**Never skip security implementation.**

### ESLint / TypeScript

v3.0.0 では `(window as any)` を使わないため、関連する eslint-disable は不要。

- ✅ `any` 型を使わない（`Record<string, string>` / `FormData` / 専用型）
- ✅ Server Action の引数は明示的な型で受ける
- ✅ `process.env.FORM_API_TOKEN` などの string | undefined を必ず undefined チェック

### Validation Generation

- required: true のフィールドに対して必須チェックを生成
- メールアドレス形式チェック
- バリデーションは Server Action 側で実施（Client 側にもあって良い）

## Default Fields

標準的なお問い合わせフォームのデフォルトフィールド:

- name (お名前) - required: true
- email (メールアドレス) - required: true
- company (会社名) - required: false
- phone (電話番号) - required: false
- message (お問い合わせ内容) - required: true, type: textarea

**⚠️ 重要: `<select>` 要素を使う場合**

- JSON の fields 配列では `type: "text"` と指定
- フロントエンドでは `<select>` タグを使用して OK
- 理由: API 側でのバリデーションのため

**⚠️ honeypot フィールド `_hp_field`**

- UFA 側で 2026-05-04 から追加されたボット対策
- **必ず空文字で送信する**（値が入っていると bot 判定され 200 偽装応答になる）
- JSON の `fields` 配列には登録しない（UFA 側で内部処理）
- Server Action 内で `formData._hp_field = "";` を強制すること

## Optional Fields (画像・ファイル添付)

⚠️ v3.0.0 では Server Action 経由のため、`form-handler.js` の自動添付検出は使えません。
ファイル添付が必要な場合は、Server Action 内で `FormData` を Base64 化して `_attachments` 配列にして送る実装が必要です。
**MVP では添付対応を含めない**ことを推奨。必要なら別途仕様確認。

## Integration (Token 認証 / Server Action)

- **requireToken: true** （必須）
- **API トークン: 管理画面で生成後、`FORM_API_TOKEN`（NEXT_PUBLIC\_ なし）に設定**
- admin_email: about.yaml の contact_defaults.email（複数の場合はカンマ区切り）
- site_name: about.yaml の site.name
- **環境変数 3 つ（すべて NEXT_PUBLIC\_ なし）:**
  - `FORM_API_URL=https://universal-form-api.vercel.app/api/submit`
  - `FORM_API_SITE_ID=your_site_id`
  - `FORM_API_TOKEN=ufa_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Execution Example

**User:** `/form-implement`

**AI Action:**

```
[1/7] サイト情報を収集します...
  → about.yaml と app/ から情報を抽出
  → site_id: "mediaproof"
  → site_name: "株式会社メディアプルーフ"
  → admin_email: "rinnari777@gmail.com"

[2/7] 管理画面登録用 JSON を生成します（Token 認証 + emailTemplate inline）...
  ✅ JSON 生成完了（requireToken: true, emailTemplate に HTML 文字列）

[3/7] Server Action（app/actions/submit-contact.ts）を作成します...
  ✅ Server Action を作成しました

[4/7] Next.js コンポーネント（app/contact/page.tsx）を修正します...
  ✅ form-handler.js 依存を削除し、Server Action 呼び出しに置き換えました
  ✅ honeypot 用 hidden input を追加しました

[5/7] 環境変数ファイル（.env.local）を自動作成します...
  AI: API トークンを貼り付けてください
  User: ufa_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  AI: （write ツールで自動作成 - required_permissions: ['all']）
  ✅ .env.local ファイルを作成しました
     - FORM_API_URL
     - FORM_API_SITE_ID
     - FORM_API_TOKEN（NEXT_PUBLIC_ なし）

[6/7] セキュリティ対策を確認します...
  ✅ サニタイズ・バリデーション・honeypot すべて実装済み

[7/7] 完了報告とテスト手順を提示します...
  ✅ お問い合わせフォームの実装が完了しました！
```

## Next Steps

1. **管理画面でサイト登録**
   - 一括登録 (JSON) → 生成された JSON をペースト
   - `emailTemplate` フィールドに HTML が入っていることを確認

2. **API トークンをコピー**
   - 編集タブ → API トークン管理

3. **環境変数設定（自動完了）**
   - ✅ `.env.local` は Step 5 で自動作成済み
   - ✅ `FORM_API_URL` / `FORM_API_SITE_ID` / `FORM_API_TOKEN` 設定済み

4. **ローカルでテスト送信**
   - `npm run dev` で起動し `/contact` から送信
   - Network タブで `/api/submit` が 200 で、レスポンスに `success: true` を確認

5. **管理画面でデータ確認**
   - ダッシュボード → 該当サイト → データ確認 にレコードが入っているか
   - 通知メールが届いているか

6. **本番環境展開**
   - Vercel の Environment Variables に `FORM_API_URL` / `FORM_API_SITE_ID` / `FORM_API_TOKEN` を追加
   - `FORM_API_TOKEN` は **Sensitive Variable** にする
   - デプロイ後、本番ドメインから送信テスト

## トラブルシューティング（v3.0.0 で頻発するもの）

| 症状 | 原因 | 対処 |
| --- | --- | --- |
| 200 が返るがダッシュボードに記録されない | honeypot 発動（`_hp_field` に値が入って送信されている） | Server Action 内で `formData._hp_field = ""` を強制 |
| 403 Forbidden | `FORM_API_TOKEN` 未設定 / 旧トークン | `.env.local` と Vercel 環境変数を再確認 |
| 404 Site not found | `FORM_API_SITE_ID` の typo / サイトが is_active=false | 管理画面でサイト ID を確認 |
| 500 Server error | UFA 側で `contacts_<site_id>` テーブルが未作成 / RLS ポリシー未設定 | UFA 管理者に依頼（コード側では対応不可） |
| トークンがブラウザに露出している | `NEXT_PUBLIC_FORM_API_TOKEN` を使っている | `FORM_API_TOKEN`（NEXT_PUBLIC\_ なし）に変更、ブラウザのソース確認 |

## 参照ドキュメント

- Universal Form API リポジトリ: `docs/secure-form-single.md` / `docs/secure-form-multiple.md`
- 管理画面: <https://universal-form-api.vercel.app/auth/>
