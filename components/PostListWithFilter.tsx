'use client';

import { useState, useMemo } from 'react';
import { BlogPost } from '@/lib/types';
import { ExternalLink, Calendar, BookOpen, Search, Filter, ChevronDown, Sparkles, X } from 'lucide-react';

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

const ORDERED_TAB_KEYS = ['[NB]Desktools', '[NB]clpecha', '[NB]마음산책', '[WP]폐차마켓'];

// 블로그별 시그니처 컬러 테마 매핑
function getBlogBadgeStyle(blogName: string) {
  if (blogName.includes('Desktools')) {
    return {
      badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30',
      activeTab: 'from-emerald-600 to-teal-600 text-white shadow-emerald-500/25',
      accentText: 'group-hover:text-emerald-300',
    };
  }
  if (blogName.includes('clpecha') || blogName.includes('lpecha')) {
    return {
      badge: 'bg-amber-950/80 text-amber-300 border-amber-500/30',
      activeTab: 'from-amber-600 to-orange-600 text-white shadow-amber-500/25',
      accentText: 'group-hover:text-amber-300',
    };
  }
  if (blogName.includes('마음')) {
    return {
      badge: 'bg-rose-950/80 text-rose-300 border-rose-500/30',
      activeTab: 'from-rose-600 to-pink-600 text-white shadow-rose-500/25',
      accentText: 'group-hover:text-rose-300',
    };
  }
  if (blogName.includes('폐차마켓')) {
    return {
      badge: 'bg-sky-950/80 text-sky-300 border-sky-500/30',
      activeTab: 'from-sky-600 to-blue-600 text-white shadow-sky-500/25',
      accentText: 'group-hover:text-sky-300',
    };
  }
  return {
    badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/30',
    activeTab: 'from-indigo-600 to-purple-600 text-white shadow-indigo-500/25',
    accentText: 'group-hover:text-indigo-300',
  };
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
      if (selectedBlog !== 'ALL' && post.blog_name !== selectedBlog) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = post.title.toLowerCase().includes(q);
        const inSummary = post.summary.toLowerCase().includes(q);
        return inTitle || inSummary;
      }
      return true;
    });
  }, [initialPosts, selectedBlog, searchQuery]);

  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  const handleSelectBlog = (blog: string) => {
    setSelectedBlog(blog);
    setVisibleCount(15);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 15);
  };

  return (
    <section className="space-y-6">
      {/* 탭 & 검색 컨트롤 바 (Glass Panel) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl shadow-lg">
        {/* 탭 필터 목록 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {/* 전체보기 탭 */}
          <button
            onClick={() => handleSelectBlog('ALL')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              selectedBlog === 'ALL'
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-white/20'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06]'
            }`}
          >
            <span>전체보기</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                selectedBlog === 'ALL' ? 'bg-white/25 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {initialPosts.length}
            </span>
          </button>

          {/* 블로그별 탭 */}
          {blogNames.map((name) => {
            const style = getBlogBadgeStyle(name);
            const isSelected = selectedBlog === name;
            return (
              <button
                key={name}
                onClick={() => handleSelectBlog(name)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? `bg-gradient-to-r ${style.activeTab} shadow-lg ring-1 ring-white/20`
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06]'
                }`}
              >
                <span>{name}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {blogStats[name] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* 검색 입력창 */}
        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(15);
            }}
            placeholder="제목 및 내용 실시간 검색..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-white/[0.1] rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all backdrop-blur-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 상태 표시줄 */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {selectedBlog === 'ALL' ? '전체보기' : selectedBlog} 결과: <strong className="text-white font-semibold">{filteredPosts.length}건</strong>
          </span>
          {searchQuery && (
            <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 font-medium">
              &apos;{searchQuery}&apos; 검색됨
            </span>
          )}
        </div>
        <span className="hidden sm:inline text-slate-500 text-[11px]">
          * 150자 핵심 요약본이며, 원문 보러 가기로 공식 포스팅 전문을 열람합니다.
        </span>
      </div>

      {/* 5열 그리드 포스트 레이아웃 */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-white/[0.06] backdrop-blur-md">
          <p className="text-slate-400 text-sm">조건에 맞는 포스팅이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4.5">
          {visiblePosts.map((post) => {
            const blogStyle = getBlogBadgeStyle(post.blog_name);
            return (
              <article
                key={post.id || post.original_url}
                className="group flex flex-col bg-slate-900/50 hover:bg-slate-900/80 border border-white/[0.07] hover:border-indigo-500/40 rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 backdrop-blur-md flex-grow"
              >
                {/* 썸네일 영역 */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                  {post.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.thumbnail_url}
                      alt={post.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-600">
                      <BookOpen className="w-8 h-8 stroke-1" />
                    </div>
                  )}

                  {/* 미세 오버레이 그라디언트 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity"></div>

                  {/* 블로그 출처 뱃지 */}
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg backdrop-blur-md border shadow-sm ${blogStyle.badge}`}
                    >
                      {post.blog_name}
                    </span>
                  </div>
                </div>

                {/* 콘텐츠 영역 */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div className="space-y-2">
                    {/* 날짜 메타데이터 */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                    </div>

                    {/* 제목 */}
                    <h3 className={`text-sm font-bold text-slate-100 ${blogStyle.accentText} transition-colors line-clamp-2 leading-snug tracking-tight`}>
                      {post.title}
                    </h3>

                    {/* 150자 요약 본문 */}
                    <p className="text-xs text-slate-400/90 line-clamp-3 leading-relaxed font-normal">
                      {post.summary}
                    </p>
                  </div>

                  {/* dofollow 백링크 버튼 */}
                  <div className="pt-3 border-t border-white/[0.06]">
                    <a
                      href={post.original_url}
                      target="_blank"
                      rel="dofollow"
                      className="inline-flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-indigo-300 bg-indigo-950/30 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white border border-indigo-800/40 hover:border-indigo-500/50 rounded-xl transition-all shadow-sm group/btn"
                      title={`${post.blog_name} 원본 글 보러 가기`}
                    >
                      <span>원문 보러 가기</span>
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 더보기 버튼 */}
      {visiblePosts.length < filteredPosts.length && (
        <div className="flex justify-center pt-6">
          <button
            onClick={handleLoadMore}
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 text-xs sm:text-sm font-bold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-indigo-600/20 border border-white/[0.1] hover:border-indigo-500/60 rounded-2xl transition-all shadow-xl backdrop-blur-md cursor-pointer hover:shadow-indigo-500/10 active:scale-98"
          >
            <span>더 많은 아티클 탐색하기 ({visiblePosts.length} / {filteredPosts.length})</span>
            <ChevronDown className="w-4 h-4 text-indigo-400 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      )}
    </section>
  );
}
