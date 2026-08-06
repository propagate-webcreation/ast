# Google Submission

Google提出ワークフローを実行します（所有権確認 + altタグ + metadata + sitemap + robots + URLスラッグ）。

## Context Files

- `memories/submit_google.yaml`
- `.cursor/rules/workflows.md` （Google Submission Workflow セクション）

## Instructions

**🚨 重要: このコマンドファイルは指示のみです。詳細なワークフロー（6つのワークフロー）は yaml ファイルに記載されています。**

1. **🚨 CRITICAL: 必ず以下のファイルを読み込む（読まずに実行することは禁止）:**
   - `memories/submit_google.yaml` （詳細ワークフロー・本体）
   - `.cursor/rules/workflows.md` の Google Submission Workflow セクション（重要なルール）
2. **yaml ファイルを読み込んでから、6つのワークフローを順番に実行し、絶対にスキップしない**

## URL Prefix Option (Optional)

**Google Search Console の「URL プレフィックス プロパティ」を使用する場合のオプション機能**

### 使用方法
```
/google-submit --prefix /blog
```
または
```
/google-submit prefix=/blog
```

### 動作
- `--prefix` または `prefix=` が指定された場合、sitemap と robots.txt は指定されたパス配下のみを対象にする
- 指定がない場合は、従来通りサイト全体を対象にする

### 例
| コマンド | 対象範囲 |
|---------|---------|
| `/google-submit` | サイト全体（/、/about/、/contact/ など） |
| `/google-submit --prefix /blog` | /blog/ 配下のみ（/blog/、/blog/post-1/ など） |
| `/google-submit prefix=/services` | /services/ 配下のみ |

### 注意事項
- URL prefix を使用する場合、Google Search Console で「URL プレフィックス プロパティ」として登録する必要があります
- ドメインプロパティ（サイト全体）とは別の登録になります

## Critical Rules

### Workflow 0: 登録方式の選択（2つの方式から選択可能）

**最初にユーザーに登録方式を選択させる:**

| 方式 | 説明 | DNS必要？ | 推奨 |
|------|------|----------|------|
| **A: ドメインプロパティ** | DNS TXT レコードで確認 | ✅ 必要 | 自社ドメイン向け |
| **B: URL プレフィックス** | HTML ファイルで確認 | ❌ 不要 | ✅ 顧客ドメイン向け |

#### 方式 A: ドメインプロパティ（DNS方式）
- Google Search Console で「ドメイン」を選択
- DNS TXT レコードを追加して所有権確認
- **⚠️ 顧客ドメインの場合、顧客側での DNS 設定が必要**

#### 方式 B: URL プレフィックス（HTML ファイル方式）✅ 推奨
- Google Search Console で「URL プレフィックス」を選択
- **HTML ファイルをダウンロードして `public/` に保存**
- **✅ DNS 設定不要、デプロイするだけで完結**
- **✅ 顧客ドメインでも自分側だけで対応可能**

### Workflow 1: Alt Tag Setup (MANDATORY Quality Check)
- 🚨 **multiline モード使用**（複数行にまたがる Image タグも検出）
- 🚨 **品質チェック必須**（status: MANDATORY, skip_allowed: false）
- 🚨 **不適切な alt を自動改善**
  - Forbidden words: "画像", "写真", "イメージ", "test", "sample"
  - Forbidden patterns: "〜用の", "〜のための", "の画像", "の写真"
  - Check: 文字数（20字以内）、冗長語（7パターン）、具体性
- ❌ **Do NOT** just check if alt exists → MUST check quality
- 推奨検索パターン: `"Image"` または `'src="'` （シンプルで確実）
- ❌ 避けるパターン: `'<Image|<img'` （失敗する）

### Workflow 2: Metadata Setup
- Utilize existing metadata (domain connection で設定済みの場合)
- Generate title (28-32 chars), description (90-120 chars), keywords (5)
- Add openGraph and twitter
- Update app/layout.tsx using search_replace

### Workflow 3: Sitemap Creation (🚨 CRITICAL)
- 🚨 **CRITICAL: Detect only page.tsx from filesystem**
- ❌ **Do NOT** detect links in code (`<a href="...">`, `<Link href="...">`)
- ❌ **Do NOT** include external URLs
- 🚨 **CRITICAL: Exclude redirect-only pages (duplicate content prevention)**
  - Read each page.tsx and check for redirect(), permanentRedirect(), notFound()
  - Exclude redirect-only pages from sitemap
  - Example: app/page.tsx with redirect('/home') → exclude / from sitemap, include /home/ only
- status: CRITICAL, skip_allowed: false
- 外部URL混入と重複コンテンツを絶対に防ぐ

### Workflow 4: Robots.txt Creation
- Reuse BASE_URL from workflow_3
- Use write tool to create public/robots.txt
- Sitemap URL must match sitemap.ts

### Workflow 5: URL Slug Optimization
- Detect Japanese directories
- Read page.tsx to analyze content
- Suggest English slugs (manual rename required)

## Execution Example

### 通常実行（サイト全体）

**User:** `/google-submit`

**AI Action:**
```
[0/6] Google Search Console 登録方式を選択してください:

─────────────────────────────────────────────────
【A】ドメインプロパティ（DNS方式） ＊当社取得＊
   - サイト全体を1つのプロパティとして登録
   - DNS レコード（TXT）の追加が必要 
   - ⚠️ 顧客ドメインの場合、顧客側での DNS 設定が必要
─────────────────────────────────────────────────
【B】URL プレフィックス（HTML ファイル方式）＊先方ドメイン＊
   - DNS 設定不要、デプロイするだけで完結
   - 顧客ドメインでも自分側だけで対応可能
─────────────────────────────────────────────────

どちらの方式で登録しますか？（A または B を入力）

→ ユーザー入力: B

📋 URL プレフィックス（HTML ファイル方式）で登録します

【手順】
1. Google Search Console (https://search.google.com/search-console) にアクセス
2. 「プロパティを追加」→「URL プレフィックス」を選択
3. サイトの URL を入力（例: https://www.example.com）
4. 「確認方法」で「HTML ファイル」を選択
5. 表示される HTML ファイルをダウンロード
6. ダウンロードしたファイルを public/ フォルダに保存

📝 保存したファイル名を入力してください:
（例: google1234567890abcdef.html）

→ ユーザー入力: google1234567890abcdef.html
✅ public/google1234567890abcdef.html の存在を確認しました

[1/6] altタグを設定します...
  → multiline: true で Image を検索
  → alt属性を確認（存在だけでなく品質もチェック）
  → 不適切なalt（"画像", "写真"など）を自動改善
  ✅ 画像に alt 属性を設定しました

[2/6] metadata を設定します...
  → 既存metadata活用 or 新規生成
  → openGraph, twitter を追加
  ✅ app/layout.tsx に metadata を設定しました

[3/6] sitemap.ts を作成します...
  → ファイルシステムのみ検出（外部URL除外）
  ✅ app/sitemap.ts を作成しました

[4/6] robots.txt を作成します...
  ✅ public/robots.txt を作成しました

[5/6] URLスラッグを最適化します...
  ✅ URLスラッグを最適化しました

🎉 Google提出の準備が完了しました！
```

### URL Prefix 指定実行（特定パス配下のみ）

**User:** `/google-submit --prefix /blog`

**AI Action:**
```
📍 URL Prefix モード: /blog 配下のみを対象にします

[0/6] Google Search Console 登録方式を選択してください:
  【A】ドメインプロパティ（DNS方式）
  【B】URL プレフィックス（HTML ファイル方式）✅ 推奨

→ ユーザー入力: A
📋 ドメインプロパティ（DNS方式）で登録します

【手順】
1. Google Search Console で「ドメイン」を選択
2. ドメイン名を入力（例: example.com）
3. 表示される TXT レコードを DNS に追加
4. Google Search Console で「確認」をクリック

⚠️ DNS の反映には最大48時間かかる場合があります

DNS 設定が完了したら「完了」と入力してください。
→ ユーザー入力: 完了

[1/6] altタグを設定します...
  → /blog 配下のコンポーネントのみ対象
  ✅ 画像に alt 属性を設定しました

[2/6] metadata を設定します...
  → /blog 用の metadata を設定
  ✅ app/blog/layout.tsx に metadata を設定しました

[3/6] sitemap.ts を作成します...
  → /blog 配下の page.tsx のみ検出
  → 対象: /blog/, /blog/post-1/, /blog/post-2/
  ✅ app/sitemap.ts を作成しました（/blog 配下のみ）

[4/6] robots.txt を作成します...
  → Sitemap URL: https://www.example.com/sitemap.xml
  ✅ public/robots.txt を作成しました

[5/6] URLスラッグを最適化します...
  → /blog 配下のディレクトリのみ対象
  ✅ URLスラッグを最適化しました🎉 Google提出の準備が完了しました！（URL Prefix: /blog）
```
