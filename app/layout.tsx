import type { Metadata } from 'next';
import './globals.css';
import SyncButton from '@/components/SyncButton';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.moa.quest'),
  title: '모아 퀘스트 (MOA.QUEST) | 엄선된 블로그 & 라이프 큐레이션',
  description: '생산성 도구, 자동차 라이프, 마음 치유 에세이까지 유익한 최신 블로그 아티클을 매일 엄선하여 전해드리는 지식 큐레이션 허브입니다.',
  keywords: ['모아 퀘스트', '모아퀘스트', 'MOA QUEST', 'moa.quest', '블로그 큐레이션', 'Desktools', '폐차마켓', '마음산책', '라이프 트렌드'],
  referrer: 'no-referrer',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: 'JXr-mwmn5Z5l6c2TZS4PrGbmBOGWM6jD12uQuaApk64',
    other: {
      'naver-site-verification': 'dbffbb79f2d90d1b5c30946946627df41bba41d2',
      'google-site-verification': 'JXr-mwmn5Z5l6c2TZS4PrGbmBOGWM6jD12uQuaApk64',
    },
  },
  other: {
    'naver-site-verification': 'dbffbb79f2d90d1b5c30946946627df41bba41d2',
    'google-site-verification': 'JXr-mwmn5Z5l6c2TZS4PrGbmBOGWM6jD12uQuaApk64',
  },
  openGraph: {
    title: '모아 퀘스트 (MOA.QUEST) | 엄선된 블로그 & 라이프 큐레이션',
    description: '생산성 도구, 자동차 라이프, 마음 치유 에세이 등 유익한 아티클을 한곳에서 만나보세요.',
    url: 'https://www.moa.quest',
    siteName: '모아 퀘스트 (MOA.QUEST)',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '모아 퀘스트 (MOA.QUEST) | 엄선된 블로그 & 라이프 큐레이션',
    description: '생산성 도구, 자동차 라이프, 마음 치유 에세이 등 유익한 아티클을 한곳에서 만나보세요.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark scroll-smooth">
      <body className="min-h-screen flex flex-col antialiased selection:bg-indigo-500/40 selection:text-indigo-100">
        {/* ── 헤더 ── */}
        <header className="sticky top-0 z-50 border-b border-white/[0.06]"
          style={{ background: 'rgba(6, 8, 18, 0.85)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}>
          <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
            {/* 로고 (Q 형상화 아이콘 & 모아 퀘스트 타이틀) */}
            <div className="flex items-center gap-3.5 group cursor-pointer">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #3b0764 50%, #451a03 100%)',
                    boxShadow: '0 0 0 1px rgba(245,158,11,0.3), 0 4px 16px rgba(99,102,241,0.25)',
                  }}>
                  {/* Q 형상화 프리미엄 엠블럼 SVG */}
                  <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Q 외곽 링 */}
                    <circle cx="13" cy="13" r="8.5" stroke="url(#qRingGrad)" strokeWidth="2.8" strokeLinecap="round" />
                    {/* 내부 코어 글로우 포인트 */}
                    <circle cx="13" cy="13" r="3.5" fill="url(#qCoreGrad)" />
                    {/* Q 테일 (우측 하단으로 뻗어나가는 퀘스트 샤프 레이) */}
                    <path d="M17.5 17.5 L24 24" stroke="url(#qTailGrad)" strokeWidth="3.2" strokeLinecap="round" />
                    <circle cx="23.5" cy="23.5" r="1.2" fill="#fbbf24" />
                    <defs>
                      <linearGradient id="qRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                      <radialGradient id="qCoreGrad" cx="40%" cy="40%" r="60%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#818cf8" />
                      </radialGradient>
                      <linearGradient id="qTailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#060812] flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-black text-lg text-white tracking-tight group-hover:text-amber-300 transition-colors">
                    모아 퀘스트
                  </span>
                  <span className="text-[10px] font-bold tracking-wider text-slate-500 hidden sm:inline uppercase font-mono">
                    MOA.QUEST
                  </span>
                </div>
                <SyncButton />
              </div>
            </div>

            {/* 우측 상태 뱃지 */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
              <span className="text-[11.5px] text-slate-300 font-medium">24/7 실시간 큐레이션 가동 중</span>
            </div>
          </div>
        </header>

        {/* ── 메인 ── */}
        <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
          {children}
        </main>

        {/* ── 푸터 ── */}
        <footer className="border-t border-white/[0.05] py-7 mt-6"
          style={{ background: 'rgba(5, 7, 14, 0.9)' }}>
          <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11.5px] text-slate-400">
              모아 퀘스트(MOA.QUEST)는 엄선된 전문 블로그 포스팅의 핵심 요약과 공식 원문 링크를 큐레이션합니다.
            </p>
            <p className="text-[10.5px] text-slate-500 font-mono">
              © {new Date().getFullYear()} MOA.QUEST · Powered by Next.js &amp; Supabase
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

