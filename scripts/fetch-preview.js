#!/usr/bin/env node
/**
 * デザインストックのコンポーネントをプレビュー用に取得する
 * Usage: node scripts/fetch-preview.js <id1> [id2] ...
 * Example: node scripts/fetch-preview.js about3000 about5001
 */

import fs from 'fs';
import path from 'path';

const GIST_BASE =
  'https://gist.githubusercontent.com/propagate1/5567ced2819730057503417bd35ee7cc/raw';
const PREVIEW_DIR = path.join(process.cwd(), 'app', 'components', 'preview-stock');

async function fetchComponent(id) {
  const url = `${GIST_BASE}/${id}.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${id}: ${res.status}`);
  }
  const data = await res.json();
  if (!data.files || !data.files[0]) {
    throw new Error(`No files in ${id}`);
  }
  const content = data.files[0].content;
  return content;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeComponent(id, content) {
  ensureDir(PREVIEW_DIR);
  const filePath = path.join(PREVIEW_DIR, `${id}.tsx`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ✓ ${id}.tsx`);
}

function updateRegistry(ids) {
  const registryPath = path.join(PREVIEW_DIR, 'registry.ts');
  const imports = ids
    .map(
      (id) =>
        `  ${id}: dynamic(() => import('./${id}').then((m) => m.default), { ssr: false }),`
    )
    .join('\n');

  const content = `/**
 * プレビュー用コンポーネントレジストリ（自動生成）
 * fetch-preview.js 実行時に更新されます
 */
'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

export const previewRegistry: Record<string, ComponentType> = {
${imports}
};

export const previewIds: string[] = ${JSON.stringify(ids)};
`;

  fs.writeFileSync(registryPath, content, 'utf8');
  console.log('  ✓ registry.ts updated');
}

async function main() {
  const ids = process.argv.slice(2).map((id) => id.toLowerCase());
  if (ids.length === 0) {
    console.log('Usage: node scripts/fetch-preview.js <id1> [id2] ...');
    console.log('Example: node scripts/fetch-preview.js about3000 about5001');
    process.exit(1);
  }

  console.log('Fetching preview components...\n');
  const succeeded = [];

  for (const id of ids) {
    try {
      const content = await fetchComponent(id);
      writeComponent(id, content);
      succeeded.push(id);
    } catch (err) {
      console.error(`  ✗ ${id}: ${err.message}`);
    }
  }

  if (succeeded.length > 0) {
    const existingPath = path.join(PREVIEW_DIR, 'registry.ts');
    let existingIds = [];
    if (fs.existsSync(existingPath)) {
      try {
        const match = fs.readFileSync(existingPath, 'utf8').match(/previewIds: string\[\] = (\[.*?\])/s);
        if (match) {
          existingIds = JSON.parse(match[1]);
        }
      } catch (_) {}
    }
    const allIds = [...new Set([...existingIds, ...succeeded])].sort();
    updateRegistry(allIds);
  }

  console.log(`\nDone. Preview at: /preview/{id}`);
  console.log(`Example: /preview/${succeeded[0] || ids[0]}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
