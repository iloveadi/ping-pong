'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, RefreshCw, CheckCircle, AlertCircle, Lock, X } from 'lucide-react';

export default function SyncButton() {
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenModal = () => {
    setPassword('');
    setPasswordError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPassword('');
    setPasswordError(null);
  };

  const handleConfirmSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setPasswordError('비밀번호를 입력하세요.');
      return;
    }

    setLoading(true);
    setPasswordError(null);

    try {
      // 서버로 비밀번호 전달하여 백엔드에서만 검증
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setPasswordError('비밀번호가 올바르지 않습니다.');
        setLoading(false);
        return;
      }

      if (res.ok && data.success) {
        setIsModalOpen(false);
        setPassword('');
        setStatusMessage(`동기화 완료 (+${data.stats?.savedCount ?? 0}건)`);
        // DB 최신 데이터 즉시 반영을 위해 페이지 전체 리로드
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setPasswordError(data.message || '동기화 중 오류가 발생했습니다.');
      }
    } catch {
      setPasswordError('서버 연결 실패');
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
        {/* MOA QUEST 알약형 뱃지 스타일의 피드 동기화 버튼 */}
        <button
          type="button"
          onClick={handleOpenModal}
          disabled={loading}
          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 hover:from-amber-500/30 hover:to-indigo-500/30 text-amber-300 hover:text-amber-100 border border-amber-500/30 hover:border-amber-500/60 font-semibold transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          title="관리자 피드 동기화 (클릭)"
        >
          {loading ? (
            <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3 text-amber-400" />
          )}
          <span>MOA QUEST</span>
        </button>

        {statusMessage && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800/95 text-slate-200 border border-slate-700 animate-fadeIn shadow-xl backdrop-blur-md">
            {statusMessage.includes('완료') ? (
              <CheckCircle className="w-3 h-3 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3 h-3 text-amber-400" />
            )}
            {statusMessage}
          </span>
        )}
      </div>

      {/* 관리자 비밀번호 입력 모달 (Portal을 사용하여 화면 정중앙에 렌더링) */}
      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-xs bg-slate-900/95 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 backdrop-blur-xl animate-scaleIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Lock className="w-4 h-4 text-indigo-400" />
                <span>관리자 인증</span>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={loading}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              피드 동기화를 실행하려면 관리자 비밀번호를 입력하세요.
            </p>

            <form onSubmit={handleConfirmSync} className="space-y-3">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  placeholder="비밀번호 입력"
                  autoFocus
                  disabled={loading}
                  className="w-full px-3 py-2.5 text-xs bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-center tracking-widest font-mono text-base disabled:opacity-50"
                />
                {passwordError && (
                  <span className="block mt-1.5 text-[11px] text-rose-400 text-center font-medium">
                    {passwordError}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>동기화 중...</span>
                    </>
                  ) : (
                    <span>실행</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}


