-- ============================================================
-- 블로그 백링크 RSS 자동 수집 데이터베이스 스키마
-- Supabase SQL Editor에 복사하여 실행하세요.
-- ============================================================

-- 1. 포스트 테이블 생성
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  summary VARCHAR(200) NOT NULL, -- 150자 제한 요약 (스팸 방지)
  original_url TEXT NOT NULL UNIQUE, -- 중복 수집 방지 고유 키
  published_at TIMESTAMPTZ NOT NULL,
  blog_name TEXT NOT NULL,
  category TEXT DEFAULT '일반',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 성능 최적화 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_original_url ON public.posts (original_url);
CREATE INDEX IF NOT EXISTS idx_posts_blog_name ON public.posts (blog_name);

-- 3. Row Level Security (RLS) 활성화
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 4. 누구나 포스트를 읽을 수 있도록 읽기 권한 허용
CREATE POLICY "Allow public read access on posts"
  ON public.posts
  FOR SELECT
  USING (true);

-- 5. 서비스 롤 또는 인증된 Cron 요청만 INSERT/UPDATE 허용
CREATE POLICY "Allow insert posts for service role"
  ON public.posts
  FOR INSERT
  WITH CHECK (true);
