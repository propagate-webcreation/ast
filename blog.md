# Universal Blog API - 実装ガイド

Notion-based CMS for Next.js websites. Next.js サイトに動的ブログ機能を追加するための API システムです。

## 目次

1. [概要](#概要)
2. [前提条件](#前提条件)
3. [API サーバーのセットアップ](#api-サーバーのセットアップ)
   - [ステップ 1: Notion 設定](#ステップ-1-notion-設定)
   - [ステップ 2: API サーバーの設定変更](#ステップ-2-api-サーバーの設定変更)
   - [2-0. Notion Database ID（URL からの整形）](#20-notion-database-idurl-からの整形)
   - [2-1. サイト設定の追加](#21-サイト設定の追加)
   - [環境変数の設定](#2-2-環境変数の設定)
4. [Next.js サイトへの実装手順](#nextjs-サイトへの実装手順)
   - [ファイル構造](#ファイル構造)
   - [ブログ一覧ページの実装](#ブログ一覧ページの実装)
   - [ブログ記事詳細ページの実装](#ブログ記事詳細ページの実装)
   - [動的サイトマップの実装](#動的サイトマップの実装)
5. [SEO 最適化](#seo-最適化)
6. [トラブルシューティング](#トラブルシューティング)
7. [API リファレンス](#api-リファレンス)

## 概要

Universal Blog API は、Notion をバックエンドとして使用し、Next.js サイトに簡単にブログ機能を追加できるシステムです。

### 主な特徴

- Notion で記事を管理
- Next.js App Router 対応
- Slug ベースの SEO フレンドリーな URL
- 動的サイトマップ生成
- レスポンシブ対応
- 複数サイト対応
- カスタマイズ可能なデザイン

### システム構成

```text
Notion (CMS)
    ↓
API Server (Next.js/Vercel)
    ├── Notion API Client
    ├── HTML Converter
    ├── Memory Cache
    └── Supabase (設定管理)
    ↓
Next.js Website
```

## 前提条件

- Notion アカウント（スマート SEO）
- Next.js 13+ (App Router 使用)
- 新規サイトのリポジトリ
- API サーバーの設定変更

## API サーバーのセットアップ

### ステップ 1: Notion 設定

#### 1-1. Notion データベースの作成

1. Notion で次のサイトを開き、[新しいページ](https://www.notion.so/29290d2cd263803a9e77e5a5ab4a4365?v=29290d2cd2638167ae5e000c1aeeed7e)を作成
2. サンプルページを複製して「データベース - フルページ」を作成
3. 以下のプロパティを必ず追加（すでに追加済み）：

| プロパティ名  | タイプ            | 必須 | 説明                       |
| ------------- | ----------------- | ---- | -------------------------- |
| Title         | タイトル          | ☑︎   | 記事のタイトル             |
| Published     | チェックボックス  | ☑︎   | 公開状態                   |
| PublishedDate | 日付              | ☑︎   | 公開日                     |
| Tags          | マルチセレクト    | ☑︎   | タグ                       |
| Excerpt       | テキスト          | ☑︎   | 記事の抜粋（一覧表示用）   |
| Slug          | テキスト          | ☑︎   | URL 用スラッグ（SEO 対応） |
| Thumbnail     | ファイル&メディア |      | サムネイル画像             |

#### 1-2. インテグレーションの接続

1. データベースページの右上「...」メニューをクリック
2. 「接続先」→「接続を追加」
3. **Universal Blog API**インテグレーションを選択
4. データベース URL から`Database ID`を取得：

   ```text
   https://www.notion.so/workspace/xxxxxxxxxxxxxxxxxxxxxxxxxx?v=...
                                   ↑ この32文字がDatabase ID
   ```

### ステップ 2: API サーバーの設定変更

ステップ 1（Notion のデータベース作成・インテグレーション接続）が完了している前提で、**blog-api 管理画面**でサイトを登録します。

#### 2-0. Notion Database ID（URL からの整形）

Notion のデータベースをブラウザで開いたときの **アドレスバー全文** をコピーしてもよいです。管理画面や下記 JSON に入れる **`notion_database_id` は次のルールで整形**します。

1. URL から **パス上の最後のセグメント**を取る（ワークスペース名付き URL でも、末尾が対象）。
2. そのセグメントのうち **`?` より前**だけを使う（**`?v=` 以降はビュー用 ID のため含めない**）。
3. ID が **ハイフン付き UUID** の形式なら **ハイフンを除き**、**32 文字の 16 進（0-9, a-f）**になることを確認する。

**例:**

```text
入力（URL 全文）:
https://www.notion.so/32290d2cd26380e28e64fd19835c7c04?v=32290d2cd26381238bc4000c97cd45e2

整形後（Notion Database ID）:
32290d2cd26380e28e64fd19835c7c04
```

**参考（スクリプトで一括整形する場合）:**

```typescript
/** Notion の DB/ページ URL またはパス末尾から 32 桁の Database ID を返す */
function notionUrlToDatabaseId(input: string): string {
  const trimmed = input.trim();
  let path = trimmed;
  try {
    path = new URL(trimmed).pathname;
  } catch {
    path = trimmed.includes("/") ? trimmed.replace(/^.*\//, "") : trimmed;
  }
  const segment = path.split("/").filter(Boolean).pop() ?? "";
  const raw = segment.split("?")[0] ?? segment;
  const hex = raw.replace(/-/g, "").toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) {
    throw new Error("Notion Database ID（32 桁）として解釈できません");
  }
  return hex;
}
```

#### 2-1. サイト設定の追加

管理画面（`https://universal-blog-api.vercel.app/auth/login`）にログインして、新規サイトを作成：

1. 管理画面にログイン（メールアドレス：info メール、パスワード：アメリカン\*\*\*\*@）
2. 「新規サイト作成」ボタンをクリック
3. 下表のとおり入力する（**プレースホルダーは案件に合わせて差し替え**）
4. 「作成」ボタンをクリック
5. 作成後、「API トークン」が表示されるのでコピーしておく

**新規サイト作成フォーム（入力値一覧）**

| 項目                     | 入力値（例・プレースホルダー可）                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| サイト ID                | `YOUR_SITE_ID`（英小文字・数字とハイフンのみ）                                                   |
| サイト名                 | `YOUR_SITE_NAME`                                                                                 |
| Notion Database ID       | 手順 **2-0** で URL から整形した **32 文字**（例: `32290d2cd26380e28e64fd19835c7c04`）            |
| 1 ページあたりの記事数   | `6`                                                                                              |
| 許可するタグ             | `お知らせ, 技術, アップデート` など（**カンマ区切り**。管理画面の表記に合わせる）                 |
| カードテンプレート       | 本ドキュメントに項目名の記載がない場合は、管理画面にフィールドがあれば **デフォルト** を選択     |
| SEO サイト名             | `ブログ｜YOUR_SITE_NAME` など                                                                    |
| デフォルト説明文         | SEO 用のサイト説明（一覧・OGP 等のデフォルト文面）                                               |
| デフォルトサムネイル     | `https://example.com/default-thumb.jpg`                                                          |
| OGP 画像                 | `https://example.com/og-image.jpg`                                                               |
| API トークン認証を必須にする | チェックを入れると API アクセスにトークンが必須（**推奨**）                                    |
| 許可 URL                 | クライアントサイドから API を呼び出す場合のみ設定（**API トークン認証を有効にした場合は不要**）   |

**一括コピー用 JSON（サイト設定の型）**

管理画面の各項目と対応付けたテンプレートです。`notion_database_id` には **Notion の全文 URL を貼り、手順 2-0 で 32 桁に直した値**を入れます。作成後に発行される **API トークン**は秘密情報のため、この JSON には **含めません**（`.env.local` の `BLOG_API_TOKEN` にのみ設定）。

```json
{
  "site_id": "YOUR_SITE_ID",
  "site_name": "YOUR_SITE_NAME",
  "notion_database_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "blog_settings": {
    "postsPerPage": 6,
    "allowedTags": ["お知らせ", "技術", "アップデート"],
    "defaultThumbnail": "https://example.com/thumb.jpg",
    "cardTemplate": "default"
  },
  "seo_settings": {
    "siteName": "ブログ｜YOUR_SITE_NAME",
    "defaultDescription": "YOUR_SITE の最新情報やコラムをお届けします。",
    "ogImage": "https://example.com/og.jpg"
  },
  "allowed_origins": ["https://example.com"],
  "require_api_token": true
}
```

- **Server Component のみ**で API を呼ぶ場合は `allowed_origins` を `[]` にするか、管理画面の「許可 URL」を空に近い運用でよいことが多いです。
- `allowedTags` は管理画面が **カンマ区切り文字列**の場合、配列をカンマ区切りに変換して入力してください。

**注意:**

- **Server Component（推奨）から利用する場合**: API トークン認証を有効にし、許可 URL は設定不要
- **クライアントサイドから利用する場合**: API トークン認証を無効にし、許可 URL を設定

#### 2-2. 環境変数の設定

実装する Next.js サイト側で、API トークンを環境変数として設定します：

1. プロジェクトのルートディレクトリに `.env.local` ファイルを作成
2. 以下の内容を追加（API トークンは管理画面からコピー）：

```bash
# .env.local
BLOG_API_TOKEN=bs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**注意:**

- `BLOG_API_TOKEN`: サーバーサイドで使用（記事一覧、記事詳細、サイトマップ等）
- この実装では Server Component のみを使用するため、`NEXT_PUBLIC_`プレフィックスは不要です
- `.env.local` ファイルは Git にコミットしないこと（`.gitignore`に含まれていることを確認）
- API トークンはブラウザに露出せず、サーバーサイドでのみ使用されます

## Next.js サイトへの実装手順

### ファイル構造

```text
app/
├── blog/
│   ├── layout.tsx          # ブログレイアウト（共通メタデータ）
│   ├── page.tsx            # ブログ一覧ページ
│   └── [slug]/
│       ├── page.tsx        # 記事詳細ページ（動的ルーティング）
│       └── article.css     # 記事スタイル（オプション、方法2の場合）
├── sitemap.ts              # 動的サイトマップ
└── ...
next-sitemap.config.js      # next-sitemap設定（オプション）
package.json
tailwind.config.js          # Tailwind CSS設定
```

### ブログ一覧ページの実装

#### 1. ブログレイアウトの作成 (`app/blog/layout.tsx`)

共通のメタデータとレイアウトを設定：

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | あなたのサイト名ブログ",
    default: "ブログ | あなたのサイト名",
  },
  description: "最新のお知らせや技術情報をお届けします。",
  keywords: ["ブログ", "お知らせ", "技術", "アップデート"],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://your-site-url.com/blog",
    siteName: "あなたのサイト名",
    title: "ブログ | あなたのサイト名",
    description: "最新のお知らせや技術情報をお届けします。",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://your-site-url.com/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

#### 2. ブログ一覧ページの作成 (`app/blog/page.tsx`)

Server Component で安全に API トークンを使用して記事一覧を取得します：

```typescript
import Link from "next/link";

// 型定義
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  publishedDate: string;
  tags: string[];
  thumbnailUrl?: string;
  slug: string;
}

interface PageProps {
  searchParams: { page?: string };
}

// 記事一覧取得関数
async function getBlogPosts(page: number = 1): Promise<{
  posts: BlogPost[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasMore: boolean;
  };
}> {
  try {
    const headers: HeadersInit = {};

    // APIトークンをサーバーサイドで安全に取得
    const apiToken = process.env.BLOG_API_TOKEN;
    if (apiToken) {
      headers["Authorization"] = `Bearer ${apiToken}`;
    }

    const response = await fetch(
      `https://universal-blog-api.vercel.app/api/blog/posts?siteId=your-site-id&page=${page}&limit=6`,
      {
        next: { revalidate: 300 }, // 5分ごとに再検証（ISR）
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch posts");
    }

    return {
      posts: data.posts || [],
      pagination: data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasMore: false,
      },
    };
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return {
      posts: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasMore: false,
      },
    };
  }
}

// ページコンポーネント
export default async function BlogPage({ searchParams }: PageProps) {
  const currentPage = Number(searchParams.page) || 1;
  const { posts, pagination } = await getBlogPosts(currentPage);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="mb-10 text-4xl font-bold text-gray-900">ブログ</h1>

      {/* 記事一覧 */}
      <div className="flex flex-col gap-5">
        {posts.length === 0 ? (
          <p className="py-16 text-center text-lg text-gray-500">
            記事がありません
          </p>
        ) : (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block rounded-lg border border-gray-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="mb-2 text-sm text-gray-500">
                {new Date(post.publishedDate).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </div>
              <h2 className="my-2.5 text-2xl font-bold text-gray-900">
                {post.title}
              </h2>
              <p className="my-3 leading-relaxed text-gray-600">
                {post.excerpt}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-sm font-medium text-blue-600">
                  続きを読む →
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* ページネーション */}
      {pagination.totalPages > 1 && (
        <div className="mt-10 flex flex-col items-center justify-center gap-5 md:flex-row">
          {pagination.currentPage > 1 && (
            <Link
              href={`/blog?page=${pagination.currentPage - 1}`}
              className="rounded-md border border-gray-200 bg-white px-5 py-2.5 font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
            >
              ← 前のページ
            </Link>
          )}

          <span className="text-sm text-gray-500">
            {pagination.currentPage} / {pagination.totalPages}
          </span>

          {pagination.hasMore && (
            <Link
              href={`/blog?page=${pagination.currentPage + 1}`}
              className="rounded-md border border-gray-200 bg-white px-5 py-2.5 font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
            >
              次のページ →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
```

### ブログ記事詳細ページの実装

#### 記事詳細ページの作成 (`app/blog/[slug]/page.tsx`)

Slug ベースの動的ルーティングで記事詳細を表示：

```typescript
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// 型定義
interface BlogArticle {
  id: string;
  title: string;
  publishedDate: string;
  tags: string[];
  htmlContent: string;
  metadata: {
    readingTime: string;
    wordCount: number;
    lastModified?: string;
  };
}

interface PageProps {
  params: { slug: string };
}

// 記事取得関数
async function getArticle(slug: string): Promise<BlogArticle | null> {
  try {
    const headers: HeadersInit = {};

    // APIトークン認証が必須の場合
    const apiToken = process.env.BLOG_API_TOKEN;
    if (apiToken) {
      headers["Authorization"] = `Bearer ${apiToken}`;
    }

    const response = await fetch(
      `https://universal-blog-api.vercel.app/api/blog/article?siteId=your-site-id&slug=${slug}`,
      {
        next: { revalidate: 300 }, // 5分ごとに再検証（ISR）
        headers,
      }
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.article : null;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

// HTMLから説明文を生成
function generateMetaDescription(htmlContent: string): string {
  const plainText = htmlContent.replace(/<[^>]*>/g, "");
  return plainText.substring(0, 160) + "...";
}

// 動的メタデータ生成
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const article = await getArticle(params.slug);

  if (!article) {
    return {
      title: "記事が見つかりません",
      description: "お探しの記事は見つかりませんでした。",
    };
  }

  const description = generateMetaDescription(article.htmlContent);

  return {
    title: `${article.title}`,
    description: description,
    keywords: article.tags.join(", "),
    openGraph: {
      title: article.title,
      description: description,
      type: "article",
      publishedTime: article.publishedDate,
      tags: article.tags,
      url: `https://your-site-url.com/blog/${params.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: description,
    },
    alternates: {
      canonical: `https://your-site-url.com/blog/${params.slug}`,
    },
  };
}

// ページコンポーネント
export default async function ArticleDetailPage({ params }: PageProps) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  const formattedDate = new Date(article.publishedDate).toLocaleDateString(
    "ja-JP",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <article>
        {/* 記事ヘッダー */}
        <header className="mb-10 border-b border-gray-200 pb-5">
          <h1 className="mb-5 text-4xl font-bold text-gray-900">
            {article.title}
          </h1>

          <div className="mb-4 flex flex-col gap-2 text-sm text-gray-500 md:flex-row md:gap-5">
            <time dateTime={article.publishedDate}>{formattedDate}</time>
            <span>読了時間: {article.metadata.readingTime}</span>
          </div>

          {/* タグ */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* 記事本文 */}
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.htmlContent }}
        />

        {/* 一覧に戻るリンク */}
        <div className="mt-16 border-t border-gray-200 pt-5">
          <a href="/blog" className="font-medium text-blue-600 hover:underline">
            ← ブログ一覧に戻る
          </a>
        </div>
      </article>
    </div>
  );
}
```

#### 記事コンテンツのスタイリング

記事本文（Notion から変換された HTML）のスタイルを適用するには、以下の 2 つの方法があります：

**方法 1: Tailwind CSS Typography プラグインを使用（推奨）**

```bash
npm install -D @tailwindcss/typography
```

`tailwind.config.js` に追加：

```javascript
module.exports = {
  plugins: [require("@tailwindcss/typography")],
};
```

コンポーネントで使用：

```typescript
// app/blog/[slug]/page.tsx の記事本文部分
<div
  className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600"
  dangerouslySetInnerHTML={{ __html: article.htmlContent }}
/>
```

**方法 2: グローバル CSS ファイルを使用**

`app/blog/[slug]/article.css` を作成：

```css
.article-content {
  line-height: 1.8;
  color: #374151;
}

.article-content h1 {
  font-size: 2rem;
  font-weight: bold;
  margin: 2.5rem 0 1.25rem;
  color: #111827;
}

.article-content h2 {
  font-size: 1.75rem;
  font-weight: bold;
  margin: 2rem 0 1rem;
  color: #111827;
}

.article-content h3 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1.75rem 0 0.875rem;
  color: #111827;
}

.article-content p {
  margin: 1rem 0;
}

.article-content ul,
.article-content ol {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.article-content li {
  margin: 0.5rem 0;
}

.article-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1.5rem 0;
}

.article-content code {
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.9em;
  color: #1f2937;
}

.article-content pre {
  background: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.article-content pre code {
  background: none;
  padding: 0;
  color: inherit;
}

.article-content blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: #6b7280;
  font-style: italic;
}

.article-content a {
  color: #3b82f6;
  text-decoration: underline;
}

.article-content a:hover {
  color: #2563eb;
}

@media (max-width: 768px) {
  .article-content h1 {
    font-size: 1.75rem;
  }

  .article-content h2 {
    font-size: 1.5rem;
  }

  .article-content h3 {
    font-size: 1.25rem;
  }
}
```

`app/blog/[slug]/page.tsx` でインポート：

```typescript
import "./article.css";
```

### 動的サイトマップの実装

#### 動的サイトマップの作成 (`app/sitemap.ts`)

ブログ記事を含む動的サイトマップを生成：

```typescript
import { MetadataRoute } from "next";

// 型定義
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  publishedDate: string;
  lastModified?: string;
}

interface ApiResponse {
  success: boolean;
  posts: BlogPost[];
}

// 全記事を取得
async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const headers: HeadersInit = {};

    // APIトークン認証が必須の場合
    const apiToken = process.env.BLOG_API_TOKEN;
    if (apiToken) {
      headers["Authorization"] = `Bearer ${apiToken}`;
    }

    const response = await fetch(
      "https://universal-blog-api.vercel.app/api/blog/posts?siteId=your-site-id",
      {
        next: { revalidate: 3600 }, // 1時間キャッシュ
        headers,
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch posts for sitemap:", response.status);
      return [];
    }

    const data: ApiResponse = await response.json();
    return data.success && data.posts ? data.posts : [];
  } catch (error) {
    console.error("Error fetching posts for sitemap:", error);
    return [];
  }
}

// サイトマップ生成
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllBlogPosts();

  // 基本ページ
  const routes: MetadataRoute.Sitemap = [
    {
      url: "https://your-site-url.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://your-site-url.com/blog",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // ブログ記事ページを追加
  const articleRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `https://your-site-url.com/blog/${post.slug}`,
    lastModified: post.lastModified
      ? new Date(post.lastModified)
      : new Date(post.publishedDate),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...routes, ...articleRoutes];
}
```

#### next-sitemap の設定（オプション）

静的サイトマップも併用する場合：

**1. パッケージインストール:**

```bash
npm install next-sitemap --save-dev
```

**2. 設定ファイル作成 (`next-sitemap.config.js`):**

```javascript
module.exports = {
  siteUrl: "https://your-site-url.com",
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ["/admin/*"],
  robotsTxtOptions: {
    additionalSitemaps: ["https://your-site-url.com/sitemap.xml"],
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  },
};
```

**3. package.json にスクリプト追加:**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "postbuild": "next-sitemap",
    "start": "next start"
  }
}
```

## SEO 最適化

### メタデータの設定

- **ページタイトル**: 記事タイトルとサイト名を組み合わせ
- **説明文**: 記事本文から自動抽出（160 文字以内）
- **キーワード**: Notion のタグを使用
- **OGP 設定**: Open Graph プロトコル対応
- **Twitter カード**: summary_large_image 対応
- **Canonical URL**: 正規 URL を明示

### 構造化データ（オプション）

記事詳細ページに構造化データを追加する場合：

```typescript
// app/blog/[slug]/page.tsx に追加

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  // 構造化データ
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    datePublished: article.publishedDate,
    dateModified: article.metadata.lastModified || article.publishedDate,
    author: {
      "@type": "Organization",
      name: "あなたのサイト名",
    },
    publisher: {
      "@type": "Organization",
      name: "あなたのサイト名",
    },
    keywords: article.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* ... 記事コンテンツ ... */}
    </>
  );
}
```

### Google Search Console 設定

1. [Google Search Console](https://search.google.com/search-console) にアクセス
2. サイトドメインを追加
3. サイトマップを登録:
   - `https://your-site-url.com/sitemap.xml`

## Vercel へのデプロイ

ブログ機能を実装した Next.js サイトを Vercel にデプロイする際は、環境変数の設定が必要です。

### 1. vercel 環境変数を設定

デプロイ後、API トークンを環境変数として設定します：

1. Vercel ダッシュボードでプロジェクトを選択
2. 「Settings」タブをクリック
3. 左メニューから「Environment Variables」を選択
4. 環境変数を追加：
   - **Key**: `BLOG_API_TOKEN`
   - **Value**: 管理画面でコピーした API トークン（`bs_`で始まる文字列）
   - **Environments**: `Production`、`Preview`、`Development` すべてにチェック
5. 「Save」をクリック

### 2. 再デプロイ

環境変数を追加した後、変更を反映させるために再デプロイします：

1. 「Deployments」タブをクリック
2. 最新のデプロイメントの右側にある「...」メニューをクリック
3. 「Redeploy」を選択
4. 確認画面で「Redeploy」をクリック

### 3. 動作確認

再デプロイが完了したら、サイトにアクセスしてブログが正常に表示されることを確認します：

1. `https://your-site.vercel.app/blog` にアクセス
2. 記事一覧が表示されることを確認
3. 個別記事ページをクリックして詳細が表示されることを確認

**トラブルシューティング:**

- 記事が表示されない場合は、ブラウザのコンソールでエラーを確認
- 認証エラー（401）が出る場合は、環境変数が正しく設定されているか確認
- 環境変数の設定を変更した後は、必ず再デプロイが必要です

## トラブルシューティング

### 記事が表示されない

#### チェックリスト

1. ✅ Notion 記事の「Published」がチェックされているか
2. ✅ Notion 記事に「Slug」が設定されているか
3. ✅ インテグレーションがデータベースに接続されているか
4. ✅ `siteId`が正しく設定されているか
5. ✅ API サーバーが正常に動作しているか

#### デバッグ手順

1. [https://universal-blog-api.vercel.app/demo](https://universal-blog-api.vercel.app/demo) にアクセス
2. USERID: `propagate1`, PASSWORD: `American****@` でログイン
3. プルダウンからブログページを選択
4. ブログ一覧を確認
5. 各ブログが表示されているか確認

#### デバッグ診断

- [3]で表示されない → 管理画面でサイトが作成されていない、またはアクティブ化されていない
- [4]で表示されない → Notion 設定の不具合
- [5]で表示されない → ブログ設定の不具合（Published になっているか等）
- [1~5]で問題ないが、サイトで表示されない → サイト側での API 設定の不具合 or サイト URL の誤植

### CORS エラーが発生する

- 許可ドメイン設定を確認

### スラッグで記事が見つからない

1. Notion の記事に「Slug」プロパティが設定されているか確認
2. Slug が英数字とハイフンのみで構成されているか確認
3. Slug が他の記事と重複していないか確認

### ビルドエラーが発生する

```bash
# キャッシュをクリア
rm -rf .next
npm run build
```

## API リファレンス

### 認証

#### API トークン

各サイトには固有の API トークンが発行されます。サイトで「API トークン認証を必須にする」を有効にしている場合、全ての API リクエストにトークンが必要です。

**トークンの取得:**

1. 管理画面（`https://universal-blog-api.vercel.app/auth/dashboard`）にログイン
2. サイトを選択して編集画面を開く
3. 「API トークン」セクションにトークンが表示されます

**認証方法:**

Authorization ヘッダーにトークンを含めます：

```javascript
fetch("/api/blog/posts?siteId=your-site-id", {
  headers: {
    Authorization: "Bearer YOUR_API_TOKEN",
  },
});
```

**トークンの再生成:**

1. サイト編集画面の「API トークン」セクションにある「再生成」ボタンをクリック
2. 古いトークンは無効になるため、全ての実装箇所で新しいトークンに更新が必要です

**トークン認証の必須化:**

- 「API トークン認証を必須にする」チェックボックスで制御できます
- 新規作成されるサイトは、デフォルトで API トークン認証が必須になります
- **API トークン認証を有効にした場合、CORS 設定（許可オリジン）は不要**です
  - Server Component からのアクセスでは、origin ヘッダーが送信されないため、CORS 制限の対象外になります
  - セキュリティは API トークンで担保されます

**トークンの安全な管理:**

API トークンは機密情報です。以下のベストプラクティスに従ってください：

1. **環境変数を使用**

   ```bash
   # .env.local
   BLOG_API_TOKEN=bs_your_actual_token_here
   ```

2. **Server Component でのみ使用（推奨）**

   ```typescript
   // Server Componentで使用（安全）
   const apiToken = process.env.BLOG_API_TOKEN;

   const headers: HeadersInit = {};
   if (apiToken) {
     headers["Authorization"] = `Bearer ${apiToken}`;
   }
   ```

3. **gitignore に追加**
   ```bash
   # .gitignoreに以下を追加（通常は既に含まれています）
   .env*.local
   ```

**重要な注意事項:**

- **絶対にクライアントサイドで API トークンを使用しないでください**
- `NEXT_PUBLIC_`プレフィックスを付けると、ブラウザに露出してしまいます
- この実装ガイドでは Server Component のみを使用し、トークンを安全に管理します

**開発環境での注意:**

- universal-blog-api 側が`NODE_ENV=development`の場合、トークンなしでもアクセス可能です
- 本番環境では、「API トークン認証を必須にする」を有効にしている場合のみトークンが必要です
- 本番 API を localhost から使用したい場合は、必ず API トークンを設定してください

### エンドポイント

#### GET /api/blog/posts

記事一覧を取得

**パラメータ:**

- `siteId` (必須): サイト ID
- `page`: ページ番号（デフォルト: 1）
- `limit`: 1 ページの記事数（デフォルト: 6、最大: 20）
- `tag`: タグでフィルター

**認証:** サイトで API トークン認証が必須の場合、Authorization ヘッダーが必要

**リクエスト例:**

```javascript
// JavaScriptでの例
const response = await fetch(
  "https://universal-blog-api.vercel.app/api/blog/posts?siteId=your-site-id&page=1",
  {
    headers: {
      Authorization: "Bearer YOUR_API_TOKEN", // APIトークン認証が必須の場合
    },
  }
);
```

**レスポンス:**

```json
{
  "success": true,
  "posts": [
    {
      "id": "記事ID",
      "title": "記事タイトル",
      "excerpt": "記事の抜粋",
      "publishedDate": "2025-01-15",
      "tags": ["タグ1", "タグ2"],
      "thumbnailUrl": "https://...",
      "slug": "article-slug"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 28,
    "hasMore": true
  }
}
```

#### GET /api/blog/article

記事詳細を取得

**パラメータ:**

- `siteId` (必須): サイト ID
- `slug` または `articleId` (どちらか必須): 記事スラッグまたは ID

**認証:** サイトで API トークン認証が必須の場合、Authorization ヘッダーが必要

**リクエスト例:**

```javascript
// スラッグで取得（推奨）
const response = await fetch(
  "https://universal-blog-api.vercel.app/api/blog/article?siteId=your-site-id&slug=my-article-slug",
  {
    headers: {
      Authorization: "Bearer YOUR_API_TOKEN", // APIトークン認証が必須の場合
    },
  }
);

// 記事IDで取得
const response = await fetch(
  "https://universal-blog-api.vercel.app/api/blog/article?siteId=your-site-id&articleId=abc123",
  {
    headers: {
      Authorization: "Bearer YOUR_API_TOKEN", // APIトークン認証が必須の場合
    },
  }
);
```

**レスポンス:**

```json
{
  "success": true,
  "article": {
    "id": "記事ID",
    "title": "記事タイトル",
    "publishedDate": "2025-01-15",
    "tags": ["タグ1", "タグ2"],
    "htmlContent": "<article>...</article>",
    "metadata": {
      "readingTime": "5分",
      "wordCount": 2500,
      "lastModified": "2025-01-16T10:00:00Z"
    }
  }
}
```

### サポートされる Notion ブロック

- ✅ 段落（Paragraph）
- ✅ 見出し 1/2/3（Heading 1/2/3）
- ✅ 箇条書き・番号付きリスト（Bulleted/Numbered List）
- ✅ 画像（Image）
- ✅ 引用（Quote）
- ✅ コードブロック（Code）
- ✅ 区切り線（Divider）
- ✅ 吹き出し（Callout）
- ✅ トグル（Toggle）
- ✅ ブックマーク（Bookmark）
- ✅ 埋め込み（Embed）- YouTube 対応

### Notion テキスト装飾

- **太字**: `<strong>`
- _斜体_: `<em>`
- 下線: `<u>`
- ~~取り消し線~~: `<s>`
- `コード`: `<code>`
- **カラー**: CSS クラス（`.notion-text-*`, `.notion-bg-*`）

---

**Universal Blog API** - Notion で簡単にブログ管理
