import type { Metadata } from 'next';
import './globals.css';
import Image from 'next/image';
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
                <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/30 group-hover:scale-105 group-hover:shadow-indigo-500/50 transition-all duration-300" style={{filter: 'drop-shadow(0 0 12px rgba(139,92,246,0.5))'}}>
                  <Image
                    src="/logo.jpg"
                    alt="핑퐁허브 로고"
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                    priority
                  />
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
