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
    <html lang="ko" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
          <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-black text-lg tracking-wider">
                P
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">핑퐁허브</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 font-medium">
                  PingPong Hub
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>실시간 피드 자동 동기화</span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-800/80 bg-slate-950/50 py-8 text-center text-xs text-slate-500">
          <div className="max-w-[1700px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-left text-slate-500">
              핑퐁허브는 다양한 분야의 전문 블로그 포스팅을 엄선하여 핵심 요약과 공식 원문 링크를 제공합니다.
              <span className="block mt-1 text-slate-600">© {new Date().getFullYear()} PingPong Hub. All rights reserved.</span>
            </p>
            <div className="shrink-0 flex items-center gap-3">
              <SyncButton />
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
