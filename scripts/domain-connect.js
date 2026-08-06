#!/usr/bin/env node

/**
 * domain-connect スクリプト版
 * memories/connect_domain.yaml からドメイン設定を読み込み、vercel.json を生成
 *
 * 使い方:
 *   node scripts/domain-connect.js
 *   npm run domain-connect
 *
 * n8n から: Execute Command ノードで上記を実行
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * ドメイン正規化（connect_domain.yaml のルールに準拠）
 * - プロトコル除去
 * - 末尾スラッシュ除去
 * - 小文字化
 */
function normalizeDomain(domain) {
  if (!domain || typeof domain !== 'string') return '';
  return domain
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '')
    .toLowerCase();
}

/**
 * domain_config から APEX_DOMAIN と WWW_DOMAIN を正規表現で抽出
 * （YAML 全体をパースしないため、connect_domain.yaml の後半の構文エラーを回避）
 */
function extractDomainConfig(content) {
  const apexMatch = content.match(/APEX_DOMAIN:\s*["']([^"']+)["']/);
  const wwwMatch = content.match(/WWW_DOMAIN:\s*["']([^"']+)["']/);
  return {
    apex: apexMatch ? apexMatch[1].trim() : null,
    www: wwwMatch ? wwwMatch[1].trim() : null,
  };
}

function main() {
  const yamlPath = path.join(rootDir, 'memories', 'connect_domain.yaml');
  const outputPath = path.join(rootDir, 'vercel.json');

  if (!fs.existsSync(yamlPath)) {
    console.error('ERROR: memories/connect_domain.yaml が見つかりません');
    process.exit(1);
  }

  const yamlContent = fs.readFileSync(yamlPath, 'utf8');
  const { apex: apexRaw, www: wwwRaw } = extractDomainConfig(yamlContent);

  if (!apexRaw || !wwwRaw) {
    console.error(
      'ERROR: domain_config.APEX_DOMAIN または WWW_DOMAIN が設定されていません'
    );
    process.exit(1);
  }

  const apex = normalizeDomain(apexRaw);
  const www = normalizeDomain(wwwRaw);

  if (!apex || !www) {
    console.error('ERROR: ドメインの正規化に失敗しました');
    process.exit(1);
  }

  const vercelConfig = {
    redirects: [
      {
        source: '/:path*',
        has: [{ type: 'host', value: apex }],
        destination: `https://${www}/:path*`,
        permanent: true,
      },
    ],
  };

  fs.writeFileSync(outputPath, JSON.stringify(vercelConfig, null, 2), 'utf8');
  console.log(
    JSON.stringify({ success: true, apex, www, output: outputPath })
  );
}

main();
