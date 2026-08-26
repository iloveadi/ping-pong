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
        setStatusMessage(`수집 완료! 신규 ${data.stats?.savedCount ?? 0}건 추가됨`);
        router.refresh();
      } else {
        setStatusMessage(data.message || '수집에 실패했습니다.');
      }
    } catch (err) {
      setStatusMessage('서버 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setStatusMessage(null);
      }, 5000);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <button
        onClick={handleSync}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all rounded-xl shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        title="RSS 피드를 지금 즉시 수집하고 DB를 갱신합니다."
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        <span>{loading ? 'RSS 수집 중...' : '지금 RSS 동기화'}</span>
      </button>

      {statusMessage && (
        <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700 animate-fadeIn">
          {statusMessage.includes('완료') ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          )}
          {statusMessage}
        </span>
      )}
    </div>
  );
}
