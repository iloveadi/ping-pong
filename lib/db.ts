import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from './supabase';
import { BlogPost, ParsedPost, SyncStats } from './types';

// 로컬 파일 기반 Fallback 스토리지 경로 (Supabase 미설정 시 자동 사용)
const DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_POSTS_FILE = path.join(DATA_DIR, 'posts.json');

/**
 * 로컬 JSON 저장소 초기화 및 읽기 헬퍼
 */
function getLocalPosts(): BlogPost[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_POSTS_FILE)) {
      fs.writeFileSync(LOCAL_POSTS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const fileData = fs.readFileSync(LOCAL_POSTS_FILE, 'utf-8');
    return JSON.parse(fileData) as BlogPost[];
  } catch (error) {
    console.error('[DB] 로컬 포스트 파일 읽기 오류:', error);
    return [];
  }
}

/**
 * 로컬 JSON 파일에 포스트 저장
 */
function saveLocalPosts(posts: BlogPost[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (error) {
    console.error('[DB] 로컬 포스트 파일 저장 오류:', error);
  }
}

/**
 * DB에서 최신 포스팅 목록을 조회하는 함수 (기본 최신순)
 */
export async function getPosts(limit: number = 60, offset: number = 0): Promise<BlogPost[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('[Supabase] 포스트 조회 에러:', error);
        return getLocalPosts().slice(offset, offset + limit);
      }

      return data as BlogPost[];
    } catch (err) {
      console.error('[Supabase] 연결 실패, 로컬 데이터로 대체합니다:', err);
      return getLocalPosts().slice(offset, offset + limit);
    }
  }

  // Fallback: 로컬 데이터베이스 반환
  const localPosts = getLocalPosts();
  return localPosts
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(offset, offset + limit);
}

/**
 * 파싱된 포스팅 목록을 중복 방어 로직을 적용하여 DB에 저장하는 함수
 * [핵심 방어 로직] 이미 존재하는 original_url 은 완전히 제외하고 신규 포스트만 INSERT/저장합니다.
 */
export async function savePosts(incomingPosts: ParsedPost[]): Promise<SyncStats> {
  if (!incomingPosts || incomingPosts.length === 0) {
    return { totalFeeds: 0, fetchedItems: 0, savedCount: 0, skippedCount: 0 };
  }

  // 메모리 상에서 incomingPosts 내부의 자체 중복 URL 제거
  const uniqueIncomingMap = new Map<string, ParsedPost>();
  for (const post of incomingPosts) {
    if (post.original_url && !uniqueIncomingMap.has(post.original_url)) {
      uniqueIncomingMap.set(post.original_url, post);
    }
  }
  const uniqueIncomingPosts = Array.from(uniqueIncomingMap.values());
  const fetchedCount = incomingPosts.length;

  // 1. Supabase가 설정되어 있는 경우
  if (isSupabaseConfigured && supabase) {
    const incomingUrls = uniqueIncomingPosts.map((p) => p.original_url);

    // 이미 저장된 URL 목록 조회
    const { data: existingRows, error: checkError } = await supabase
      .from('posts')
      .select('original_url')
      .in('original_url', incomingUrls);

    if (checkError) {
      console.error('[Supabase] 기존 URL 중복 체크 에러:', checkError);
      throw new Error(`[Supabase 중복조회 오류] ${checkError.message} (${checkError.code || ''})`);
    }

    const existingUrlSet = new Set((existingRows || []).map((row: { original_url: string }) => row.original_url));

    // 중복되지 않은 신규 포스트만 필터링
    const postsToInsert = uniqueIncomingPosts
      .filter((p) => !existingUrlSet.has(p.original_url))
      .map((p) => ({
        title: p.title,
        thumbnail_url: p.thumbnail_url,
        summary: p.summary,
        original_url: p.original_url,
        published_at: p.published_at,
        blog_name: p.blog_name,
        category: p.category || '일반',
        created_at: new Date().toISOString(),
      }));

    if (postsToInsert.length > 0) {
      const { error: insertError } = await supabase.from('posts').insert(postsToInsert);

      if (insertError) {
        console.error('[Supabase] 신규 포스트 저장 에러:', insertError);
        throw new Error(`[Supabase 저장 오류] ${insertError.message} (${insertError.code || ''})`);
      }
    }

    return {
      totalFeeds: 0, // 상위에서 세팅
      fetchedItems: fetchedCount,
      savedCount: postsToInsert.length,
      skippedCount: fetchedCount - postsToInsert.length,
    };
  }

  // 2. Fallback: 로컬 JSON 스토리지 처리 (로컬 개발 환경 전용)
  const existingLocalPosts = getLocalPosts();
  const existingLocalUrlSet = new Set(existingLocalPosts.map((p) => p.original_url));

  const newLocalPosts: BlogPost[] = [];
  for (const post of uniqueIncomingPosts) {
    if (!existingLocalUrlSet.has(post.original_url)) {
      newLocalPosts.push({
        id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        ...post,
        created_at: new Date().toISOString(),
      });
      existingLocalUrlSet.add(post.original_url); // 연속 중복 방지
    }
  }

  if (newLocalPosts.length > 0) {
    const updatedList = [...newLocalPosts, ...existingLocalPosts];
    saveLocalPosts(updatedList);
  }

  return {
    totalFeeds: 0,
    fetchedItems: fetchedCount,
    savedCount: newLocalPosts.length,
    skippedCount: fetchedCount - newLocalPosts.length,
  };
}
