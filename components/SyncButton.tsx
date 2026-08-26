'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, CheckCircle, AlertCircle, Lock, X } from 'lucide-react';

export default function SyncButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleOpenModal = () => {
    setPassword('');
    setPasswordError(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPassword('');
    setPasswordError(false);
  };

  const handleConfirmSync = async (e: React.FormEvent) => {
    e.preventDefault();

    // 관리자 비밀번호 검증 (1212)
    if (password !== '1212') {
      setPasswordError(true);
      return;
    }

    setIsModalOpen(false);
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/cron');
      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage(`동기화 완료 (+${data.stats?.savedCount ?? 0}건)`);
        router.refresh();
      } else {
        setStatusMessage(data.message || '동기화 실패');
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
    <>
      <div className="inline-flex items-center gap-2">
        <button
          onClick={handleOpenModal}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-300 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-all cursor-pointer disabled:opacity-50"
          title="관리자 피드 즉시 동기화"
        >
          <Lock className="w-3 h-3 text-slate-500" />
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

      {/* 관리자 비밀번호 입력 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Lock className="w-4 h-4 text-indigo-400" />
                <span>관리자 인증</span>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              피드 동기화를 실행하려면 비밀번호를 입력하세요.
            </p>

            <form onSubmit={handleConfirmSync} className="space-y-3">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(false);
                  }}
                  placeholder="비밀번호 입력"
                  autoFocus
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-center tracking-widest font-mono text-base"
                />
                {passwordError && (
                  <span className="block mt-1.5 text-[11px] text-rose-400 text-center">
                    비밀번호가 올바르지 않습니다.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  실행
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
