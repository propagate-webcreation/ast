#!/usr/bin/env node

/**
 * clean-prohibited-libs.js
 *
 * DefaultSetting から package.json / .cursor/ を pull した後に実行し、
 * 禁止ライブラリ（lenis, swiper 等）のコード残骸を自動除去する。
 *
 * Usage:
 *   node scripts/clean-prohibited-libs.js
 */

import fs from "fs";
import path from "path";

const ROOT = process.cwd();

// ── 禁止ライブラリ定義 ──────────────────────────────
const PROHIBITED = [
  {
    name: "Lenis",
    imports: [/from\s+["']lenis\/react["']/, /from\s+["']lenis["']/, /from\s+["']@studio-freight\/lenis["']/],
    wrapperTags: ["SmoothScroll", "ReactLenis"],
    componentFiles: ["SmoothScroll.tsx", "SmoothScroll.jsx"],
    packages: ["lenis", "@studio-freight/lenis"],
  },
  {
    name: "Swiper",
    imports: [/from\s+["']swiper/, /import\s+["']swiper\//],
    wrapperTags: ["Swiper", "SwiperSlide"],
    componentFiles: [],
    packages: ["swiper"],
  },
  {
    name: "Embla Carousel",
    imports: [/from\s+["']embla-carousel/],
    wrapperTags: [],
    componentFiles: [],
    packages: ["embla-carousel-react"],
  },
  {
    name: "Splide",
    imports: [/from\s+["']@splidejs/],
    wrapperTags: [],
    componentFiles: [],
    packages: ["@splidejs/react-splide"],
  },
  {
    name: "react-slick",
    imports: [/from\s+["']react-slick["']/],
    wrapperTags: [],
    componentFiles: [],
    packages: ["react-slick"],
  },
  {
    name: "Marquee",
    imports: [/from\s+["']react-fast-marquee["']/],
    wrapperTags: ["Marquee"],
    componentFiles: [],
    packages: ["react-fast-marquee"],
  },
];

let changesMade = false;

// ── ユーティリティ ──────────────────────────────────
function walkDir(dir, ext, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") continue;
      walkDir(full, ext, results);
    } else if (ext.some((e) => entry.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

// ── 1. コンポーネントファイルの削除 ─────────────────
function deleteComponentFiles() {
  const filesToDelete = PROHIBITED.flatMap((lib) => lib.componentFiles);
  if (filesToDelete.length === 0) return;

  const allFiles = walkDir(path.join(ROOT, "app"), [".tsx", ".jsx", ".ts", ".js"]);
  const compFiles = walkDir(path.join(ROOT, "components"), [".tsx", ".jsx", ".ts", ".js"]);
  const allTargets = [...allFiles, ...compFiles];

  for (const filePath of allTargets) {
    const basename = path.basename(filePath);
    if (filesToDelete.includes(basename)) {
      console.log(`  [DELETE] ${path.relative(ROOT, filePath)}`);
      fs.unlinkSync(filePath);
      changesMade = true;
    }
  }
}

// ── 2. import 文の除去 ──────────────────────────────
function removeProhibitedImports(content, filePath) {
  let modified = content;

  for (const lib of PROHIBITED) {
    for (const pattern of lib.imports) {
      const lines = modified.split("\n");
      const cleaned = lines.filter((line) => {
        if (pattern.test(line)) {
          console.log(`  [REMOVE IMPORT] ${lib.name} in ${path.relative(ROOT, filePath)}`);
          changesMade = true;
          return false;
        }
        return true;
      });
      modified = cleaned.join("\n");
    }
  }

  return modified;
}

// ── 3. ラッパータグの除去（<Wrapper>children</Wrapper> → children）──
function removeWrapperTags(content, filePath) {
  let modified = content;

  const allTags = PROHIBITED.flatMap((lib) =>
    lib.wrapperTags.map((tag) => ({ tag, libName: lib.name }))
  );

  for (const { tag } of allTags) {
    // Case A: Inline wrapper on single line — <Tag ...>{children}</Tag> → {children}
    const inlineRe = new RegExp(
      `^([ \\t]*)<${tag}[^>]*>(.+)</${tag}>`,
      "gm"
    );
    if (inlineRe.test(modified)) {
      modified = modified.replace(inlineRe, "$1$2");
      console.log(`  [UNWRAP INLINE] <${tag}> in ${path.relative(ROOT, filePath)}`);
      changesMade = true;
    }

    // Case B: Self-closing — <Tag ... /> → remove line
    const selfClosingRe = new RegExp(`^[ \\t]*<${tag}[^>]*/>[ \\t]*$\\n?`, "gm");
    if (selfClosingRe.test(modified)) {
      modified = modified.replace(selfClosingRe, "");
      console.log(`  [REMOVE TAG] <${tag} /> in ${path.relative(ROOT, filePath)}`);
      changesMade = true;
    }

    // Case C: Multiline wrapper — remove opening/closing tag lines, dedent children
    const openLineRe = new RegExp(`^([ \\t]*)<${tag}[^>]*>[ \\t]*$`, "m");
    const openMatch = modified.match(openLineRe);
    if (openMatch) {
      const wrapperIndent = openMatch[1];
      // Remove opening tag line
      modified = modified.replace(new RegExp(`^[ \\t]*<${tag}[^>]*>[ \\t]*\\n`, "m"), "");
      // Remove closing tag line
      modified = modified.replace(new RegExp(`^[ \\t]*</${tag}>[ \\t]*\\n?`, "m"), "");
      // Dedent children that were indented one level deeper
      const childIndent = wrapperIndent + "  ";
      const dedentRe = new RegExp(`^${childIndent}`, "gm");
      modified = modified.replace(dedentRe, wrapperIndent);
      console.log(`  [UNWRAP] <${tag}> in ${path.relative(ROOT, filePath)}`);
      changesMade = true;
    }
  }

  return modified;
}

// ── 4. 未使用 import の除去（削除したコンポーネントの import が残る場合）──
function removeOrphanImports(content, filePath) {
  let modified = content;

  const allTags = PROHIBITED.flatMap((lib) => lib.wrapperTags);
  const allComponentNames = PROHIBITED.flatMap((lib) =>
    lib.componentFiles.map((f) => f.replace(/\.(tsx|jsx)$/, ""))
  );
  const namesToCheck = [...new Set([...allTags, ...allComponentNames])];

  for (const name of namesToCheck) {
    // Match: import { Name } from "..." or import Name from "..."
    const importPattern = new RegExp(
      `^\\s*import\\s+(?:\\{\\s*${name}\\s*\\}|${name})\\s+from\\s+["'][^"']+["'];?\\s*$`,
      "gm"
    );
    if (importPattern.test(modified)) {
      modified = modified.replace(importPattern, "");
      console.log(`  [REMOVE ORPHAN IMPORT] ${name} in ${path.relative(ROOT, filePath)}`);
      changesMade = true;
    }
  }

  // Clean up multiple consecutive blank lines
  modified = modified.replace(/\n{3,}/g, "\n\n");

  return modified;
}

// ── 5. package.json から禁止パッケージを除去 ────────
function cleanPackageJson() {
  const pkgPath = path.join(ROOT, "package.json");
  if (!fs.existsSync(pkgPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const allPackages = PROHIBITED.flatMap((lib) => lib.packages);

  for (const section of ["dependencies", "devDependencies"]) {
    if (!pkg[section]) continue;
    for (const pkgName of allPackages) {
      if (pkg[section][pkgName]) {
        console.log(`  [REMOVE PKG] ${pkgName} from ${section}`);
        delete pkg[section][pkgName];
        changesMade = true;
      }
    }
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

// ── メイン ──────────────────────────────────────────
function main() {
  console.log("\n=== clean-prohibited-libs ===\n");

  // Step 1: Delete component files first
  deleteComponentFiles();

  // Step 2-4: Process all source files
  const sourceFiles = [
    ...walkDir(path.join(ROOT, "app"), [".tsx", ".jsx", ".ts", ".js"]),
    ...walkDir(path.join(ROOT, "components"), [".tsx", ".jsx", ".ts", ".js"]),
  ];

  for (const filePath of sourceFiles) {
    if (!fs.existsSync(filePath)) continue; // may have been deleted in step 1
    const original = fs.readFileSync(filePath, "utf-8");
    let content = original;

    content = removeProhibitedImports(content, filePath);
    content = removeWrapperTags(content, filePath);
    content = removeOrphanImports(content, filePath);

    if (content !== original) {
      fs.writeFileSync(filePath, content);
    }
  }

  // Step 5: Clean package.json
  cleanPackageJson();

  if (changesMade) {
    console.log("\n  Done. Run `npm install` to regenerate package-lock.json.\n");
  } else {
    console.log("  No prohibited libraries found. All clean.\n");
  }
}

main();
