'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { previewRegistry, previewIds } from '@/app/components/preview-stock/registry';

export default function PreviewPage() {
  const params = useParams();
  const candidateId = (params?.candidateId as string)?.toLowerCase();

  if (!candidateId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">プレビュー</h1>
          <p className="text-slate-600 mb-6">候補IDを指定してください。</p>
          <Link
            href="/"
            className="text-[13px] text-blue-600 hover:underline"
          >
            ← トップに戻る
          </Link>
        </div>
      </div>
    );
  }

  const Component = previewRegistry[candidateId];

  if (!Component) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            プレビューが見つかりません
          </h1>
          <p className="text-[13px] text-slate-600 mb-4">
            <code className="bg-slate-200 px-2 py-1 rounded">{candidateId}</code>{' '}
            を読み込むには、以下を実行してください:
          </p>
          <pre className="text-left text-[12px] bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto mb-6">
            node scripts/fetch-preview.js {candidateId}
          </pre>
          {previewIds.length > 0 && (
            <p className="text-[13px] text-slate-600 mb-4">
              利用可能: {previewIds.join(', ')}
            </p>
          )}
          <Link
            href="/"
            className="text-[13px] text-blue-600 hover:underline"
          >
            ← トップに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <span className="text-[13px] text-slate-600">
          プレビュー: <code className="font-mono font-medium">{candidateId}</code>
        </span>
        <Link
          href="/"
          className="text-[13px] text-blue-600 hover:underline"
        >
          ← トップに戻る
        </Link>
      </div>
      <main>
        <Component />
      </main>
    </div>
  );
}
