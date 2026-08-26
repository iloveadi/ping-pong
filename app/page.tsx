import { getPosts, savePosts } from '@/lib/db';
import { fetchAllFeeds, DEFAULT_FEEDS } from '@/lib/rss';
import PostListWithFilter from '@/components/PostListWithFilter';
import { Layers, BookOpen, Rss } from 'lucide-react';

// 서버 컴포넌트 캐싱 옵션 (ISR 60초 주기 또는 Cron 트리거 시 revalidate)
export const revalidate = 60;

/**
 * 날짜 포맷팅 헬퍼
 */
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export default async function HomePage() {
  // 1. DB에서 포스트 목록 조회 (RSC)
  let posts = await getPosts(2000);

  // 만약 첫 실행이어서 DB가 비어있다면, 사용자 편의를 위해 즉시 초기 수집 1회 실행
  if (posts.length === 0) {
    try {
      const initialPosts = await fetchAllFeeds(DEFAULT_FEEDS);
      await savePosts(initialPosts);
      posts = await getPosts(2000);
    } catch (e) {
      console.error('초기 포스트 수집 오류:', e);
    }
  }

  return (
    <div className="space-y-10">
      {/* Hero Section with Ambient Glow */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950/40 via-slate-900/40 to-slate-950/60 border border-white/[0.08] p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Background Decorative Radial Lights */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-3xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-sm backdrop-blur-md">
              <Rss className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>지식 &amp; 라이프 큐레이션 포털</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              핑퐁허브와 함께하는 <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 drop-shadow-[0_0_25px_rgba(168,85,247,0.3)]">
                프리미엄 인사이트 큐레이션
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-2xl font-normal">
              업무 생산성 툴부터 자동차 라이프, 마음 치유 에세이까지 다양한 인사이트를 한눈에 모아보세요.
              핵심 요약과 함께 공식 원문 포스팅으로 바로 이동할 수 있습니다.
            </p>
          </div>

          {/* 우측 지표 통계 배너 (Glass Card) */}
          <div className="flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] p-5 rounded-2xl shadow-xl backdrop-blur-md shrink-0 transition-all">
            <div className="flex items-center gap-6 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span> 큐레이션 채널
                </span>
                <strong className="text-xl sm:text-2xl text-white font-extrabold tracking-tight block">
                  {DEFAULT_FEEDS.length}<span className="text-xs font-normal text-indigo-400 ml-0.5">개</span>
                </strong>
              </div>

              <div className="w-[1px] h-10 bg-white/[0.1]"></div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span> 등록 아티클
                </span>
                <strong className="text-xl sm:text-2xl text-white font-extrabold tracking-tight block">
                  {posts.length.toLocaleString()}<span className="text-xs font-normal text-purple-400 ml-0.5">건</span>
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Section with Blog Filter & Search */}
      <PostListWithFilter initialPosts={posts} />
    </div>
  );
}
