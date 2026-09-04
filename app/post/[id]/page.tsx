import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostById, getPosts } from '@/lib/db';
import { formatDate, getBlogTheme } from '@/lib/theme';
import PostActions from '@/components/PostActions';
import {
  Calendar,
  ExternalLink,
  ChevronLeft,
  BookOpen,
  Sparkles,
  ArrowRight,
  Bookmark,
  ShieldCheck,
} from 'lucide-react';

export const revalidate = 3600;

interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostById(params.id);

  if (!post) {
    return {
      title: '아티클을 찾을 수 없습니다 | 모아 퀘스트 (MOA.QUEST)',
      description: '요청하신 아티클 정보가 존재하지 않거나 삭제되었습니다.',
    };
  }

  const siteUrl = 'https://www.moa.quest';
  const postUrl = `${siteUrl}/post/${encodeURIComponent(post.id)}`;
  const title = `${post.title} | 모아 퀘스트 (MOA.QUEST)`;
  const description = `${post.summary} - 출처: ${post.blog_name}`;
  const ogImage = post.thumbnail_url && !post.thumbnail_url.includes('unsplash.com')
    ? post.thumbnail_url
    : `${siteUrl}/logo.jpg`;

  return {
    title,
    description,
    keywords: [
      post.blog_name,
      post.category || '큐레이션',
      '모아 퀘스트',
      '지식 큐레이션',
      ...post.title.split(' ').filter((w) => w.length > 1),
    ],
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title,
      description,
      url: postUrl,
      siteName: '모아 퀘스트 (MOA.QUEST)',
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.blog_name],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const post = await getPostById(params.id);

  if (!post) {
    notFound();
  }

  const theme = getBlogTheme(post.blog_name);
  const siteUrl = 'https://www.moa.quest';
  const postUrl = `${siteUrl}/post/${encodeURIComponent(post.id)}`;

  // 연관 추천 포스트 4건 조회 (내부 링크 연결로 크롤러 수집 최적화)
  const allPosts = await getPosts(60);
  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id && (p.blog_name === post.blog_name || p.category === post.category))
    .slice(0, 4);

  // Schema.org BlogPosting 구조화 데이터
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': postUrl,
    headline: post.title,
    description: post.summary,
    image: post.thumbnail_url && !post.thumbnail_url.includes('unsplash.com')
      ? post.thumbnail_url
      : `${siteUrl}/logo.jpg`,
    datePublished: post.published_at,
    dateModified: post.published_at,
    author: {
      '@type': 'Organization',
      name: post.blog_name,
      url: post.original_url,
    },
    publisher: {
      '@type': 'Organization',
      name: '모아 퀘스트 (MOA.QUEST)',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.jpg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  };

  const safeThumbnailUrl =
    post.thumbnail_url && !post.thumbnail_url.includes('unsplash.com')
      ? post.thumbnail_url.startsWith('http://')
        ? post.thumbnail_url.replace('http://', 'https://')
        : post.thumbnail_url
      : null;

  return (
    <article className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Schema.org 구조화 데이터 주입 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── 브레드크럼 (홈 > 주제 > 아티클) ── */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400">
        <Link
          href="/"
          className="hover:text-amber-300 transition-colors flex items-center gap-1 font-medium"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>전체 큐레이션 홈</span>
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-slate-400 font-medium">{theme.topicName}</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-500 truncate max-w-[260px] sm:max-w-md">
          {post.title}
        </span>
      </nav>

      {/* ── 상단 포스트 헤더 카드 ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-white/[0.08]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-5">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${theme.badge}`}
            >
              {post.blog_name}
            </span>
            <span className="text-xs text-slate-400 font-semibold px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
              {theme.topicName}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            </div>
          </div>

          <PostActions title={post.title} url={postUrl} />
        </div>

        {/* H1 메인 타이틀 */}
        <h1 className="text-xl sm:text-3xl font-black text-white leading-snug sm:leading-tight tracking-tight">
          {post.title}
        </h1>

        {/* 썸네일 이미지 (앰비언트 글로우 & 정비율 풀 뷰) */}
        {safeThumbnailUrl ? (
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950/90 flex items-center justify-center border border-white/[0.08] shadow-inner">
            {/* 앰비언트 블러 배경 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={safeThumbnailUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-35 pointer-events-none select-none"
              referrerPolicy="no-referrer"
            />
            {/* 본체 이미지 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={safeThumbnailUrl}
              alt={post.title}
              className="relative z-10 max-w-full max-h-full w-auto h-auto object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div
            className={`w-full aspect-[16/9] rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br ${theme.placeholderGradient} border border-white/[0.08]`}
          >
            <BookOpen className={`w-12 h-12 ${theme.iconColor} stroke-1 mb-2 animate-pulse`} />
            <span className="text-xs text-slate-400/80 font-medium">
              {post.blog_name} 공식 아티클
            </span>
          </div>
        )}

        {/* ── 큐레이션 핵심 요약 박스 ── */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>모아 퀘스트 에디터 핵심 요약</span>
          </div>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            {post.summary}
          </p>
        </div>

        {/* ── 공식 원문 CTA 배너 ── */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-amber-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>검증된 공식 원문 링크</span>
            </div>
            <p className="text-xs text-slate-400">
              <strong className="text-white">{post.blog_name}</strong> 원본 포스팅에서 전문과 상세 자료를 바로 확인해 보세요.
            </p>
          </div>

          <a
            href={post.original_url}
            target="_blank"
            rel="dofollow"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:scale-[1.02] cursor-pointer shrink-0"
          >
            <span>공식 원문 바로가기</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* ── 연관 추천 큐레이션 (Internal Link Building) ── */}
      {relatedPosts.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                같은 주제의 추천 큐레이션
              </h2>
            </div>
            <Link
              href="/"
              className="text-xs text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>더 보기</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedPosts.map((related) => {
              const relTheme = getBlogTheme(related.blog_name);
              return (
                <Link
                  key={related.id}
                  href={`/post/${encodeURIComponent(related.id)}`}
                  className="glass rounded-2xl p-4 border border-white/[0.08] hover:border-amber-400/40 transition-all hover:-translate-y-0.5 group block space-y-2.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold border ${relTheme.badge}`}
                    >
                      {related.blog_name}
                    </span>
                    <time dateTime={related.published_at}>{formatDate(related.published_at)}</time>
                  </div>

                  <h3 className="text-sm font-bold text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                    {related.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {related.summary}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 홈으로 돌아가기 버튼 ── */}
      <div className="text-center pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-white/[0.1] text-xs font-bold text-slate-300 hover:text-white hover:border-amber-400/50 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>모아 퀘스트 홈으로 이동</span>
        </Link>
      </div>
    </article>
  );
}
