'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/cron');
      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage(`동기화 완료 (+${data.stats?.savedCount ?? 0}건)`);
        router.refresh();
      } else {
        setStatusMessage(data.message || '실패');
      }
    } catch {
      setStatusMessage('요청 오류');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setStatusMessage(null);
      }, 4000);
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleSync}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-300 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-all cursor-pointer disabled:opacity-50"
        title="피드 즉시 동기화"
      >
        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
        <span>{loading ? '동기화 중...' : '피드 동기화'}</span>
      </button>

      {statusMessage && (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 animate-fadeIn">
          {statusMessage.includes('완료') ? (
            <CheckCircle className="w-3 h-3 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3 h-3 text-amber-400" />
          )}
          {statusMessage}
        </span>
      )}
    </div>
  );
}
