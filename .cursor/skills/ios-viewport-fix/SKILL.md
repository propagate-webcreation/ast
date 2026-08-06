---
name: ios-viewport-fix
description: >-
  iOS Safariのアドレスバー伸縮に起因するモバイルスクロール時の
  レイアウトジャンプ（ガクン）を診断・修正するスキル。
  ※このスキルは /fix ios-viewport コマンド経由でのみ実行する。
  会話中のキーワードでは自動起動しない。
---

# ios-viewport-fix — iOS モバイルスクロールジャンプ修正

## 目的

iOS Safari のアドレスバー伸縮に起因する**モバイルスクロール時のレイアウトジャンプ（ガクン）**を
コードベースから診断し、修正する。

---

## 前提

- `npm run dev` 起動済み
- 対象はモバイル（< 768px）のみ。PC 版（`md:` 以上のクラス）は一切変更しない
- ルール `60-mobile-viewport-ios.mdc` を参照基準とする

---

## STEP 1 — 診断（コードベースを検索）

以下のパターンを Grep で検索し、該当箇所をリストアップする。

### 1-A. ビューポート単位（画像を含む要素）

```bash
rg '\b(h|min-h|max-h)-\[[\d.]+(vh|svh|dvh)\]' app/ components/ --glob '*.tsx' -n
```

画像（`<Image>` / `object-cover`）を含む要素が該当する場合は **優先度: 最高**。

### 1-B. scroll-behavior: smooth

```bash
rg 'scroll-smooth|scroll-behavior:\s*smooth' app/ --glob '*.{tsx,css}' -n
```

`<html>` にプレフィックスなしで適用されている場合が問題。

### 1-C. fixed + mix-blend-multiply

```bash
rg 'fixed.*mix-blend|mix-blend.*fixed' app/ components/ --glob '*.tsx' -n
```

モバイルで表示されている（`hidden md:block` がない）場合が問題。

### 1-D. transition-all

```bash
rg 'transition-all' app/ components/ --glob '*.tsx' -n
```

ヘッダーやスクロール連動要素で使われている場合が問題。

### 1-E. backdrop-blur の動的付与

```bash
rg 'backdrop-blur' app/ components/ --glob '*.tsx' -n -B 2 -A 2
```

JS のスクロールイベントで動的に付与している箇所、またはモバイルにも適用されている箇所が問題。

### 1-F. passive: true なしのスクロールリスナー

```bash
rg 'addEventListener\s*\(\s*["\x27]scroll' app/ components/ --glob '*.tsx' -n -A 1
rg 'addEventListener\s*\(\s*["\x27]touchmove' app/ components/ --glob '*.tsx' -n -A 1
```

`{ passive: true }` が第3引数にない場合が問題。

### 1-G. ヒーローのオーバーフロー

```bash
rg 'overflow-hidden' app/ components/ --glob '*.tsx' -n -B 3 -A 3
```

ビューポート単位の高さと組み合わされている要素で、モバイルでコンテンツが見切れる可能性がある箇所。

---

## STEP 2 — 修正の優先順位

| 優先度 | 問題 | 影響 |
|:------:|------|------|
| 1 | ビューポート単位 → JS ピクセル固定 | 画像ジャンプの直接原因 |
| 2 | scroll-behavior → モバイルで `auto` に上書き | テキストジャンプの原因 |
| 3 | fixed + mix-blend-multiply → モバイル非表示 | フレーム落ちの原因 |
| 4 | backdrop-blur → PC版のみ適用 | フレーム落ちの原因 |
| 5 | transition-all → 対象プロパティを明示 | 副作用の防止 |
| 6 | passive: true → 全スクロールリスナーに付与 | カクつき防止 |
| 7 | コンテンツオーバーフロー → モバイル余白圧縮 | CTA 見切れ防止 |
| 8 | FV の `h-` 固定 → `min-h-` に変更 | テキストオーバーフロー防止 |

---

## STEP 3 — 修正パターン

### 3-1. ビューポート単位 → min-h + JS ピクセル固定

**原則: SP の FV 高さは `min-h`（最低保証）で指定する。`h` 固定は禁止。**
テキスト量が多い場合にコンテンツがオーバーフローするため、
高さが足りなければ内包テキストで高さが決まるようにする。

```tsx
// ❌ アドレスバー伸縮で画像がガクンと跳ねる
<section className="h-[90vh]">
  <Image src="..." alt="..." fill className="object-cover" />
</section>

// ❌ h- 固定だとテキストがオーバーフローする
<section className="h-[500px] md:h-[90vh]">
  ...
</section>

// ✅ SP は min-h + JS で最低高さを保証、テキストが多ければ自動拡張
"use client";
import { useRef, useEffect } from "react";

const sectionRef = useRef<HTMLElement>(null);
useEffect(() => {
  if (window.innerWidth < 768 && sectionRef.current) {
    const h = window.innerHeight * 0.88;
    sectionRef.current.style.minHeight = `${Math.max(h, 500)}px`;
  }
}, []);

<section ref={sectionRef} className="min-h-[500px] md:h-[90vh]">
  <Image src="..." alt="..." fill className="object-cover" />
</section>
```

CSS 側は `min-h-[500px] md:h-[90vh]` をフォールバックとして設定。
SP は `min-h` で最低限の高さを担保し、テキストが収まらない場合はコンテナが伸びる。
PC は `h-[90vh]` 固定のまま（PC はテキスト量が少ないため問題ない）。

### 3-2. scroll-behavior: smooth → モバイルで auto

```tsx
// ❌ globals.css で全環境に適用
// html { scroll-behavior: smooth; }

// ✅ layout.tsx の html 要素にレスポンシブクラス
<html lang="ja" className="scroll-auto md:scroll-smooth">
```

globals.css に `scroll-behavior` がある場合は削除し、`layout.tsx` のクラスに移行する。

### 3-3. fixed + mix-blend-multiply → モバイル非表示

```tsx
// ❌ モバイルでも GPU 再合成が走る
<div className="fixed inset-0 mix-blend-multiply pointer-events-none" />

// ✅ PC のみ表示
<div className="hidden md:block fixed inset-0 mix-blend-multiply pointer-events-none" />
```

### 3-4. backdrop-blur → PC 版のみ

```tsx
// ❌ モバイルでも backdrop-blur が適用
<header className={`sticky top-0 z-50 ${scrolled ? "backdrop-blur-sm bg-white/95" : ""}`}>

// ✅ backdrop-blur は PC のみ、モバイルは固定背景
<header className="sticky top-0 z-50 bg-white/95 md:backdrop-blur-sm">
```

JS でスクロール時に動的付与している場合は、条件に `window.innerWidth >= 768` を追加するか、
CSS クラスを `md:backdrop-blur-sm` に変更する。

### 3-5. transition-all → 対象明示

```tsx
// ❌ 意図しないプロパティまでアニメーション
<header className="transition-all duration-500">

// ✅ 対象プロパティを明示
<header className="transition-[background-color,box-shadow] duration-500">
```

### 3-6. passive: true の付与

```tsx
// ❌ passive なし
window.addEventListener("scroll", handleScroll);

// ✅ passive: true を付与
window.addEventListener("scroll", handleScroll, { passive: true });
```

### 3-7. ヒーローコンテンツの余白圧縮

```tsx
// ❌ PC の余白がモバイルに適用されてコンテンツが見切れる
<div className="pt-[80px] gap-6">

// ✅ モバイルは圧縮、PC は md: で維持
<div className="pt-[40px] md:pt-[80px] gap-3 md:gap-6">
```

---

## STEP 4 — 検証

修正後、以下を確認する。

### 確認項目

| # | 確認内容 | 方法 |
|---|---------|------|
| 1 | モバイル幅（375px）でヒーロー内の全要素が表示されるか | DevTools 375px またはスクリーンショット |
| 2 | PC 版（1280px）のレイアウトが変わっていないか | PC スクリーンショットをベースラインと比較 |
| 3 | スクロール時のジャンプが解消されたか | 実機 or DevTools でスクロール確認 |

### スクリーンショット撮影（director-visual スクリプトがある場合）

```bash
mkdir -p .cache/visual-review
node .cursor/skills/director-visual/scripts/capture-sections.mjs
```

SP / PC のフルページ画像を修正前後で比較する。

### PC 非破壊検証

| 確認項目 | 差分があれば NG |
|---------|---------------|
| 見出しの改行位置 | PC で新しい改行が発生していないか |
| ヒーローの高さ | PC の高さが変わっていないか |
| ヘッダーの挙動 | スクロール時のアニメーションが PC で正常か |
| 余白・パディング | PC の余白が変わっていないか |

**1箇所でも PC に差分があれば、該当修正を取消して `md:` プレフィックスの付け方を見直す。**

---

## レポートフォーマット

```
## iOS ビューポートジャンプ修正結果

### 診断結果
| # | 問題 | ファイル | 行 | 優先度 |
|---|------|---------|-----|:------:|

### 修正済み一覧
| # | ファイル | 修正前 | 修正後 |
|---|---------|--------|--------|

### PC非破壊検証
| ページ | セクション | PC差分 | 結果 |
|--------|-----------|--------|------|

### 検証結果
- [ ] SP 375px で全要素表示 OK
- [ ] PC 1280px レイアウト変更なし
- [ ] スクロール時ジャンプ解消
```

---

## 注意事項

- **globals.css は原則編集しない** — `layout.tsx` の `<html>` クラスで上書きする
- **PC 版のレイアウトは一切変更しない** — `md:` 以上のクラスを維持
- **モバイルファーストの原則** — プレフィックスなしのクラスで修正する
- **`tracker.js` は削除・変更禁止**
- **resize リスナーは付けない** — ビューポート固定の目的が崩れる
