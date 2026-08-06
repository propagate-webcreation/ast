/**
 * text-wrap-cleanup.mjs
 *
 * globals.css の text-wrap: balance/pretty（見出しのみ auto-phrase）を前提に、
 * 不要な手動改行・禁止プロパティを自動検出 & 除去する。
 *
 * Usage:
 *   node .cursor/skills/text-wrap-cleanup/scripts/cleanup.mjs          # dry-run (表示のみ)
 *   node .cursor/skills/text-wrap-cleanup/scripts/cleanup.mjs --apply  # 実際に書き換え
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const DRY = !process.argv.includes("--apply");

/* ── scan targets ── */
async function collectTsx(dir) {
  const files = [];
  if (!existsSync(dir)) return files;
  for (const e of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (!e.isFile()) continue;
    const full = join(e.parentPath ?? e.path, e.name);
    if (/\.tsx?$/.test(e.name) && !full.includes("node_modules")) files.push(full);
  }
  return files;
}

/* ── transformation rules ── */

// 1. Bare <br /> without className → remove
//    Keep: <br className="md:hidden" /> / <br className="hidden md:inline" />
const RE_BARE_BR = /<br\s*\/?>(?![^<]*className)/g;

// More precise: match <br /> or <br/> or <br> that do NOT have attributes
const RE_BR_NO_ATTR = /<br\s*\/?>/g;
function isBareBreak(line) {
  // h1 は globals.css で balance をかけない。キャッチコピー用の素の <br> を除去しない
  if (/<h1\b/i.test(line)) return false;
  // If line contains className on a <br>, it's intentional
  return RE_BR_NO_ATTR.test(line) && !/<br\s+className/.test(line);
}

// 2. Forbidden Tailwind classes (always remove)
const FORBIDDEN_CLASSES = [
  "break-all",
  "break-keep",
  "overflow-x-hidden",
];

// 3. Nowrap classes (remove on text elements, flag on nav/button)
const NOWRAP_CLASSES = [
  "whitespace-nowrap",
  "text-nowrap",
];

// 4. Redundant utilities (globals.css already handles)
const REDUNDANT_CLASSES = [
  "text-balance",
  "text-pretty",
  "text-wrap-balance",
  "text-wrap-pretty",
];

/* ── class removal helper ── */
function removeClasses(line, classesToRemove) {
  let changed = false;
  let result = line;
  for (const cls of classesToRemove) {
    const re = new RegExp(`(?<=\\s|"|')${cls}(?=\\s|"|'|$)`, "g");
    if (re.test(result)) {
      result = result.replace(re, "");
      changed = true;
    }
  }
  // clean up double spaces in className strings
  if (changed) {
    result = result.replace(/(" ) +/g, '"').replace(/ +(")/g, '"');
    result = result.replace(/  +/g, " ");
    result = result.replace(/className=" *"/g, "");
    result = result.replace(/ +>/g, ">");
    result = result.replace(/className={` *`}/g, "");
  }
  return { result, changed };
}

/* ── determine if nowrap is intentional (nav, button, badge, label) ── */
function isNowrapIntentional(line) {
  const ctx = line.toLowerCase();
  return /(<nav|<button|role="button"|<a\s|<span.*label|badge|<th|<td)/.test(ctx);
}

/* ── main ── */
const appDir = join(ROOT, "app");
const files = await collectTsx(appDir);

const report = {
  brRemoved: [],     // { file, line, before }
  classRemoved: [],  // { file, line, classes, before }
  nowrapFlagged: [],  // { file, line, before } — manual review
  flexMinW0: [],     // { file, line, before } — Flex child missing min-w-0
  spanFragment: [],  // { file, line, before } — short span splitting Japanese text
  divText: [],       // { file, line, before } — text content in <div> instead of <p>
  cssUnlayered: [],  // { file, line, before } — unlayered element selectors in globals.css
  filesModified: new Set(),
};

for (const filepath of files) {
  const rel = relative(ROOT, filepath);
  const content = await readFile(filepath, "utf-8");
  const lines = content.split("\n");
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const original = lines[i];
    let current = original;
    const lineNum = i + 1;

    // 1. Bare <br> removal
    if (isBareBreak(current)) {
      const before = current.trimStart();
      current = current.replace(RE_BR_NO_ATTR, "");
      // If line becomes empty/whitespace-only after removal, mark for cleanup
      if (current.trim() === "") {
        current = null; // will be filtered out
      }
      report.brRemoved.push({ file: rel, line: lineNum, before });
      modified = true;
    }

    // 2. Forbidden classes
    if (current !== null) {
      const { result, changed } = removeClasses(current, FORBIDDEN_CLASSES);
      if (changed) {
        report.classRemoved.push({
          file: rel,
          line: lineNum,
          classes: FORBIDDEN_CLASSES.filter((c) => original.includes(c)),
          before: original.trimStart(),
        });
        current = result;
        modified = true;
      }
    }

    // 3. Nowrap — remove or flag
    if (current !== null && NOWRAP_CLASSES.some((c) => current.includes(c))) {
      if (isNowrapIntentional(current)) {
        report.nowrapFlagged.push({ file: rel, line: lineNum, before: original.trimStart() });
      } else {
        const { result, changed } = removeClasses(current, NOWRAP_CLASSES);
        if (changed) {
          report.classRemoved.push({
            file: rel,
            line: lineNum,
            classes: NOWRAP_CLASSES.filter((c) => original.includes(c)),
            before: original.trimStart(),
          });
          current = result;
          modified = true;
        }
      }
    }

    // 4. Redundant utilities
    if (current !== null) {
      const { result, changed } = removeClasses(current, REDUNDANT_CLASSES);
      if (changed) {
        report.classRemoved.push({
          file: rel,
          line: lineNum,
          classes: REDUNDANT_CLASSES.filter((c) => original.includes(c)),
          before: original.trimStart(),
        });
        current = result;
        modified = true;
      }
    }

    lines[i] = current;
  }

  // ── file-level analysis (warnings only, no auto-fix) ──

  // 5. Flex children missing min-w-0
  //    Heuristic: find lines with "flex" class, scan nearby lines for text
  //    elements without min-w-0 / overflow-hidden
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (ln === null) continue;
    // Is this a flex container? (has "flex" as a class, not just part of "flex-col" etc.)
    if (!/className=.*(?:^|[\s"'`])flex(?:[\s"'`]|$)/.test(ln)) continue;
    // Don't flag flex-col (vertical layout is less prone to this issue)
    if (/flex-col/.test(ln)) continue;

    // Scan next 30 lines for text elements without min-w-0
    const blockEnd = Math.min(i + 30, lines.length);
    let hasTextChild = false;
    let hasMinW0 = false;
    let nestDepth = 0;

    for (let j = i + 1; j < blockEnd; j++) {
      const check = lines[j];
      if (check === null) continue;
      // Track nesting: stop if we leave this block
      nestDepth += (check.match(/<[a-zA-Z]/g) || []).length;
      nestDepth -= (check.match(/<\//g) || []).length;
      if (nestDepth < -1) break;

      if (/min-w-0|min-width:\s*0|overflow-hidden|overflow-x-hidden/.test(check)) {
        hasMinW0 = true;
        break;
      }
      if (/<(h[1-6]|p|li)\b/.test(check)) {
        hasTextChild = true;
      }
    }

    if (hasTextChild && !hasMinW0) {
      report.flexMinW0.push({
        file: rel,
        line: i + 1,
        before: ln.trimStart().slice(0, 100),
      });
    }
  }

  // 6. Short <span> fragmenting Japanese text
  //    Detect: <span>1〜3 CJK chars</span> without className (no styling purpose)
  const RE_SPAN_FRAGMENT =
    /<span>[\s]*([\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF]{1,3})[\s]*<\/span>/g;
  const RE_SPAN_STYLED_FRAGMENT =
    /<span\s+className=[^>]+>([\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF]{1,3})<\/span>/g;

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (ln === null) continue;

    // Classless short span — almost certainly a fragment
    if (RE_SPAN_FRAGMENT.test(ln)) {
      report.spanFragment.push({
        file: rel,
        line: i + 1,
        before: ln.trimStart().slice(0, 100),
        severity: "high",
      });
      RE_SPAN_FRAGMENT.lastIndex = 0;
    }

    // Styled short span — might be intentional, but flag as low severity
    // Exclude common styling patterns: icon wrappers, sr-only, etc.
    if (RE_SPAN_STYLED_FRAGMENT.test(ln)) {
      if (!/sr-only|icon|aria-|role=/.test(ln)) {
        report.spanFragment.push({
          file: rel,
          line: i + 1,
          before: ln.trimStart().slice(0, 100),
          severity: "low",
        });
      }
      RE_SPAN_STYLED_FRAGMENT.lastIndex = 0;
    }
  }

  // 7. Text content in <div> that should be <p>
  //    Detect: <div ...>Japanese text (10+ chars)</div> on same or adjacent lines
  //    Exclude: divs that are clearly layout containers (flex, grid, gap, etc.)
  const RE_DIV_OPEN = /<div\b([^>]*)>/;
  const LAYOUT_CLASSES = /flex|grid|gap-|space-|items-|justify-|col-span|row-span|relative|absolute|fixed|sticky/;
  const CJK_RANGE = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF]/;

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (ln === null) continue;
    const divMatch = ln.match(RE_DIV_OPEN);
    if (!divMatch) continue;

    const attrs = divMatch[1] || "";
    // Skip layout-purpose divs
    if (LAYOUT_CLASSES.test(attrs)) continue;
    // Skip divs that already have text-wrap overrides
    if (/text-wrap|auto-phrase|text-pretty/.test(attrs)) continue;

    // Check if this div or next few lines contain significant Japanese text
    const window = Math.min(i + 5, lines.length);
    let textContent = "";
    for (let j = i; j < window; j++) {
      if (lines[j] === null) continue;
      // Strip HTML tags to get raw text
      textContent += lines[j].replace(/<[^>]+>/g, " ");
    }

    // Count CJK characters
    const cjkChars = (textContent.match(new RegExp(CJK_RANGE.source, "g")) || []).length;
    // Only flag if there's substantial Japanese text (10+ chars) — not just a label
    if (cjkChars >= 10) {
      // Check it's not wrapping child p/li/h elements
      let hasSemanticChild = false;
      for (let j = i + 1; j < window; j++) {
        if (lines[j] === null) continue;
        if (/<(p|li|h[1-6]|ul|ol)\b/.test(lines[j])) {
          hasSemanticChild = true;
          break;
        }
      }
      if (!hasSemanticChild) {
        report.divText.push({
          file: rel,
          line: i + 1,
          before: ln.trimStart().slice(0, 100),
        });
      }
    }
  }

  if (modified) {
    const cleaned = lines.filter((l) => l !== null).join("\n");
    report.filesModified.add(rel);
    if (!DRY) {
      await writeFile(filepath, cleaned, "utf-8");
    }
  }
}

/* ── 8. globals.css unlayered element selector scan ── */
const cssFiles = [
  join(ROOT, "app/globals.css"),
  join(ROOT, "src/app/globals.css"),
  join(ROOT, "styles/globals.css"),
];

// Allowed unlayered selectors (initial setup only)
const ALLOWED_SELECTORS = /^(html|h[1-6]|p,\s*li|:root|@|\/\*|\*|\.scroll-animate)/;
// Properties that are safe even if unlayered (font-family, text-wrap, word-break, scroll-behavior)
const SAFE_PROPS = /font-family|text-wrap|word-break|scroll-behavior|-webkit-text-size-adjust|opacity|transform|transition/;

for (const cssPath of cssFiles) {
  if (!existsSync(cssPath)) continue;
  const cssContent = await readFile(cssPath, "utf-8");
  const cssRel = relative(ROOT, cssPath);
  const cssLines = cssContent.split("\n");

  let inLayer = 0;
  let inComment = false;
  let currentSelector = "";

  for (let i = 0; i < cssLines.length; i++) {
    let ln = cssLines[i];

    // Strip block comments (handles single-line and multi-line)
    if (inComment) {
      if (ln.includes("*/")) {
        ln = ln.slice(ln.indexOf("*/") + 2);
        inComment = false;
      } else {
        continue;
      }
    }
    // Remove inline comments: /* ... */ on the same line
    ln = ln.replace(/\/\*.*?\*\//g, "");
    if (ln.includes("/*")) {
      ln = ln.slice(0, ln.indexOf("/*"));
      inComment = true;
    }
    if (!ln.trim()) continue;

    // Track @layer / @theme nesting (opens a layer scope)
    if (/@layer\b/.test(ln)) inLayer++;
    if (/@theme\b/.test(ln)) inLayer++;
    if (/@media\b/.test(ln)) {
      // @media doesn't create a layer, but skip selector detection on this line
      const opens = (ln.match(/\{/g) || []).length;
      const closes = (ln.match(/\}/g) || []).length;
      if (inLayer > 0) inLayer += opens - closes;
      continue;
    }

    const opens = (ln.match(/\{/g) || []).length;
    const closes = (ln.match(/\}/g) || []).length;

    // Detect selector lines (not inside @layer/@theme)
    if (inLayer === 0 && /^[a-z]/.test(ln.trim()) && ln.includes("{")) {
      currentSelector = ln.trim();
      if (ALLOWED_SELECTORS.test(currentSelector)) {
        // Still track braces even for allowed selectors
      } else {
        const blockEnd = Math.min(i + 20, cssLines.length);
        for (let j = i; j < blockEnd; j++) {
          const prop = cssLines[j].replace(/\/\*.*?\*\//g, "");
          if (prop.includes("}")) break;
          if (/:\s*[^;]+;/.test(prop) && !SAFE_PROPS.test(prop)) {
            report.cssUnlayered.push({
              file: cssRel,
              line: i + 1,
              before: currentSelector.slice(0, 80),
              property: prop.trim().slice(0, 60),
            });
            break;
          }
        }
      }
    }

    // Adjust layer depth based on braces
    if (inLayer > 0) {
      inLayer += opens - closes;
      if (inLayer < 0) inLayer = 0;
    }
  }
}

/* ── output ── */
console.log(`\n${"═".repeat(60)}`);
console.log(DRY ? "  DRY RUN（--apply で実際に書き換え）" : "  ✅ APPLIED — ファイルを書き換え済み");
console.log(`${"═".repeat(60)}\n`);

if (report.brRemoved.length) {
  console.log(`## 除去した <br /> : ${report.brRemoved.length} 件`);
  console.log("| # | ファイル | 行 | 元コード |");
  console.log("|---|---------|-----|---------|");
  report.brRemoved.forEach((r, i) =>
    console.log(`| ${i + 1} | ${r.file} | ${r.line} | \`${r.before.slice(0, 80)}\` |`),
  );
  console.log();
}

if (report.classRemoved.length) {
  console.log(`## 除去したクラス : ${report.classRemoved.length} 件`);
  console.log("| # | ファイル | 行 | 除去 | 元コード |");
  console.log("|---|---------|-----|------|---------|");
  report.classRemoved.forEach((r, i) =>
    console.log(
      `| ${i + 1} | ${r.file} | ${r.line} | ${r.classes.join(", ")} | \`${r.before.slice(0, 60)}\` |`,
    ),
  );
  console.log();
}

if (report.nowrapFlagged.length) {
  console.log(`## 要確認（nowrap — 意図的な可能性） : ${report.nowrapFlagged.length} 件`);
  console.log("| # | ファイル | 行 | コード |");
  console.log("|---|---------|-----|--------|");
  report.nowrapFlagged.forEach((r, i) =>
    console.log(`| ${i + 1} | ${r.file} | ${r.line} | \`${r.before.slice(0, 80)}\` |`),
  );
  console.log();
}

if (report.flexMinW0.length) {
  console.log(`## ⚠ Flex 子に min-w-0 なし : ${report.flexMinW0.length} 件`);
  console.log("| # | ファイル | 行 | コード |");
  console.log("|---|---------|-----|--------|");
  report.flexMinW0.forEach((r, i) =>
    console.log(`| ${i + 1} | ${r.file} | ${r.line} | \`${r.before.slice(0, 80)}\` |`),
  );
  console.log("→ テキストを含む Flex 子に `min-w-0` を追加してください\n");
}

if (report.spanFragment.length) {
  const high = report.spanFragment.filter((r) => r.severity === "high");
  const low = report.spanFragment.filter((r) => r.severity === "low");
  if (high.length) {
    console.log(`## ⚠ 短い <span> がテキストを分断 : ${high.length} 件`);
    console.log("| # | ファイル | 行 | コード |");
    console.log("|---|---------|-----|--------|");
    high.forEach((r, i) =>
      console.log(`| ${i + 1} | ${r.file} | ${r.line} | \`${r.before.slice(0, 80)}\` |`),
    );
    console.log("→ className なしの短い <span> は auto-phrase を阻害します。span を除去してください\n");
  }
  if (low.length) {
    console.log(`## 💡 短い styled <span>（確認推奨） : ${low.length} 件`);
    console.log("| # | ファイル | 行 | コード |");
    console.log("|---|---------|-----|--------|");
    low.forEach((r, i) =>
      console.log(`| ${i + 1} | ${r.file} | ${r.line} | \`${r.before.slice(0, 80)}\` |`),
    );
    console.log("→ スタイル目的なら OK。不要なら span を除去して auto-phrase を活かしてください\n");
  }
}

if (report.divText.length) {
  console.log(`## ⚠ <div> に本文テキスト（<p> にすべき） : ${report.divText.length} 件`);
  console.log("| # | ファイル | 行 | コード |");
  console.log("|---|---------|-----|--------|");
  report.divText.forEach((r, i) =>
    console.log(`| ${i + 1} | ${r.file} | ${r.line} | \`${r.before.slice(0, 80)}\` |`),
  );
  console.log("→ <div> を <p> に変更（[text-wrap:pretty] の追加は禁止 — iOS Safari で右余白がガタつく）\n");
}

if (report.cssUnlayered.length) {
  console.log(`## 🔴 globals.css に unlayered 要素セレクタ（Tailwind を上書き） : ${report.cssUnlayered.length} 件`);
  console.log("| # | ファイル | 行 | セレクタ | プロパティ |");
  console.log("|---|---------|-----|---------|-----------|");
  report.cssUnlayered.forEach((r, i) =>
    console.log(`| ${i + 1} | ${r.file} | ${r.line} | \`${r.before}\` | \`${r.property}\` |`),
  );
  console.log("→ 削除するか、@layer base { ... } の中に移動してください\n");
}

const total = report.brRemoved.length + report.classRemoved.length;
const warnings = report.nowrapFlagged.length + report.flexMinW0.length + report.spanFragment.length + report.divText.length + report.cssUnlayered.length;
console.log(`─── Summary ───`);
console.log(`ファイル数 : ${report.filesModified.size}`);
console.log(`自動修正   : ${total}`);
console.log(`要確認     : ${report.nowrapFlagged.length} (nowrap)`);
console.log(`⚠ 警告    : ${report.flexMinW0.length} (flex min-w-0) / ${report.spanFragment.length} (span 分断) / ${report.divText.length} (div 本文) / ${report.cssUnlayered.length} (@layer)`);
if (DRY && total > 0) {
  console.log(`\n👉  node .cursor/skills/text-wrap-cleanup/scripts/cleanup.mjs --apply  で適用`);
}
if (report.flexMinW0.length || report.spanFragment.filter((r) => r.severity === "high").length || report.divText.length || report.cssUnlayered.length) {
  console.log(`\n⚠  上記の警告は自動修正されません。手動で対応してください`);
}
