'use client';

import { useState, useMemo } from 'react';
import { BlogPost } from '@/lib/types';
import { ExternalLink, Calendar, BookOpen, Search, Filter, ChevronDown } from 'lucide-react';

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

export default function PostListWithFilter({ initialPosts }: Props) {
  const [selectedBlog, setSelectedBlog] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(12); // 초기 12개 표시

  // 등록된 고유 블로그 목록 및 각 블로그별 글 개수 계산
  const blogStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const post of initialPosts) {
      counts[post.blog_name] = (counts[post.blog_name] || 0) + 1;
    }
    return counts;
  }, [initialPosts]);

  const blogNames = useMemo(() => {
    return Object.keys(blogStats);
  }, [blogStats]);

  // 필터링 및 검색 적용된 포스트 목록
  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      // 1. 블로그 필터
      if (selectedBlog !== 'ALL' && post.blog_name !== selectedBlog) {
        return false;
      }
      // 2. 검색어 필터
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = post.title.toLowerCase().includes(q);
        const inSummary = post.summary.toLowerCase().includes(q);
        return inTitle || inSummary;
      }
      return true;
    });
  }, [initialPosts, selectedBlog, searchQuery]);

  // 현재 표시할 포스트 슬라이스
  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  const handleSelectBlog = (blog: string) => {
    setSelectedBlog(blog);
    setVisibleCount(12); // 필터 변경 시 첫 12개로 리셋
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  return (
    <section className="space-y-6">
      {/* 컨트롤 영역: 블로그 필터 탭 & 검색창 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        {/* 블로그별 선택 탭 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => handleSelectBlog('ALL')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              selectedBlog === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
            }`}
          >
            <span>전체 블로그</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                selectedBlog === 'ALL' ? 'bg-indigo-700 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {initialPosts.length}
            </span>
          </button>

          {blogNames.map((name) => (
            <button
              key={name}
              onClick={() => handleSelectBlog(name)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedBlog === name
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
              }`}
            >
              <span>{name}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  selectedBlog === name ? 'bg-indigo-700 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {blogStats[name] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* 검색 입력창 */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(12);
            }}
            placeholder="포스트 제목 or 내용 검색..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* 상태 표시줄 */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {selectedBlog === 'ALL' ? '전체 블로그' : selectedBlog} 결과: <strong>{filteredPosts.length}건</strong>
          </span>
          {searchQuery && (
            <span className="text-indigo-400">(&apos;{searchQuery}&apos; 검색됨)</span>
          )}
        </div>
        <span>* 150자 요약본만 표시되며, 원문 보러 가기로 전체 본문을 열람합니다.</span>
      </div>

      {/* 포스트 그리드 */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800/80">
          <p className="text-slate-400">조건에 맞는 포스팅이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePosts.map((post) => (
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
                    referrerPolicy="no-referrer"
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

                  {/* 150자 요약 본문 */}
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

      {/* 더보기 버튼 (남은 포스트가 있을 때 표시) */}
      {visiblePosts.length < filteredPosts.length && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-xl transition-all shadow-md cursor-pointer hover:shadow-indigo-500/10"
          >
            <span>더 많은 포스팅 보기 ({visiblePosts.length} / {filteredPosts.length})</span>
            <ChevronDown className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      )}
    </section>
  );
}
