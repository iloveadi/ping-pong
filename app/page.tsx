import { getPosts, savePosts } from '@/lib/db';
import { fetchAllFeeds, DEFAULT_FEEDS } from '@/lib/rss';
import SyncButton from '@/components/SyncButton';
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
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-slate-950 border border-indigo-900/40 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Rss className="w-3.5 h-3.5" />
              <span>실시간 RSS 백링크 수집기</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              최신 블로그 포스팅 &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">dofollow 백링크</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              다양한 기술 블로그의 핵심 요약(150자)을 모아보고 원문 링크로 바로 이동할 수 있습니다.
              검색엔진 최적화(SEO) 표준에 맞추어 원문 dofollow 링크를 안전하게 연결합니다.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <SyncButton />
            <div className="text-xs text-slate-400 flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                등록 피드 <strong>{DEFAULT_FEEDS.length}개</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                수집된 글 <strong>{posts.length}개</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Section with Blog Filter & Search */}
      <PostListWithFilter initialPosts={posts} />
    </div>
  );
}
