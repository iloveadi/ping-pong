import { getPosts, savePosts } from '@/lib/db';
import { fetchAllFeeds, DEFAULT_FEEDS } from '@/lib/rss';
import SyncButton from '@/components/SyncButton';
import { ExternalLink, Calendar, BookOpen, Layers, Rss } from 'lucide-react';

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
  let posts = await getPosts(60);

  // 만약 첫 실행이어서 DB가 비어있다면, 사용자 편의를 위해 즉시 초기 수집 1회 실행
  if (posts.length === 0) {
    try {
      const initialPosts = await fetchAllFeeds(DEFAULT_FEEDS);
      await savePosts(initialPosts);
      posts = await getPosts(60);
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

      {/* Posts Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>최신 포스팅 목록</span>
            <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {posts.length}건
            </span>
          </h2>
          <span className="text-xs text-slate-400">
            * 150자 요약본만 표시되며, 원문 보러 가기를 통해 전체 본문을 열람할 수 있습니다.
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800/80">
            <p className="text-slate-400 mb-4">현재 수집된 포스팅이 없습니다.</p>
            <SyncButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id || post.original_url}
                className="group flex flex-col bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-indigo-500/5 flex-grow"
              >
                {/* 썸네일 영역 */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  {post.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.thumbnail_url}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                      <BookOpen className="w-10 h-10 stroke-1" />
                    </div>
                  )}
                  
                  {/* 카테고리 / 출처 뱃지 */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-950/80 backdrop-blur-md text-indigo-300 border border-slate-700/60 shadow">
                      {post.blog_name}
                    </span>
                  </div>
                </div>

                {/* 콘텐츠 영역 */}
                <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                  <div className="space-y-2.5">
                    {/* 날짜 메타데이터 */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                      {post.category && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">{post.category}</span>
                        </>
                      )}
                    </div>

                    {/* 제목 */}
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>

                    {/* 150자 요약 본문 (검색엔진 스팸 패널티 방지를 위해 150자로 엄격 제한) */}
                    <p className="text-xs sm:text-sm text-slate-300/90 line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  {/* dofollow 백링크 버튼 */}
                  <div className="pt-3 border-t border-slate-800/80">
                    <a
                      href={post.original_url}
                      target="_blank"
                      rel="dofollow"
                      className="inline-flex items-center justify-between w-full px-3.5 py-2 text-xs sm:text-sm font-medium text-indigo-300 bg-indigo-950/40 hover:bg-indigo-600 hover:text-white border border-indigo-800/50 rounded-xl transition-all group/btn"
                      title={`${post.blog_name} 원본 글 보러 가기`}
                    >
                      <span>원문 보러 가기</span>
                      <ExternalLink className="w-4 h-4 text-indigo-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
