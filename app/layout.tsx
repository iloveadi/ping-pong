import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tech & Blog Hub | 실시간 블로그 RSS 백링크 수집기',
  description: '주요 기술 및 전문 블로그의 최신 포스팅 요약 정보와 원문 백링크(dofollow)를 자동으로 수집하여 제공하는 허브 플랫폼입니다.',
  keywords: ['블로그 RSS', '백링크', '기술 블로그', '개발 트렌드', 'RSS 피드 수집'],
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
    title: 'Tech & Blog Hub | 실시간 블로그 RSS 백링크 수집기',
    description: '주요 기술 블로그의 최신 글 요약과 원문 dofollow 백링크를 확인하세요.',
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
                B
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-tight">BacklinkHub</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 font-medium">
                  RSS Auto
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Vercel Cron 자동 수집 활성화</span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-800/80 bg-slate-950/50 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            <p className="mb-2">
              본 사이트는 블로그 RSS 피드를 자동 수집하여 150자 요약과 원문 백링크(dofollow)를 제공합니다.
            </p>
            <p>© {new Date().getFullYear()} BacklinkHub. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
