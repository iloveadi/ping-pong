'use client';

import { useState, useMemo } from 'react';
import { BlogPost } from '@/lib/types';
import { ExternalLink, Calendar, BookOpen, Search, X, SlidersHorizontal } from 'lucide-react';

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

function getBlogTheme(blogName: string) {
  if (blogName.includes('Desktools')) {
    return { badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400', hover: 'group-hover:text-emerald-300', activeBg: 'from-emerald-500 to-teal-500' };
  }
  if (blogName === '폐차마켓 블로그') {
    return { badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400', hover: 'group-hover:text-amber-300', activeBg: 'from-amber-500 to-orange-500' };
  }
  if (blogName.includes('마음')) {
    return { badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20', dot: 'bg-rose-400', hover: 'group-hover:text-rose-300', activeBg: 'from-rose-500 to-pink-500' };
  }
  if (blogName === '폐차마켓') {
    return { badge: 'text-sky-400 bg-sky-500/10 border-sky-500/20', dot: 'bg-sky-400', hover: 'group-hover:text-sky-300', activeBg: 'from-sky-500 to-blue-500' };
  }
  return { badge: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', dot: 'bg-indigo-400', hover: 'group-hover:text-indigo-300', activeBg: 'from-indigo-500 to-purple-500' };
}

export default function PostListWithFilter({ initialPosts }: Props) {
  const [selectedBlog, setSelectedBlog] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(15);

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
    setVisibleCount(15);
  };

  return (
    <section className="space-y-5">

      {/* ── 필터 & 검색 바 ── */}
      <div className="glass rounded-2xl p-3 flex flex-col lg:flex-row lg:items-center gap-3">

        {/* 탭 목록 */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1">
          {/* 전체 탭 */}
          <button
            onClick={() => handleSelectBlog('ALL')}
            className={`tab-btn ${selectedBlog === 'ALL' ? 'active' : ''}`}
          >
            <span>전체보기</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              selectedBlog === 'ALL' ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-slate-500'
            }`}>
              {initialPosts.length.toLocaleString()}
            </span>
          </button>

          {/* 구분선 */}
          <div className="w-px h-5 bg-white/[0.08] mx-1 shrink-0" />

          {/* 블로그별 탭 */}
          {blogNames.map((name) => {
            const theme = getBlogTheme(name);
            const isSelected = selectedBlog === name;
            return (
              <button
                key={name}
                onClick={() => handleSelectBlog(name)}
                className={`tab-btn ${isSelected ? `active bg-gradient-to-r ${theme.activeBg}` : ''}`}
              >
                {!isSelected && <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} opacity-70`} />}
                <span>{name}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-slate-500'
                }`}>
                  {blogStats[name] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* 검색창 */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(15); }}
            placeholder="제목·내용 검색..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── 상태 표시줄 ── */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <SlidersHorizontal className="w-3 h-3 text-slate-600" />
          <span>
            {selectedBlog === 'ALL' ? '전체' : selectedBlog}
            {' · '}
            <strong className="text-slate-300 font-semibold">{filteredPosts.length.toLocaleString()}건</strong>
          </span>
          {searchQuery && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-medium">
              &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>
        <span className="hidden sm:inline text-[10px] text-slate-700">
          * 핵심 요약 150자, 원문 링크 포함
        </span>
      </div>

      {/* ── 포스트 그리드 ── */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-28 glass rounded-3xl">
          <p className="text-slate-500 text-sm">조건에 맞는 포스팅이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {visiblePosts.map((post) => {
            const theme = getBlogTheme(post.blog_name);
            return (
              <article
                key={post.id || post.original_url}
                className="post-card group flex flex-col rounded-2xl overflow-hidden"
              >
                {/* 썸네일 */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950/80">
                  {post.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.thumbnail_url}
                      alt={post.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-7 h-7 text-slate-700 stroke-1" />
                    </div>
                  )}
                  {/* 그라디언트 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* 블로그 뱃지 - 우측 하단 */}
                  <span className={`absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border backdrop-blur-sm ${theme.badge}`}>
                    {post.blog_name}
                  </span>
                </div>

                {/* 콘텐츠 */}
                <div className="p-3.5 flex flex-col flex-1 gap-2.5">
                  {/* 날짜 */}
                  <div className="flex items-center gap-1 text-[10px] text-slate-600 font-medium">
                    <Calendar className="w-2.5 h-2.5" />
                    <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                  </div>

                  {/* 제목 */}
                  <h3 className={`text-[13px] font-bold text-slate-100 line-clamp-2 leading-snug tracking-tight ${theme.hover} transition-colors`}>
                    {post.title}
                  </h3>

                  {/* 요약 */}
                  <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed flex-1">
                    {post.summary}
                  </p>

                  {/* 원문 링크 */}
                  <a
                    href={post.original_url}
                    target="_blank"
                    rel="dofollow"
                    className="mt-auto flex items-center justify-between w-full px-3 py-2 text-[11px] font-semibold rounded-xl border border-white/[0.07] bg-white/[0.03] hover:bg-indigo-500/15 hover:border-indigo-500/30 text-slate-500 hover:text-indigo-300 transition-all group/btn"
                    title={`${post.blog_name} 원본 보러 가기`}
                  >
                    <span>원문 보러 가기</span>
                    <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── 더보기 ── */}
      {visiblePosts.length < filteredPosts.length && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setVisibleCount((p) => p + 15)}
            className="group px-8 py-3 text-xs font-semibold text-slate-400 hover:text-white glass rounded-2xl border border-white/[0.07] hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-all shadow-lg cursor-pointer"
          >
            더 보기
            <span className="ml-2 text-slate-600 font-normal">
              ({visiblePosts.length} / {filteredPosts.length.toLocaleString()})
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
