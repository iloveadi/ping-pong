'use client';

import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface PostActionsProps {
  title: string;
  url: string;
}

export default function PostActions({ title, url }: PostActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    handleCopy();
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2 relative">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer"
        title="포스트 공유하기"
      >
        <Share2 className="w-3.5 h-3.5 text-slate-400" />
        <span>공유하기</span>
      </button>

      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer"
        title="링크 복사하기"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-bold">복사 완료!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>링크 복사</span>
          </>
        )}
      </button>
    </div>
  );
}
