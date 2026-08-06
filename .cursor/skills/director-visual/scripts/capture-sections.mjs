/**
 * capture-sections.mjs — Section-by-section screenshot capture
 *
 * Captures individual screenshots for each <section>, <header>, and <footer>
 * on every page, for SP (375px) and/or PC (1280px) viewports.
 *
 * Output structure:
 *   {OUTPUT_DIR}/
 *     sp/home/00-fullpage.png
 *     sp/home/01-header.png
 *     sp/home/02-hero.png
 *     ...
 *     pc/home/00-fullpage.png
 *     pc/home/01-header.png
 *     ...
 *     manifest.json
 *
 * Environment variables:
 *   PREVIEW_BASE_URL    Override auto-detected dev server URL
 *   PREVIEW_ROUTES      Comma-separated routes (default: auto-detect from app/)
 *   CAPTURE_VIEWPORTS   "sp", "pc", or "sp,pc" (default: "sp,pc")
 *   OUTPUT_DIR          Relative to project root (default: .cache/visual-review)
 */
import { chromium } from "playwright";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();

/* ------------------------------------------------------------------ */
/*  Port auto-detection                                               */
/*  Finds the dev server running in THIS project directory.           */
/*  Priority: PREVIEW_BASE_URL env > .next server port file > lsof   */
/* ------------------------------------------------------------------ */
function detectDevPort() {
  // 1. Check .next server port file (written by next dev)
  const portFile = join(ROOT, ".next", "server.port");
  if (existsSync(portFile)) {
    try {
      const port = Number(
        execSync(`cat "${portFile}"`, { encoding: "utf-8", timeout: 2000 }).trim(),
      );
      if (port > 0) {
        execSync(`curl -sf -o /dev/null --max-time 2 http://127.0.0.1:${port}`, {
          timeout: 5000,
        });
        return port;
      }
    } catch {}
  }

  // 2. Fallback: scan Node processes listening on TCP ports
  try {
    const raw = execSync(
      `lsof -iTCP -sTCP:LISTEN -P -n 2>/dev/null | grep -i node | awk '{print $9}' | grep -oE '[0-9]+$' | sort -un`,
      { encoding: "utf-8", timeout: 5000 },
    ).trim();
    if (!raw) return null;
    for (const p of raw.split("\n").map(Number).filter(Boolean)) {
      try {
        execSync(`curl -sf -o /dev/null --max-time 2 http://127.0.0.1:${p}`, {
          timeout: 5000,
        });
        return p;
      } catch {}
    }
    return null;
  } catch {
    return null;
  }
}

let BASE;
if (process.env.PREVIEW_BASE_URL) {
  BASE = process.env.PREVIEW_BASE_URL;
  console.log(`🔗 Using PREVIEW_BASE_URL: ${BASE}`);
} else {
  const port = detectDevPort();
  if (port) {
    BASE = `http://127.0.0.1:${port}`;
    console.log(`🔍 Dev server detected on port ${port}`);
  } else {
    BASE = "http://127.0.0.1:3000";
    console.log(`⚠️  No dev server detected — falling back to port 3000`);
  }
}

const OUT = join(ROOT, process.env.OUTPUT_DIR || ".cache/visual-review");

const VP_DEFS = {
  sp: { width: 375, height: 844 },
  pc: { width: 1280, height: 800 },
};

const vpList = (process.env.CAPTURE_VIEWPORTS || "sp,pc")
  .split(",")
  .map((v) => v.trim())
  .filter((v) => VP_DEFS[v]);

/* ------------------------------------------------------------------ */
/*  Route detection                                                   */
/* ------------------------------------------------------------------ */
async function detectRoutes() {
  const appDir = join(ROOT, "app");
  if (!existsSync(appDir)) return ["/"];

  const skip = new Set([
    "components", "api", "fonts", "lib", "utils", "hooks", "styles", "config",
  ]);
  const routes = ["/"];
  for (const e of await readdir(appDir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    if (e.name.startsWith("(") || e.name.startsWith("_") || e.name.startsWith(".")) continue;
    if (skip.has(e.name)) continue;
    const dir = join(appDir, e.name);
    if (
      existsSync(join(dir, "page.tsx")) ||
      existsSync(join(dir, "page.jsx")) ||
      existsSync(join(dir, "page.js"))
    )
      routes.push(`/${e.name}`);
  }
  return routes;
}

const routes = process.env.PREVIEW_ROUTES
  ? process.env.PREVIEW_ROUTES.split(",").map((r) => r.trim()).filter(Boolean)
  : await detectRoutes();

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function pageName(route) {
  return route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-");
}

function safeName(raw) {
  return raw
    .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30) || "unnamed";
}

function idx(n) {
  return String(n).padStart(2, "0");
}

/* ------------------------------------------------------------------ */
/*  Scroll to reveal IntersectionObserver / FadeIn content             */
/* ------------------------------------------------------------------ */
async function revealPage(page) {
  const STEP = 0.7;
  const PAUSE = 300;
  let prev = 0;

  for (let pass = 0; pass < 4; pass++) {
    const { vh, docH } = await page.evaluate(() => ({
      vh: window.innerHeight,
      docH: document.documentElement.scrollHeight,
    }));
    if (docH <= vh + 2) break;

    const step = Math.max(100, Math.floor(vh * STEP));
    for (let y = 0; y < docH; y += step) {
      await page.evaluate((t) => window.scrollTo({ top: t, behavior: "instant" }), y);
      await page.waitForTimeout(PAUSE);
    }
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
    );
    await page.waitForTimeout(PAUSE);

    const newH = await page.evaluate(() => document.documentElement.scrollHeight);
    if (newH <= prev + 2 && pass > 0) break;
    prev = newH;
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(200);
}

/* ------------------------------------------------------------------ */
/*  Collect structural element handles in DOM order                   */
/* ------------------------------------------------------------------ */
async function collectElements(page) {
  const out = [];

  // header
  const hdr = await page.$("header");
  if (hdr) {
    const box = await hdr.boundingBox();
    if (box && box.height > 0)
      out.push({ handle: hdr, name: "header", tag: "header", id: "", heading: "" });
  }

  // sections
  const secs = await page.$$("section");
  let si = 0;
  for (const sh of secs) {
    const box = await sh.boundingBox();
    if (!box || box.height < 10) continue;
    si++;
    const info = await sh.evaluate((el) => ({
      id: el.id || "",
      heading: (() => {
        const h = el.querySelector("h1, h2, h3");
        return h ? h.textContent.trim().slice(0, 50) : "";
      })(),
    }));
    out.push({
      handle: sh,
      name: info.id || `section-${si}`,
      tag: "section",
      ...info,
    });
  }

  // fallback: if no sections, capture main > children
  if (si === 0) {
    const children = await page.$$("main > *");
    let bi = 0;
    for (const ch of children) {
      const box = await ch.boundingBox();
      if (!box || box.height < 50) continue;
      const tag = await ch.evaluate((el) => el.tagName.toLowerCase());
      if (tag === "header" || tag === "footer" || tag === "script") continue;
      bi++;
      out.push({ handle: ch, name: `block-${bi}`, tag, id: "", heading: "" });
    }
  }

  // footer
  const ftr = await page.$("footer");
  if (ftr) {
    const box = await ftr.boundingBox();
    if (box && box.height > 0)
      out.push({ handle: ftr, name: "footer", tag: "footer", id: "", heading: "" });
  }

  return out;
}

/* ------------------------------------------------------------------ */
/*  Main                                                              */
/* ------------------------------------------------------------------ */
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const manifest = {
  timestamp: new Date().toISOString(),
  base: BASE,
  viewports: vpList,
  routes,
  captures: [],
};

console.log(`Base URL : ${BASE}`);
console.log(`Routes   : ${routes.join(", ")} (${routes.length})`);
console.log(`Viewports: ${vpList.join(", ")}`);
console.log(`Output   : ${OUT}\n`);

for (const route of routes) {
  const pName = pageName(route);
  const url = `${BASE.replace(/\/$/, "")}${route}`;

  for (const vpKey of vpList) {
    const vp = VP_DEFS[vpKey];
    const dir = join(OUT, vpKey, pName);
    await mkdir(dir, { recursive: true });

    const cap = { route, page: pName, viewport: vpKey, url, sections: [] };
    let ctx;

    try {
      ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        locale: "ja-JP",
      });
      const page = await ctx.newPage();

      const res = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      if (!res || res.status() >= 400)
        throw new Error(`HTTP ${res?.status() ?? "no response"}`);

      await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
      await revealPage(page);

      // ---- fullpage overview ----
      const fpFile = join(dir, "00-fullpage.png");
      await page.screenshot({
        path: fpFile,
        fullPage: true,
        animations: "disabled",
      });
      cap.sections.push({
        index: 0,
        name: "fullpage",
        file: `${vpKey}/${pName}/00-fullpage.png`,
        type: "overview",
      });

      // ---- collect page-level metadata ----
      const pageMeta = await page.evaluate(() => ({
        title: document.title,
        h1Count: document.querySelectorAll("h1").length,
        imgMissing: Array.from(document.querySelectorAll("img"))
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => img.src),
      }));
      cap.meta = pageMeta;

      // ---- section-by-section capture ----
      const elements = await collectElements(page);

      // Capture header first (before hiding it)
      const headerElements = elements.filter((el) => el.tag === "header");
      const nonHeaderElements = elements.filter((el) => el.tag !== "header");

      // Take header screenshots while still visible
      for (const el of headerElements) {
        const i = elements.indexOf(el);
        const num = idx(i + 1);
        const sName = safeName(el.name);
        const filename = `${num}-${sName}.png`;
        const filepath = join(dir, filename);
        const relPath = `${vpKey}/${pName}/${filename}`;

        try {
          await el.handle.screenshot({ path: filepath, animations: "disabled" });
          cap.sections.push({
            index: i + 1,
            name: el.name,
            file: relPath,
            tag: el.tag,
            id: el.id || undefined,
            heading: el.heading || undefined,
          });
          console.log(`  ✓ ${relPath}`);
        } catch (e) {
          console.error(`  ✗ ${relPath}: ${e.message}`);
        }
      }

      // Hide fixed/sticky header so it doesn't overlay section screenshots
      await page.evaluate(() => {
        document
          .querySelectorAll("header, [data-sticky], nav")
          .forEach((el) => {
            const st = window.getComputedStyle(el);
            if (
              st.position === "fixed" ||
              st.position === "sticky" ||
              el.tagName.toLowerCase() === "header"
            ) {
              el.dataset.hiddenByCapture = el.style.display || "";
              el.style.setProperty("display", "none", "important");
            }
          });
      });

      // Capture remaining sections/footer without header overlay
      for (const el of nonHeaderElements) {
        const i = elements.indexOf(el);
        const num = idx(i + 1);
        const sName = safeName(el.name);
        const filename = `${num}-${sName}.png`;
        const filepath = join(dir, filename);
        const relPath = `${vpKey}/${pName}/${filename}`;

        try {
          await el.handle.screenshot({
            path: filepath,
            animations: "disabled",
          });

          const textInfo = await el.handle.evaluate((sec) => {
            const items = [];
            sec.querySelectorAll("h1, h2, h3, h4, p").forEach((t) => {
              const st = window.getComputedStyle(t);
              const lh = parseFloat(st.lineHeight) || parseFloat(st.fontSize) * 1.5;
              items.push({
                tag: t.tagName.toLowerCase(),
                text: t.innerText.replace(/\n/g, "↩").slice(0, 100),
                fontSize: st.fontSize,
                lines: Math.max(1, Math.round(t.clientHeight / lh)),
                hasBr: t.querySelector("br") !== null,
                textAlign: st.textAlign,
              });
            });
            return items;
          });

          cap.sections.push({
            index: i + 1,
            name: el.name,
            file: relPath,
            tag: el.tag,
            id: el.id || undefined,
            heading: el.heading || undefined,
            textElements: textInfo,
          });

          const label = el.heading ? ` — ${el.heading}` : "";
          console.log(`  ✓ ${relPath}${label}`);
        } catch (e) {
          console.error(`  ✗ ${relPath}: ${e.message}`);
        }
      }

      // Restore hidden elements
      await page.evaluate(() => {
        document
          .querySelectorAll("[data-hidden-by-capture]")
          .forEach((el) => {
            el.style.display = el.dataset.hiddenByCapture || "";
            delete el.dataset.hiddenByCapture;
          });
      });

      const count = cap.sections.length - 1;
      console.log(`✓ ${vpKey}/${pName}: ${count} sections\n`);
    } catch (e) {
      console.error(`✗ ${vpKey}/${pName}: ${e.message}\n`);
      cap.error = e.message;
    } finally {
      if (ctx) await ctx.close().catch(() => {});
    }

    manifest.captures.push(cap);
  }
}

await browser.close();
await writeFile(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));

const total = manifest.captures.reduce(
  (s, c) => s + c.sections.length,
  0,
);
console.log("─── Done ───");
console.log(`${total} screenshots (${manifest.captures.length} page×viewport)`);
console.log(`Manifest: ${join(OUT, "manifest.json")}`);
