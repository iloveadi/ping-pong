'use client';

import { useState, useMemo } from 'react';
import { BlogPost } from '@/lib/types';
import { ExternalLink, Calendar, BookOpen, Search, X, SlidersHorizontal, ImageOff } from 'lucide-react';

interface Props {
  initialPosts: BlogPost[];
}

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

const ORDERED_TAB_KEYS = ['Desktools.run 블로그', '폐차마켓 블로그', '마음산책', '폐차마켓'];

// 보색 대비(Complementary Palette) 블로그 시그니처 테마
function getBlogTheme(blogName: string) {
  if (blogName.includes('Desktools')) {
    return {
      badge: 'text-emerald-300 bg-emerald-950/90 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
      dot: 'bg-emerald-400',
      hover: 'group-hover:text-emerald-300',
      activeBg: 'from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-emerald-500/30',
      btnHover: 'hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-200',
      placeholderGradient: 'from-emerald-950/60 via-slate-900 to-teal-950/40',
      iconColor: 'text-emerald-400/60',
    };
  }
  if (blogName === '폐차마켓 블로그') {
    return {
      badge: 'text-amber-300 bg-amber-950/90 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      dot: 'bg-amber-400',
      hover: 'group-hover:text-amber-300',
      activeBg: 'from-amber-500 via-orange-600 to-amber-700 text-white shadow-amber-500/30',
      btnHover: 'hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-200',
      placeholderGradient: 'from-amber-950/60 via-slate-900 to-orange-950/40',
      iconColor: 'text-amber-400/60',
    };
  }
  if (blogName.includes('마음')) {
    return {
      badge: 'text-rose-300 bg-rose-950/90 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
      dot: 'bg-rose-400',
      hover: 'group-hover:text-rose-300',
      activeBg: 'from-rose-500 via-pink-600 to-purple-600 text-white shadow-rose-500/30',
      btnHover: 'hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-200',
      placeholderGradient: 'from-rose-950/60 via-slate-900 to-purple-950/40',
      iconColor: 'text-rose-400/60',
    };
  }
  if (blogName === '폐차마켓') {
    return {
      badge: 'text-sky-300 bg-sky-950/90 border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.25)]',
      dot: 'bg-sky-400',
      hover: 'group-hover:text-sky-300',
      activeBg: 'from-sky-500 via-blue-600 to-indigo-600 text-white shadow-sky-500/30',
      btnHover: 'hover:bg-sky-500/20 hover:border-sky-500/50 hover:text-sky-200',
      placeholderGradient: 'from-sky-950/60 via-slate-900 to-blue-950/40',
      iconColor: 'text-sky-400/60',
    };
  }
  return {
    badge: 'text-indigo-300 bg-indigo-950/90 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]',
    dot: 'bg-indigo-400',
    hover: 'group-hover:text-indigo-300',
    activeBg: 'from-indigo-600 via-purple-600 to-pink-600 text-white shadow-indigo-500/30',
    btnHover: 'hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:text-indigo-200',
    placeholderGradient: 'from-indigo-950/60 via-slate-900 to-purple-950/40',
    iconColor: 'text-indigo-400/60',
  };
}

/**
 * 이미지 로딩 에러 방어 및 HTTP->HTTPS 자동 승격 처리 포스트 카드 컴포넌트
 */
function PostCard({ post }: { post: BlogPost }) {
  const [imgError, setImgError] = useState(false);
  const theme = getBlogTheme(post.blog_name);

  // Mixed Content 방지를 위해 http:// URL을 https:// 로 자동 전환 시도
  const safeThumbnailUrl = useMemo(() => {
    if (!post.thumbnail_url) return null;
    if (post.thumbnail_url.startsWith('http://')) {
      return post.thumbnail_url.replace('http://', 'https://');
    }
    return post.thumbnail_url;
  }, [post.thumbnail_url]);

  return (
    <article className="post-card group flex flex-col rounded-2xl overflow-hidden shadow-lg">
      {/* 썸네일 영역 */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
        {safeThumbnailUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={safeThumbnailUrl}
            alt={post.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => {
              // 이미지 로드 실패 시 깨진 아이콘 대신 세련된 플레이스홀더로 자동 대체
              setImgError(true);
            }}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${theme.placeholderGradient} p-4 text-center`}>
            <BookOpen className={`w-8 h-8 ${theme.iconColor} stroke-1 mb-1 animate-pulse`} />
            <span className="text-[11px] text-slate-400/80 font-medium line-clamp-1">{post.blog_name}</span>
          </div>
        )}

        {/* 하단 그라디언트 섀도우 (뱃지 가독성 강화) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity pointer-events-none" />

        {/* 블로그 뱃지 - 우측 하단 (고대비 보색 & 블러 박스) */}
        <div className="absolute bottom-2.5 right-2.5">
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border backdrop-blur-md shadow-md ${theme.badge}`}>
            {post.blog_name}
          </span>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-2">
          {/* 날짜 메타 */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Calendar className="w-3 h-3 text-amber-400/80" />
            <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
          </div>

          {/* 제목 (가독성 극대화: 14.5px, Bold, Hover시 블로그 보색 반응) */}
          <h3 className={`text-[14.5px] font-extrabold text-slate-100 leading-snug tracking-tight ${theme.hover} transition-colors line-clamp-2`}>
            {post.title}
          </h3>

          {/* 150자 요약 본문 */}
          <p className="text-[12px] text-slate-400 line-clamp-3 leading-relaxed font-normal">
            {post.summary}
          </p>
        </div>

        {/* 원문 링크 버튼 (보색 네온 인터랙션) */}
        <div className="pt-2.5 border-t border-white/[0.07]">
          <a
            href={post.original_url}
            target="_blank"
            rel="dofollow"
            className={`flex items-center justify-between w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-white/[0.1] bg-white/[0.04] text-slate-200 ${theme.btnHover} transition-all duration-200 group/btn shadow-sm`}
            title={`${post.blog_name} 공식 원본 글 보러 가기`}
          >
            <span>원문 보러 가기</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function PostListWithFilter({ initialPosts }: Props) {
  const [selectedBlog, setSelectedBlog] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(16);

  const blogStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const post of initialPosts) {
      counts[post.blog_name] = (counts[post.blog_name] || 0) + 1;
    }
    return counts;
  }, [initialPosts]);

  const blogNames = useMemo(() => {
    const rawKeys = Object.keys(blogStats);
    return rawKeys.sort((a, b) => {
      const idxA = ORDERED_TAB_KEYS.indexOf(a);
      const idxB = ORDERED_TAB_KEYS.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [blogStats]);

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      if (selectedBlog !== 'ALL' && post.blog_name !== selectedBlog) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return post.title.toLowerCase().includes(q) || post.summary.toLowerCase().includes(q);
      }
      return true;
    });
  }, [initialPosts, selectedBlog, searchQuery]);

  const visiblePosts = useMemo(() => filteredPosts.slice(0, visibleCount), [filteredPosts, visibleCount]);

  const handleSelectBlog = (blog: string) => {
    setSelectedBlog(blog);
    setVisibleCount(16);
  };

  return (
    <section className="space-y-6">

      {/* ── 필터 & 검색 바 (Glass Control Bar with High Contrast) ── */}
      <div className="glass rounded-2xl p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">

        {/* 탭 목록 */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1 pb-1 lg:pb-0">
          {/* 전체 탭 */}
          <button
            onClick={() => handleSelectBlog('ALL')}
            className={`tab-btn ${selectedBlog === 'ALL' ? 'active-all' : ''}`}
          >
            <span>전체보기</span>
            <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-extrabold ${
              selectedBlog === 'ALL' ? 'bg-white/25 text-white' : 'bg-white/[0.08] text-slate-400'
            }`}>
              {initialPosts.length.toLocaleString()}
            </span>
          </button>

          {/* 구분선 */}
          <div className="w-px h-6 bg-white/[0.1] mx-1 shrink-0" />

          {/* 블로그별 탭 */}
          {blogNames.map((name) => {
            const theme = getBlogTheme(name);
            const isSelected = selectedBlog === name;
            return (
              <button
                key={name}
                onClick={() => handleSelectBlog(name)}
                className={`tab-btn ${isSelected ? `bg-gradient-to-r ${theme.activeBg} ring-1 ring-white/30` : ''}`}
              >
                {!isSelected && <span className={`w-2 h-2 rounded-full ${theme.dot} shadow-[0_0_6px_currentColor]`} />}
                <span>{name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-white/[0.08] text-slate-400'
                }`}>
                  {blogStats[name] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* 검색창 */}
        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(16); }}
            placeholder="제목 및 본문 실시간 검색..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-white/[0.12] rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 transition-all backdrop-blur-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── 상태 표시줄 ── */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {selectedBlog === 'ALL' ? '전체' : selectedBlog} 결과:
            <strong className="text-white font-bold ml-1.5">{filteredPosts.length.toLocaleString()}건</strong>
          </span>
          {searchQuery && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
              &lsquo;{searchQuery}&rsquo; 검색됨
            </span>
          )}
        </div>
        <span className="hidden sm:inline text-[11px] text-slate-500">
          * 150자 핵심 요약 &amp; 공식 원문 다이렉트 링크 제공
        </span>
      </div>

      {/* ── 4열 포스트 그리드 (보색 대비 & 뛰어난 가독성 & 이미지 에러 방어) ── */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-28 glass rounded-3xl">
          <p className="text-slate-400 text-sm">조건에 맞는 포스팅이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {visiblePosts.map((post) => (
            <PostCard key={post.id || post.original_url} post={post} />
          ))}
        </div>
      )}

      {/* ── 더보기 버튼 ── */}
      {visiblePosts.length < filteredPosts.length && (
        <div className="flex justify-center pt-6">
          <button
            onClick={() => setVisibleCount((p) => p + 16)}
            className="group px-8 py-3.5 text-xs sm:text-sm font-bold text-slate-200 hover:text-white glass rounded-2xl border border-white/[0.1] hover:border-amber-400/50 hover:bg-amber-500/10 transition-all shadow-xl cursor-pointer hover:shadow-amber-500/15 active:scale-98"
          >
            <span>더 많은 아티클 탐색하기</span>
            <span className="ml-2 text-amber-400 font-semibold">
              ({visiblePosts.length} / {filteredPosts.length.toLocaleString()})
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
