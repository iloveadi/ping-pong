'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BlogPost } from '@/lib/types';
import {
  ExternalLink,
  Calendar,
  BookOpen,
  Search,
  X,
  SlidersHorizontal,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Share2,
  Check,
} from 'lucide-react';

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

// 4대 주제 카테고리 매핑 정의
export interface TopicCategory {
  id: string;
  name: string;
  icon: string;
  blogNames: string[];
  gradient: string;
  badgeStyle: string;
}

const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    id: 'ALL',
    name: '전체보기',
    icon: '✨',
    blogNames: [],
    gradient: 'from-indigo-600 via-purple-600 to-amber-600',
    badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
  {
    id: 'TOOLS',
    name: '업무·생산성 툴',
    icon: '💼',
    blogNames: ['Desktools.run 블로그'],
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    badgeStyle: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
  },
  {
    id: 'CAR',
    name: '자동차·폐차 정보',
    icon: '🚗',
    blogNames: ['폐차마켓 블로그', '폐차마켓'],
    gradient: 'from-amber-500 via-orange-600 to-amber-700',
    badgeStyle: 'bg-amber-950/90 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
  },
  {
    id: 'HEALING',
    name: '마음·에세이 치유',
    icon: '🌿',
    blogNames: ['마음산책'],
    gradient: 'from-rose-500 via-pink-600 to-purple-600',
    badgeStyle: 'bg-rose-950/90 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
  },
];

// 블로그별 테마 컬러 매핑
function getBlogTheme(blogName: string) {
  if (blogName.includes('Desktools')) {
    return {
      topicName: '업무·생산성',
      badge: 'text-emerald-300 bg-emerald-950/90 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
      dot: 'bg-emerald-400',
      hover: 'group-hover:text-emerald-300',
      btnHover: 'hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-200',
      placeholderGradient: 'from-emerald-950/60 via-slate-900 to-teal-950/40',
      iconColor: 'text-emerald-400/70',
      modalAccent: 'text-emerald-400',
      modalButton: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/30',
    };
  }
  if (blogName === '폐차마켓 블로그' || blogName === '폐차마켓') {
    return {
      topicName: '자동차·폐차',
      badge: 'text-amber-300 bg-amber-950/90 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      dot: 'bg-amber-400',
      hover: 'group-hover:text-amber-300',
      btnHover: 'hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-200',
      placeholderGradient: 'from-amber-950/60 via-slate-900 to-orange-950/40',
      iconColor: 'text-amber-400/70',
      modalAccent: 'text-amber-400',
      modalButton: 'from-amber-500 via-orange-600 to-amber-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-500/30',
    };
  }
  if (blogName.includes('마음')) {
    return {
      topicName: '마음·에세이',
      badge: 'text-rose-300 bg-rose-950/90 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
      dot: 'bg-rose-400',
      hover: 'group-hover:text-rose-300',
      btnHover: 'hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-200',
      placeholderGradient: 'from-rose-950/60 via-slate-900 to-purple-950/40',
      iconColor: 'text-rose-400/70',
      modalAccent: 'text-rose-400',
      modalButton: 'from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-500/30',
    };
  }
  return {
    topicName: '인사이트',
    badge: 'text-indigo-300 bg-indigo-950/90 border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]',
    dot: 'bg-indigo-400',
    hover: 'group-hover:text-indigo-300',
    btnHover: 'hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:text-indigo-200',
    placeholderGradient: 'from-indigo-950/60 via-slate-900 to-purple-950/40',
    iconColor: 'text-indigo-400/70',
    modalAccent: 'text-indigo-400',
    modalButton: 'from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/30',
  };
}

/**
 * 포스트 카드 컴포넌트
 */
function PostCardItem({
  post,
  onOpenDetail,
}: {
  post: BlogPost;
  onOpenDetail: (post: BlogPost) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const theme = getBlogTheme(post.blog_name);

  const safeThumbnailUrl = useMemo(() => {
    if (!post.thumbnail_url) return null;
    if (post.thumbnail_url.includes('unsplash.com')) return null;
    if (post.thumbnail_url.startsWith('http://')) {
      return post.thumbnail_url.replace('http://', 'https://');
    }
    return post.thumbnail_url;
  }, [post.thumbnail_url]);

  return (
    <article className="post-card group flex flex-col rounded-2xl overflow-hidden shadow-lg cursor-pointer">
      {/* 썸네일 영역 */}
      <div
        onClick={() => onOpenDetail(post)}
        className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950 cursor-pointer"
        title="클릭하여 상세 요약 보기"
      >
        {safeThumbnailUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={safeThumbnailUrl}
            alt={post.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        ) : (
          <div
            className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${theme.placeholderGradient} p-4 text-center`}
          >
            <BookOpen className={`w-8 h-8 ${theme.iconColor} stroke-1 mb-1 animate-pulse`} />
            <span className="text-[11px] text-slate-400/80 font-medium line-clamp-1">
              {post.blog_name}
            </span>
          </div>
        )}

        {/* 하단 그라디언트 섀도우 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity pointer-events-none" />

        {/* 블로그 뱃지 - 우측 하단 */}
        <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
          <span
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border backdrop-blur-md shadow-md ${theme.badge}`}
          >
            {post.blog_name}
          </span>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-2" onClick={() => onOpenDetail(post)}>
          {/* 날짜 & 주제 메타 */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-amber-400/80" />
              <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
              {theme.topicName}
            </span>
          </div>

          {/* 제목 */}
          <h3
            className={`text-[14.5px] font-extrabold text-slate-100 leading-snug tracking-tight ${theme.hover} transition-colors line-clamp-2`}
          >
            {post.title}
          </h3>

          {/* 150자 요약 본문 */}
          <p className="text-[12px] text-slate-400 line-clamp-3 leading-relaxed font-normal">
            {post.summary}
          </p>
        </div>

        {/* 하단 액션 버튼 바 */}
        <div className="pt-2.5 border-t border-white/[0.07] flex items-center gap-2">
          {/* 상세 보기 버튼 (체류 시간 증대 모달) */}
          <button
            type="button"
            onClick={() => onOpenDetail(post)}
            className="flex-1 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all text-center cursor-pointer"
          >
            요약 보기
          </button>

          {/* 원문 다이렉트 dofollow 링크 */}
          <a
            href={post.original_url}
            target="_blank"
            rel="dofollow"
            className={`px-3 py-2 text-xs font-bold rounded-xl border border-white/[0.1] bg-white/[0.04] text-amber-300 ${theme.btnHover} transition-all duration-200 group/btn shadow-sm flex items-center justify-center`}
            title={`${post.blog_name} 공식 원본 글 바로가기`}
          >
            <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </article>
  );
}

/**
 * 체류 시간(Dwell Time)을 극대화하는 상세 요약 모달 뷰
 */
function PostDetailModal({
  post,
  onClose,
}: {
  post: BlogPost | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!post) return null;
  const theme = getBlogTheme(post.blog_name);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(post.original_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900/95 border border-white/[0.12] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 backdrop-blur-2xl animate-scaleIn max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${theme.badge}`}
            >
              {post.blog_name}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {formatDate(post.published_at)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] transition-all cursor-pointer"
            title="닫기 (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 타이틀 */}
        <h2 className="text-lg sm:text-xl font-black text-white leading-snug tracking-tight">
          {post.title}
        </h2>

        {/* 150자 핵심 요약 박스 */}
        <div className="p-4.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>핵심 150자 큐레이션 요약</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            {post.summary}
          </p>
        </div>

        {/* 메타 안내 문구 */}
        <div className="text-xs text-slate-400/80 leading-relaxed bg-indigo-950/20 border border-indigo-500/20 p-3 rounded-xl">
          💡 모아 퀘스트는 공식 원문 포스팅으로 안전하게 연결해 드립니다. 전문 열람 및 상세 정보는 아래 공식 원문 페이지에서 확인하실 수 있습니다.
        </div>

        {/* 하단 버튼 바 */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-4 py-3 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>링크 복사됨</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>공유 링크 복사</span>
              </>
            )}
          </button>

          <a
            href={post.original_url}
            target="_blank"
            rel="dofollow"
            className={`w-full flex-1 py-3 px-5 text-sm font-extrabold text-white bg-gradient-to-r ${theme.modalButton} rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group/modalBtn cursor-pointer`}
          >
            <span>공식 원문 보러 가기</span>
            <ExternalLink className="w-4 h-4 group-hover/modalBtn:translate-x-0.5 group-hover/modalBtn:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}

const ITEMS_PER_PAGE = 16; // 4열 × 4행 = 16개

export default function PostListWithFilter({ initialPosts }: Props) {
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [mounted, setMounted] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 주제 카테고리별 글 통계 계산
  const topicStats = useMemo(() => {
    const stats: Record<string, number> = { ALL: initialPosts.length };
    for (const cat of TOPIC_CATEGORIES) {
      if (cat.id === 'ALL') continue;
      stats[cat.id] = initialPosts.filter((p) => cat.blogNames.includes(p.blog_name)).length;
    }
    return stats;
  }, [initialPosts]);

  // 필터링된 포스트 목록
  const filteredPosts = useMemo(() => {
    const activeCategory = TOPIC_CATEGORIES.find((c) => c.id === selectedTopic);
    return initialPosts.filter((post) => {
      // 카테고리 필터
      if (activeCategory && activeCategory.id !== 'ALL') {
        if (!activeCategory.blogNames.includes(post.blog_name)) return false;
      }
      // 검색어 필터
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return post.title.toLowerCase().includes(q) || post.summary.toLowerCase().includes(q);
      }
      return true;
    });
  }, [initialPosts, selectedTopic, searchQuery]);

  // 총 페이지 수 계산
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredPosts.length / ITEMS_PER_PAGE));
  }, [filteredPosts]);

  // 현재 페이지의 포스트 슬라이스
  const currentPosts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  // 페이지 이동 처리 및 상단 스크롤
  const goToPage = (page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(targetPage);
    if (sectionRef.current) {
      const topOffset = sectionRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopic(topicId);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // 번호형 페이지네이션 번호 목록 생성
  const paginationRange = useMemo(() => {
    const delta = 2; // 현재 페이지 좌우로 노출할 번호 개수
    const range: (number | string)[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }

    return range;
  }, [totalPages, currentPage]);

  return (
    <section ref={sectionRef} className="space-y-6">
      {/* ── 주제별(Topic) 탭 & 검색 바 (Control Bar) ── */}
      <div className="glass rounded-2xl p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        {/* 주제별 탭 목록 */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1 pb-1 lg:pb-0">
          {TOPIC_CATEGORIES.map((category) => {
            const isSelected = selectedTopic === category.id;
            return (
              <button
                key={category.id}
                onClick={() => handleSelectTopic(category.id)}
                className={`tab-btn flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg ring-1 ring-white/30`
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08]'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-white/[0.08] text-slate-400'
                  }`}
                >
                  {(topicStats[category.id] || 0).toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>

        {/* 검색 입력창 */}
        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="제목 및 본문 실시간 검색..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-white/[0.12] rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 transition-all backdrop-blur-md"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
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
            {TOPIC_CATEGORIES.find((c) => c.id === selectedTopic)?.name} 결과:
            <strong className="text-white font-bold ml-1.5">
              {filteredPosts.length.toLocaleString()}건
            </strong>
          </span>
          {searchQuery && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
              &lsquo;{searchQuery}&rsquo; 검색됨
            </span>
          )}
        </div>
        <span className="hidden sm:inline text-[11px] text-slate-400">
          페이지: <strong className="text-amber-400">{currentPage}</strong> / {totalPages} (총 {filteredPosts.length}개)
        </span>
      </div>

      {/* ── 4열 포스트 그리드 (16개 고정) ── */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-28 glass rounded-3xl">
          <p className="text-slate-400 text-sm">조건에 맞는 포스팅이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {currentPosts.map((post) => (
            <PostCardItem
              key={post.id || post.original_url}
              post={post}
              onOpenDetail={(p) => setSelectedPost(p)}
            />
          ))}
        </div>
      )}

      {/* ── 번호형 페이지네이션 컨트롤러 (1, 2, 3... 번호 네비게이션) ── */}
      {totalPages > 1 && (
        <nav
          aria-label="포스트 페이지 목록"
          className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-8 pb-4"
        >
          {/* 맨 처음 페이지 버튼 */}
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold glass border border-white/[0.08] text-slate-400 hover:text-white hover:border-amber-400/40 disabled:opacity-30 disabled:hover:border-white/[0.08] disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
            title="맨 처음 페이지로"
          >
            <ChevronsLeft className="w-4 h-4" />
            <span className="hidden sm:inline">처음</span>
          </button>

          {/* 이전 페이지 버튼 */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold glass border border-white/[0.08] text-slate-400 hover:text-white hover:border-amber-400/40 disabled:opacity-30 disabled:hover:border-white/[0.08] disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
            title="이전 페이지로"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">이전</span>
          </button>

          {/* 숫자 페이지네이션 번호 버튼들 */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {paginationRange.map((pageNumber, idx) => {
              if (pageNumber === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 py-1 text-slate-600 text-xs font-mono"
                  >
                    …
                  </span>
                );
              }

              const isCurrent = pageNumber === currentPage;
              return (
                <button
                  key={`page-${pageNumber}`}
                  onClick={() => goToPage(Number(pageNumber))}
                  className={`min-w-[36px] h-9 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 text-white shadow-lg shadow-amber-500/25 ring-1 ring-white/30 scale-105'
                      : 'glass border border-white/[0.08] text-slate-300 hover:text-white hover:border-amber-400/40 hover:bg-white/[0.06]'
                  }`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          {/* 다음 페이지 버튼 */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold glass border border-white/[0.08] text-slate-400 hover:text-white hover:border-amber-400/40 disabled:opacity-30 disabled:hover:border-white/[0.08] disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
            title="다음 페이지로"
          >
            <span className="hidden sm:inline">다음</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* 맨 끝 페이지 버튼 */}
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold glass border border-white/[0.08] text-slate-400 hover:text-white hover:border-amber-400/40 disabled:opacity-30 disabled:hover:border-white/[0.08] disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
            title="맨 끝 페이지로"
          >
            <span className="hidden sm:inline">끝</span>
            <ChevronsRight className="w-4 h-4" />
          </button>
        </nav>
      )}

      {/* ── 상세 요약 팝업 모달 ── */}
      {mounted && selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </section>
  );
}
