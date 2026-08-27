import { getPosts, seedLocalPostsToSupabase } from '@/lib/db';
import PostListWithFilter from '@/components/PostListWithFilter';
import { Sparkles, Layers, BookOpen, ArrowUpRight } from 'lucide-react';
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

  // 2. Schema.org JSON-LD 구조화된 데이터 생성 (Google Rich Snippets 최적화)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://www.moa.quest/#website',
        url: 'https://www.moa.quest',
        name: '모아 퀘스트 (MOA.QUEST)',
        description: '생산성 도구, 자동차 라이프, 도서 인사이트, 마음 치유 에세이까지 엄선된 블로그 아티클 큐레이션 포털',
        publisher: {
          '@type': 'Organization',
          name: '모아 퀘스트 (MOA.QUEST)',
          url: 'https://www.moa.quest',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.moa.quest/logo.jpg',
          },
        },
      },
      {
        '@type': 'CollectionPage',
        '@id': 'https://www.moa.quest/#webpage',
        url: 'https://www.moa.quest',
        name: '모아 퀘스트 (MOA.QUEST) | 엄선된 블로그 & 라이프 큐레이션',
        description: '업무 생산성 도구, 자동차 전문 정보, 도서 인사이트, 마음 힐링 에세이의 핵심 요약과 공식 원문을 제공합니다.',
        isPartOf: {
          '@id': 'https://www.moa.quest/#website',
        },
      },
      {
        '@type': 'ItemList',
        '@id': 'https://www.moa.quest/#itemlist',
        itemListElement: posts.slice(0, 60).map((post, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'BlogPosting',
            '@id': post.original_url,
            headline: post.title,
            description: post.summary,
            image: post.thumbnail_url && !post.thumbnail_url.includes('unsplash.com')
              ? post.thumbnail_url
              : 'https://www.moa.quest/logo.jpg',
            datePublished: post.published_at,
            dateModified: post.published_at,
            author: {
              '@type': 'Organization',
              name: post.blog_name,
            },
            publisher: {
              '@type': 'Organization',
              name: '모아 퀘스트 (MOA.QUEST)',
              url: 'https://www.moa.quest',
              logo: {
                '@type': 'ImageObject',
                url: 'https://www.moa.quest/logo.jpg',
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': post.original_url,
            },
          },
        })),
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* ── Schema.org JSON-LD 구조화 데이터 마크업 주입 ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero Section (보색 대비 Ambient Glow & Premium Glass Card) ── */}
      <section className="relative overflow-hidden rounded-3xl noise border border-white/[0.1] p-7 sm:p-11 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 18, 38, 0.95) 0%, rgba(26, 20, 52, 0.92) 50%, rgba(12, 16, 32, 0.95) 100%)',
        }}>

        {/* 보색 앰비언트 라이트 (딥 인디고 vs 골든 앰버 & 사이언) */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-glow" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/18 rounded-full blur-3xl pointer-events-none animate-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            {/* 상단 뱃지 (보색 대비: 인디고 배경 + 앰버 골드 스파클) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>모아 퀘스트 (MOA.QUEST) · 실시간 큐레이션 포털</span>
            </div>

            {/* 타이틀 (선명한 보색 그라디언트) */}
            <h1 className="text-2xl sm:text-[2.5rem] font-black tracking-tight text-white leading-[1.25]">
              생각을 넓히고 일상을 깨우는 <br className="hidden sm:inline" />
              <span className="gradient-text-complementary drop-shadow-[0_0_30px_rgba(245,158,11,0.35)]">
                프리미엄 인사이트 큐레이션
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-xl font-normal">
              스마트한 업무 생산성 도구부터 자동차 전문 라이프, 도서 인사이트, 마음 치유 에세이까지 — 
              엄선된 전문 블로그의 핵심 요약과 공식 원문을 한곳에서 편리하게 열람하세요.
            </p>
          </div>

          {/* 우측 보색 대비 통계 위젯 */}
          <div className="flex items-center gap-3 shrink-0">
            {/* 큐레이션 채널 위젯 (사이언/스카이 테마) */}
            <div className="flex flex-col gap-1 px-5 py-4 rounded-2xl border border-sky-500/25 bg-sky-950/30 hover:bg-sky-900/40 transition-all duration-300 text-center min-w-[105px] shadow-lg shadow-sky-950/50 group">
              <span className="text-[10px] text-sky-400 font-extrabold uppercase tracking-widest flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                채널
              </span>
              <strong className="text-2xl sm:text-3xl font-black text-white tracking-tight group-hover:scale-105 transition-transform">
                {DEFAULT_FEEDS.length}
              </strong>
              <span className="text-[10px] text-sky-400/80 font-semibold">Channels</span>
            </div>

            {/* 등록 아티클 위젯 (골든 앰버 테마) */}
            <div className="flex flex-col gap-1 px-5 py-4 rounded-2xl border border-amber-500/25 bg-amber-950/30 hover:bg-amber-900/40 transition-all duration-300 text-center min-w-[105px] shadow-lg shadow-amber-950/50 group">
              <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                아티클
              </span>
              <strong className="text-2xl sm:text-3xl font-black text-white tracking-tight group-hover:scale-105 transition-transform">
                {posts.length.toLocaleString()}
              </strong>
              <span className="text-[10px] text-amber-400/80 font-semibold">Articles</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 포스트 목록 & 블로그 필터 & 검색 ── */}
      <PostListWithFilter initialPosts={posts} />
    </div>
  );
}
