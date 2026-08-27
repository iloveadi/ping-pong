import { getPosts, seedLocalPostsToSupabase } from '@/lib/db';
import PostListWithFilter from '@/components/PostListWithFilter';
import { Layers, BookOpen, Rss } from 'lucide-react';
import { DEFAULT_FEEDS } from '@/lib/rss';

// 서버 컴포넌트 캐싱 옵션 (ISR 60초 주기)
export const revalidate = 60;

export default async function HomePage() {
  // 1. DB에서 포스트 목록 조회 (RSC)
  let posts = await getPosts(2000);

  // Supabase에 과거 전체 데이터(1028건)가 아직 적재되지 않은 경우 자동 일괄 마이그레이션 1회 실행
  if (posts.length < 500) {
    try {
      console.log(`[Init] DB 포스트 수가 ${posts.length}건이므로 과거 전체 아티클 마이그레이션을 실행합니다.`);
      await seedLocalPostsToSupabase();
      posts = await getPosts(2000);
    } catch (e) {
      console.error('초기 과거 포스트 마이그레이션 오류:', e);
    }
  }



  return (
    <div className="space-y-8">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl noise border border-white/[0.07] p-7 sm:p-10 shadow-2xl"
        style={{ background: 'linear-gradient(145deg, rgba(15,18,35,0.95) 0%, rgba(20,16,50,0.9) 50%, rgba(12,14,28,0.95) 100%)' }}>

        {/* Ambient lights */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-purple-600/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            {/* 레이블 */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Rss className="w-3 h-3 animate-pulse" />
              <span>지식 &amp; 라이프 큐레이션 포털</span>
            </div>

            {/* 타이틀 */}
            <h1 className="text-2xl sm:text-[2.2rem] font-extrabold tracking-tight text-white leading-[1.2]">
              더 좋은 하루를 만드는<br className="hidden sm:inline" />
              <span className="gradient-text"> 프리미엄 인사이트</span>
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              생산성 툴부터 자동차 라이프, 마음 치유 에세이까지 — 핵심만 요약해 드립니다.
            </p>
          </div>

          {/* 통계 카드 */}
          <div className="flex gap-3 shrink-0">
            <div className="flex flex-col gap-1 px-5 py-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-center min-w-[90px]">
              <span className="text-[10px] text-slate-600 font-medium uppercase tracking-widest">채널</span>
              <strong className="text-2xl font-extrabold text-white tracking-tight">{DEFAULT_FEEDS.length}</strong>
              <span className="text-[10px] text-indigo-500 font-medium">blogs</span>
            </div>
            <div className="flex flex-col gap-1 px-5 py-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-center min-w-[90px]">
              <span className="text-[10px] text-slate-600 font-medium uppercase tracking-widest">아티클</span>
              <strong className="text-2xl font-extrabold text-white tracking-tight">{posts.length.toLocaleString()}</strong>
              <span className="text-[10px] text-purple-500 font-medium">articles</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Posts ── */}
      <PostListWithFilter initialPosts={posts} />
    </div>
  );
}
