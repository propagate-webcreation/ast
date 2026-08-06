/**
 * プレビュー用コンポーネントレジストリ（自動生成）
 * fetch-preview.js 実行時に更新されます
 */
'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

export const previewRegistry: Record<string, ComponentType> = {
  about3000: dynamic(() => import('./about3000').then((m) => m.default), { ssr: false }),
};

export const previewIds: string[] = ["about3000"];
