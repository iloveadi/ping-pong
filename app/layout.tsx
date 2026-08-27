import type { Metadata } from 'next';
import './globals.css';
import SyncButton from '@/components/SyncButton';

export const metadata: Metadata = {
  title: '핑퐁허브 (PingPong Hub) | 엄선된 블로그 & 라이프 큐레이션',
  description: '생산성 도구, 자동차 라이프, 마음 치유 에세이까지 유익한 최신 블로그 아티클을 매일 엄선하여 전해드리는 지식 큐레이션 허브입니다.',
  keywords: ['핑퐁허브', 'PingPong Hub', '블로그 큐레이션', 'Desktools', '폐차마켓', '마음산책', '라이프 트렌드'],
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
    title: '핑퐁허브 (PingPong Hub) | 엄선된 블로그 & 라이프 큐레이션',
    description: '생산성 도구, 자동차 라이프, 마음 치유 에세이 등 유익한 아티클을 한곳에서 만나보세요.',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark scroll-smooth">
      <body className="min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        {/* 상단 네비게이션 헤더 */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090d16]/75 border-b border-white/[0.08] shadow-sm transition-all">
          <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* 로고 & 타이틀 */}
            <div className="flex items-center gap-3.5 group cursor-pointer">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
                    boxShadow: '0 0 0 1px rgba(139,92,246,0.3), 0 4px 20px rgba(139,92,246,0.25)',
                  }}>
                  {/* 핑퐁 SVG 로고 */}
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* 패들 */}
                    <ellipse cx="11" cy="16" rx="9" ry="9" transform="rotate(-35 11 16)" fill="#dc2626" />
                    <ellipse cx="11" cy="16" rx="9" ry="9" transform="rotate(-35 11 16)" fill="url(#paddleGrad)" />
                    {/* 패들 손잡이 */}
                    <rect x="17.5" y="19" width="3" height="7.5" rx="1.5" transform="rotate(-35 17.5 19)" fill="#7c3aed" />
                    {/* 패들 하이라이트 */}
                    <ellipse cx="8.5" cy="13" rx="3.5" ry="2.5" transform="rotate(-35 8.5 13)" fill="rgba(255,255,255,0.18)" />
                    {/* 공 */}
                    <circle cx="20" cy="9" r="6" fill="white" />
                    <circle cx="20" cy="9" r="6" fill="url(#ballGrad)" />
                    {/* 공 솔기 */}
                    <path d="M15 7.5 Q20 11 25 7.5" stroke="rgba(139,92,246,0.5)" strokeWidth="1" fill="none" strokeLinecap="round"/>
                    <path d="M15 10.5 Q20 7 25 10.5" stroke="rgba(139,92,246,0.5)" strokeWidth="1" fill="none" strokeLinecap="round"/>
                    {/* 공 글로우 */}
                    <circle cx="20" cy="9" r="6" fill="url(#glowGrad)" />
                    <defs>
                      <radialGradient id="ballGrad" cx="35%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#e0e7ff" />
                      </radialGradient>
                      <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="60%" stopColor="transparent" />
                        <stop offset="100%" stopColor="rgba(139,92,246,0.35)" />
                      </radialGradient>
                      <linearGradient id="paddleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#be123c" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#090d16] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="font-extrabold text-lg text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                  핑퐁허브
                </span>
                <SyncButton />
              </div>
            </div>

            {/* 상태 뱃지 */}
            <div className="text-xs text-slate-400 hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
                <span className="text-[11px] font-medium">24/7 실시간 큐레이션 가동 중</span>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* 하단 푸터 */}
        <footer className="border-t border-white/[0.06] bg-[#070a11]/80 backdrop-blur-md py-8 text-center text-xs text-slate-500">
          <div className="max-w-[1700px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left space-y-1">
              <p className="text-slate-400 text-xs font-medium">
                핑퐁허브는 엄선된 전문 블로그 포스팅의 핵심 요약과 공식 원문 링크를 큐레이션합니다.
              </p>
              <p className="text-[11px] text-slate-600">
                © {new Date().getFullYear()} PingPong Hub. All rights reserved. • Powered by Next.js &amp; Supabase
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <SyncButton />
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
