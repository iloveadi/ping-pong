import fs from 'fs';
import path from 'path';
import initialLocalPosts from '@/data/posts.json';
import { supabase, isSupabaseConfigured } from './supabase';
import { BlogPost, ParsedPost, SyncStats } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_POSTS_FILE = path.join(DATA_DIR, 'posts.json');

/**
 * 번들에 포함된 로컬 포스트 데이터 조회
 */
function getLocalPosts(): BlogPost[] {
  return initialLocalPosts as unknown as BlogPost[];
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
 * DB에서 최신 포스팅 목록을 조회하는 함수 (기본 최신순, Supabase 1000건 제한 돌파 페이지네이션)
 */
export async function getPosts(limit: number = 3000, offset: number = 0): Promise<BlogPost[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const allFetched: BlogPost[] = [];
      const PAGE_SIZE = 1000;
      let currentOffset = offset;
      const targetTotal = offset + limit;

      while (currentOffset < targetTotal) {
        const fetchLimit = Math.min(PAGE_SIZE, targetTotal - currentOffset);
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('published_at', { ascending: false })
          .range(currentOffset, currentOffset + fetchLimit - 1);

        if (error) {
          console.error('[Supabase] 포스트 조회 에러:', error);
          if (allFetched.length > 0) return allFetched;
          return getLocalPosts().slice(offset, offset + limit);
        }

        if (!data || data.length === 0) break;
        allFetched.push(...(data as BlogPost[]));
        if (data.length < fetchLimit) break; // 끝까지 조회 완료
        currentOffset += data.length;
      }

      return allFetched;
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
    // 1-1. DB에 존재하는 기존 original_url 전체를 안전하게 페이지네이션하여 조회 (PostgREST .in 특수문자/괄호 오류 방지)
    const existingUrlSet = new Set<string>();
    let currentOffset = 0;
    const PAGE_SIZE = 1000;

    while (true) {
      const { data: existingRows, error: checkError } = await supabase
        .from('posts')
        .select('original_url')
        .range(currentOffset, currentOffset + PAGE_SIZE - 1);

      if (checkError) {
        console.error('[Supabase] 기존 URL 목록 조회 에러:', checkError);
        throw new Error(`[Supabase 중복조회 오류] ${checkError.message} (${checkError.code || ''})`);
      }

      if (!existingRows || existingRows.length === 0) break;
      for (const row of existingRows) {
        if (row.original_url) {
          existingUrlSet.add(row.original_url);
        }
      }
      if (existingRows.length < PAGE_SIZE) break;
      currentOffset += existingRows.length;
    }

    // 1-2. 중복되지 않은 신규 포스트만 필터링
    const postsToInsert = uniqueIncomingPosts
      .filter((p) => !existingUrlSet.has(p.original_url))
      .map((p) => ({
        title: p.title,
        thumbnail_url: p.thumbnail_url || null,
        summary: (p.summary || '요약 내용이 없습니다.').slice(0, 195),
        original_url: p.original_url,
        published_at: p.published_at,
        blog_name: p.blog_name,
        category: p.category || '일반',
        created_at: new Date().toISOString(),
      }));

    let totalSaved = 0;
    if (postsToInsert.length > 0) {
      const CHUNK_SIZE = 50;
      for (let i = 0; i < postsToInsert.length; i += CHUNK_SIZE) {
        const chunk = postsToInsert.slice(i, i + CHUNK_SIZE);
        const { error: insertError } = await supabase
          .from('posts')
          .upsert(chunk, { onConflict: 'original_url', ignoreDuplicates: true });

        if (insertError) {
          console.error('[Supabase] 신규 포스트 저장 에러:', insertError);
          throw new Error(`[Supabase 저장 오류] ${insertError.message} (${insertError.code || ''})`);
        }
        totalSaved += chunk.length;
      }
    }

    return {
      totalFeeds: 0, // 상위에서 세팅
      fetchedItems: fetchedCount,
      savedCount: totalSaved,
      skippedCount: fetchedCount - totalSaved,
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

/**
 * 로컬 posts.json에 보관된 과거 전체 아티클(1028건)을 Supabase DB로 1회 일괄 마이그레이션
 */
export async function seedLocalPostsToSupabase(): Promise<number> {
  const localPosts = getLocalPosts();
  if (localPosts.length === 0) return 0;

  console.log(`[Seed] 로컬 파일의 과거 아티클 ${localPosts.length}건을 Supabase로 마이그레이션 시작...`);
  const stats = await savePosts(localPosts);
  console.log(`[Seed] 마이그레이션 완료: ${stats.savedCount}건 신규 적재`);
  return stats.savedCount;
}

