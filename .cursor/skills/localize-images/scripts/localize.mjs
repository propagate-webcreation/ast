/**
 * localize-images.mjs
 *
 * プロジェクト内の外部画像URL（Unsplash, Pexels 等）を検出し、
 * ローカルにダウンロードしてパスを置換する。
 *
 * Usage:
 *   node .cursor/skills/localize-images/scripts/localize.mjs          # dry-run (検出のみ)
 *   node .cursor/skills/localize-images/scripts/localize.mjs --apply  # ダウンロード＋置換
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.cwd();
const DRY = !process.argv.includes("--apply");
const DOWNLOAD_DIR = join(ROOT, "public", "images", "unsplash");

/* ── scan targets ── */
async function collectFiles(dir) {
  const files = [];
  if (!existsSync(dir)) return files;
  for (const e of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (!e.isFile()) continue;
    const full = join(e.parentPath ?? e.path, e.name);
    if (/\.(tsx?|jsx?)$/.test(e.name) && !full.includes("node_modules")) {
      files.push(full);
    }
  }
  return files;
}

/* ── URL detection patterns ── */

// Unsplash: https://images.unsplash.com/photo-XXXXX?...
// Pexels:   https://images.pexels.com/photos/XXXXX/...
// Generic:  https://....jpg / .jpeg / .png / .webp / .gif / .avif / .svg (with optional query)
const RE_EXTERNAL_IMG = /https?:\/\/[^\s"'`{})>]+\.(?:jpg|jpeg|png|webp|gif|avif|svg)(?:\?[^\s"'`{})>]*)?/gi;
const RE_UNSPLASH = /https?:\/\/images\.unsplash\.com\/photo-([a-zA-Z0-9_-]+)\??[^\s"'`{})>]*/gi;
const RE_PEXELS = /https?:\/\/images\.pexels\.com\/photos\/(\d+)\/[^\s"'`{})>]*/gi;

// Skip patterns (not actual images to localize)
const SKIP_PATTERNS = [
  /google\.com\/maps/,
  /googletagmanager\.com/,
  /googleapis\.com/,
  /site-annotator/,
  /vercel\.app/,
  /favicon/i,
  /\.svg$/i, // SVGs are usually icons, not photos
];

function shouldSkip(url) {
  return SKIP_PATTERNS.some((re) => re.test(url));
}

/* ── extract Unsplash photo ID from URL ── */
function extractId(url) {
  // Unsplash: photo-XXXXX
  const unsplash = url.match(/photo-([a-zA-Z0-9_-]+)/);
  if (unsplash) return `unsplash-${unsplash[1]}`;

  // Pexels: /photos/XXXXX/
  const pexels = url.match(/pexels\.com\/photos\/(\d+)/);
  if (pexels) return `pexels-${pexels[1]}`;

  // Fallback: hash from URL
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
  }
  return `img-${Math.abs(hash).toString(36)}`;
}

/* ── determine file extension from URL ── */
function getExtension(url) {
  const match = url.match(/\.(jpg|jpeg|png|webp|gif|avif)(?:\?|$)/i);
  if (match) return `.${match[1].toLowerCase()}`;
  // Unsplash URLs often don't have extension in path — default to .jpg
  if (/unsplash\.com/.test(url)) return ".jpg";
  if (/pexels\.com/.test(url)) return ".jpeg";
  return ".jpg";
}

/* ── download a single image ── */
async function downloadImage(url, destPath) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (localize-images-script)" },
      redirect: "follow",
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(destPath, buffer);
    const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
    return { success: true, size: `${sizeMB} MB` };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/* ── main ── */
const scanDirs = [join(ROOT, "app"), join(ROOT, "src")];
let allFiles = [];
for (const dir of scanDirs) {
  allFiles = allFiles.concat(await collectFiles(dir));
}

// Deduplicate
allFiles = [...new Set(allFiles)];

const report = {
  found: [],       // { file, line, url, id }
  downloaded: [],  // { id, filename, size }
  replaced: [],    // { file, count }
  errors: [],      // { url, error }
  filesModified: new Set(),
};

// URL → local filename mapping (dedup across files)
const urlMap = new Map();
let counter = 0;

// PASS 1: Scan all files and collect external URLs
for (const filepath of allFiles) {
  const rel = relative(ROOT, filepath);
  const content = await readFile(filepath, "utf-8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;

    RE_EXTERNAL_IMG.lastIndex = 0;
    while ((match = RE_EXTERNAL_IMG.exec(line)) !== null) {
      const url = match[0];
      if (shouldSkip(url)) continue;

      // Skip if already a local path
      if (url.startsWith("/") || url.startsWith("./")) continue;

      if (!urlMap.has(url)) {
        counter++;
        const id = extractId(url);
        const ext = getExtension(url);
        const filename = `${id}${ext}`;
        urlMap.set(url, { id, filename, localPath: `/images/unsplash/${filename}` });
      }

      report.found.push({
        file: rel,
        line: i + 1,
        url: url.length > 80 ? url.slice(0, 77) + "..." : url,
        id: urlMap.get(url).id,
      });
    }
  }
}

// Deduplicate found entries by URL for download
const uniqueUrls = [...urlMap.entries()];

console.log(`\n${"═".repeat(60)}`);
console.log(DRY ? "  DRY RUN（--apply で実際にダウンロード＆置換）" : "  APPLIED — ダウンロード＆置換を実行");
console.log(`${"═".repeat(60)}\n`);

if (report.found.length === 0) {
  console.log("外部画像URLは検出されませんでした。\n");
  process.exit(0);
}

// Report found URLs
console.log(`## 検出した外部画像URL: ${uniqueUrls.length} 件（${report.found.length} 箇所）\n`);
console.log("| # | ID | URL | 使用箇所 |");
console.log("|---|-----|-----|----------|");
uniqueUrls.forEach(([url, info], i) => {
  const locations = report.found.filter((f) => f.id === info.id);
  const locStr = locations.map((l) => `${l.file}:${l.line}`).join(", ");
  const shortUrl = url.length > 60 ? url.slice(0, 57) + "..." : url;
  console.log(`| ${i + 1} | ${info.id} | \`${shortUrl}\` | ${locStr} |`);
});
console.log();

if (DRY) {
  console.log(`─── Summary (dry-run) ───`);
  console.log(`外部URL    : ${uniqueUrls.length} 件`);
  console.log(`使用箇所   : ${report.found.length} 箇所`);
  console.log(`\n→  node .cursor/skills/localize-images/scripts/localize.mjs --apply  で実行`);
  process.exit(0);
}

// PASS 2: Download images
await mkdir(DOWNLOAD_DIR, { recursive: true });

console.log("## ダウンロード中...\n");

for (const [url, info] of uniqueUrls) {
  const destPath = join(DOWNLOAD_DIR, info.filename);

  // Skip if already downloaded
  if (existsSync(destPath)) {
    console.log(`  SKIP (既存): ${info.filename}`);
    report.downloaded.push({ id: info.id, filename: info.filename, size: "cached" });
    continue;
  }

  process.stdout.write(`  DL: ${info.filename} ... `);
  const result = await downloadImage(url, destPath);

  if (result.success) {
    console.log(`OK (${result.size})`);
    report.downloaded.push({ id: info.id, filename: info.filename, size: result.size });
  } else {
    console.log(`FAIL: ${result.error}`);
    report.errors.push({ url, error: result.error });
  }
}

console.log();

// PASS 3: Replace URLs in source files
console.log("## コード置換中...\n");

for (const filepath of allFiles) {
  const rel = relative(ROOT, filepath);
  let content = await readFile(filepath, "utf-8");
  let replaceCount = 0;

  for (const [url, info] of uniqueUrls) {
    // Only replace if download succeeded
    if (report.errors.some((e) => e.url === url)) continue;

    // Escape special regex characters in URL
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped, "g");
    const matches = content.match(re);

    if (matches) {
      content = content.replace(re, info.localPath);
      replaceCount += matches.length;
    }
  }

  if (replaceCount > 0) {
    await writeFile(filepath, content, "utf-8");
    report.replaced.push({ file: rel, count: replaceCount });
    report.filesModified.add(rel);
    console.log(`  ${rel}: ${replaceCount} 箇所を置換`);
  }
}

console.log();

// Final report
console.log(`${"═".repeat(60)}`);
console.log("  完了レポート");
console.log(`${"═".repeat(60)}\n`);

console.log(`ダウンロード : ${report.downloaded.length} / ${uniqueUrls.length} 枚`);
console.log(`置換ファイル : ${report.filesModified.size} ファイル`);
console.log(`置換箇所     : ${report.replaced.reduce((s, r) => s + r.count, 0)} 箇所`);

if (report.errors.length) {
  console.log(`\n## エラー: ${report.errors.length} 件`);
  report.errors.forEach((e) => {
    const shortUrl = e.url.length > 60 ? e.url.slice(0, 57) + "..." : e.url;
    console.log(`  ${shortUrl} → ${e.error}`);
  });
}

if (report.replaced.length) {
  console.log("\n## 置換済みファイル一覧");
  report.replaced.forEach((r) => console.log(`  ${r.file} (${r.count} 箇所)`));
}

console.log();
