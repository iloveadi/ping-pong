import { NextRequest, NextResponse } from 'next/server';
import { fetchAllFeeds, DEFAULT_FEEDS } from '@/lib/rss';
import { savePosts, seedLocalPostsToSupabase, getPosts } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// 서버 내부 관리자 비밀번호 (브라우저 소스코드에는 절대 노출되지 않음)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1212';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    // 서버 사이드 비밀번호 검증 (외부에서 소스보기로 절대 확인 불가)
    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    console.log('[Admin Sync] 관리자 인증 성공, 피드 동기화 시작...');
    
    // 1. 혹시 과거 데이터가 DB에 없다면 과거 데이터 먼저 마이그레이션
    const currentPosts = await getPosts(500);
    let seededCount = 0;
    if (currentPosts.length < 500) {
      seededCount = await seedLocalPostsToSupabase();
    }

    // 2. 최신 RSS 피드 수집
    const parsedPosts = await fetchAllFeeds(DEFAULT_FEEDS);
    const stats = await savePosts(parsedPosts);
    stats.totalFeeds = DEFAULT_FEEDS.filter((f) => f.isActive).length;
    stats.savedCount += seededCount;

    try {
      revalidatePath('/');
    } catch {
      // revalidate 에러 무시
    }


    return NextResponse.json({
      success: true,
      message: '피드 동기화가 성공적으로 완료되었습니다.',
      stats: {
        totalFeeds: stats.totalFeeds,
        fetchedItems: stats.fetchedItems,
        savedCount: stats.savedCount,
        skippedCount: stats.skippedCount,
      },
    });
  } catch (error: any) {
    console.error('[Admin Sync] 동기화 중 에러:', error);
    return NextResponse.json(
      { success: false, message: error?.message || '동기화 중 오류가 발생했습니다.' },
      { status: 400 }
    );
  }
}
