/**
 * auto-phrase setup — globals.css + layout.tsx を自動パッチ
 *
 * 1. globals.css に text-wrap / auto-phrase CSS を追加（未設定の場合）
 * 2. layout.tsx の <html> に lang="ja" を設定（未設定 or lang="en" の場合）
 *
 * Usage:
 *   node .cursor/skills/text-wrap-cleanup/scripts/setup.mjs          # dry-run
 *   node .cursor/skills/text-wrap-cleanup/scripts/setup.mjs --apply  # 実際に書き換え
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DRY = !process.argv.includes("--apply");

const CSS_BLOCK = `
/* テキスト折り返し最適化 ※必須 — 削除・変更禁止
   html lang="ja" が必須。未対応ブラウザでは通常改行にフォールバック
   h1 はヒーローキャッチコピー等の違和感防止のため balance / auto-phrase を適用しない
   本文（p, li）は iOS Safari で text-wrap: pretty が右側余白をガタつかせるため適用しない */
h1 {
  text-wrap: wrap;
  word-break: normal;
}
h2, h3, h4, h5, h6 {
  text-wrap: balance;
  word-break: auto-phrase;
}
`;

let changes = 0;

/* ─────────────────────────────────────── */
/*  1. globals.css                         */
/* ─────────────────────────────────────── */
async function patchGlobalsCss() {
  const candidates = [
    "app/globals.css",
    "src/app/globals.css",
    "styles/globals.css",
    "src/styles/globals.css",
  ];

  let cssPath = null;
  for (const c of candidates) {
    const full = join(ROOT, c);
    if (existsSync(full)) { cssPath = full; break; }
  }

  if (!cssPath) {
    console.log("⚠️  globals.css が見つかりません。以下を確認してください:");
    candidates.forEach((c) => console.log(`   - ${c}`));
    return;
  }

  const content = await readFile(cssPath, "utf-8");
  const rel = cssPath.replace(ROOT + "/", "");

  if (content.includes("auto-phrase")) {
    console.log(`✅ ${rel}: auto-phrase 設定済み — スキップ`);
    return;
  }

  if (content.includes("text-wrap")) {
    console.log(`⚠️  ${rel}: text-wrap はあるが auto-phrase がない — 手動確認推奨`);
    return;
  }

  // 挿入位置を決定
  let insertIndex;
  let insertAfter;

  // @theme ブロックの後に入れる
  const themeEnd = content.lastIndexOf("}");
  const themeMatch = content.match(/@theme\s*\{[^}]*\}/s);
  if (themeMatch) {
    insertIndex = themeMatch.index + themeMatch[0].length;
    insertAfter = "@theme { ... }";
  }
  // html { scroll-behavior } の後に入れる
  else {
    const scrollMatch = content.match(/html\s*\{[^}]*scroll-behavior[^}]*\}/);
    if (scrollMatch) {
      insertIndex = scrollMatch.index + scrollMatch[0].length;
      insertAfter = "html { scroll-behavior }";
    }
    // @import の後に入れる
    else {
      const importMatches = [...content.matchAll(/@import\s+[^;]+;/g)];
      if (importMatches.length > 0) {
        const last = importMatches[importMatches.length - 1];
        insertIndex = last.index + last[0].length;
        insertAfter = "@import";
      }
      // 末尾に追加
      else {
        insertIndex = content.length;
        insertAfter = "ファイル末尾";
      }
    }
  }

  const patched = content.slice(0, insertIndex) + "\n" + CSS_BLOCK + content.slice(insertIndex);

  console.log(`📝 ${rel}: CSS追加予定（${insertAfter} の後）`);
  console.log(`   + h2-h6 { text-wrap: balance; word-break: auto-phrase; }`);
  console.log(`   ※ p, li には text-wrap を適用しない（iOS Safari の pretty 不具合回避）`);

  if (!DRY) {
    await writeFile(cssPath, patched, "utf-8");
    console.log(`   ✅ 書き込み完了`);
  }
  changes++;
}

/* ─────────────────────────────────────── */
/*  2. layout.tsx — lang="ja"              */
/* ─────────────────────────────────────── */
async function patchLayout() {
  const candidates = [
    "app/layout.tsx",
    "src/app/layout.tsx",
    "app/layout.jsx",
    "src/app/layout.jsx",
  ];

  let layoutPath = null;
  for (const c of candidates) {
    const full = join(ROOT, c);
    if (existsSync(full)) { layoutPath = full; break; }
  }

  if (!layoutPath) {
    console.log('⚠️  layout.tsx が見つかりません');
    return;
  }

  const content = await readFile(layoutPath, "utf-8");
  const rel = layoutPath.replace(ROOT + "/", "");

  if (content.includes('lang="ja"') || content.includes("lang='ja'") || content.includes("lang={`ja`}")) {
    console.log(`✅ ${rel}: lang="ja" 設定済み — スキップ`);
    return;
  }

  let patched;

  // lang="en" → lang="ja" に置換
  if (content.includes('lang="en"')) {
    patched = content.replace('lang="en"', 'lang="ja"');
    console.log(`📝 ${rel}: lang="en" → lang="ja" に変更`);
  }
  // lang 属性なし → 追加
  else if (content.match(/<html\b/)) {
    patched = content.replace(/<html\b/, '<html lang="ja"');
    console.log(`📝 ${rel}: <html> に lang="ja" を追加`);
  }
  else {
    console.log(`⚠️  ${rel}: <html> タグが見つかりません — 手動確認推奨`);
    return;
  }

  if (!DRY) {
    await writeFile(layoutPath, patched, "utf-8");
    console.log(`   ✅ 書き込み完了`);
  }
  changes++;
}

/* ─────────────────────────────────────── */
/*  3. dd, dt, td, th の追加確認            */
/* ─────────────────────────────────────── */
async function checkExtendedSelectors() {
  const candidates = [
    "app/globals.css",
    "src/app/globals.css",
  ];

  let cssPath = null;
  for (const c of candidates) {
    const full = join(ROOT, c);
    if (existsSync(full)) { cssPath = full; break; }
  }
  if (!cssPath) return;

  const content = await readFile(cssPath, "utf-8");

  // 本文（p, li）に text-wrap: pretty が当たっている場合は警告
  if (/\bp,\s*li\s*\{[^}]*text-wrap:\s*pretty/.test(content)) {
    console.log(`\n⚠️  ${cssPath.replace(ROOT + "/", "")}: p, li { text-wrap: pretty } が残っています`);
    console.log(`   iOS Safari で右側余白がガタつく原因になるため削除を推奨します`);
  }
}

/* ─────────────────────────────────────── */
/*  Main                                   */
/* ─────────────────────────────────────── */
console.log(`\n${"═".repeat(60)}`);
console.log(DRY ? "  DRY RUN（--apply で実際に書き換え）" : "  ✅ APPLY モード");
console.log(`${"═".repeat(60)}\n`);

await patchGlobalsCss();
console.log();
await patchLayout();
await checkExtendedSelectors();

console.log(`\n─── Setup Summary ───`);
console.log(`変更箇所: ${changes}`);

if (DRY && changes > 0) {
  console.log(`\n👉  node .cursor/skills/text-wrap-cleanup/scripts/setup.mjs --apply  で適用`);
  console.log(`    その後 cleanup.mjs --apply で不要な <br> を除去`);
}
if (!DRY && changes > 0) {
  console.log(`\n👉  次のステップ:`);
  console.log(`    node .cursor/skills/text-wrap-cleanup/scripts/cleanup.mjs          # dry-run`);
  console.log(`    node .cursor/skills/text-wrap-cleanup/scripts/cleanup.mjs --apply  # 適用`);
}
if (changes === 0) {
  console.log(`すべて設定済みです 🎉`);
}
