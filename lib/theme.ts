export function formatDate(dateStr: string): string {
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

export function getBlogTheme(blogName: string) {
  if (blogName.includes('인사이트') || blogName.includes('Insight') || blogName.includes('read.pics')) {
    return {
      topicName: '도서·인사이트',
      badge: 'text-violet-300 bg-violet-950/90 border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.25)]',
      dot: 'bg-violet-400',
      hover: 'group-hover:text-violet-300',
      btnHover: 'hover:bg-violet-500/20 hover:border-violet-500/50 hover:text-violet-200',
      placeholderGradient: 'from-violet-950/60 via-slate-900 to-purple-950/40',
      iconColor: 'text-violet-400/70',
      modalAccent: 'text-violet-400',
      modalButton: 'from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-purple-500 shadow-violet-500/30',
    };
  }
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
  if (blogName.includes('폐차')) {
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
