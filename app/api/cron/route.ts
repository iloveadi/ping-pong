import { NextRequest, NextResponse } from 'next/server';
import { fetchAllFeeds, DEFAULT_FEEDS } from '@/lib/rss';
import { savePosts } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// 캐시를 사용하지 않고 매 호출 시마다 동적으로 실행
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel 서버리스 함수 실행 최대 시간

/**
 * Vercel Cron Job 트리거 GET 엔드포인트
 * - 주기적으로 RSS 피드를 순회 수집하여 새로운 글만 DB에 적재
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // 프로덕션 환경이고 CRON_SECRET이 설정된 경우 보안 검증 (Vercel Cron은 자동으로 Bearer 토큰 전달)
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // 로컬 개발 환경이 아니면 401 반환
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { success: false, message: '인증되지 않은 Cron 요청입니다.' },
          { status: 401 }
        );
      }
    }

    const startTime = Date.now();
    console.log('[Cron] RSS 자동 수집 작업 시작...');

    // 1. 등록된 RSS 피드들 파싱 및 정제
    const parsedPosts = await fetchAllFeeds(DEFAULT_FEEDS);
    console.log(`[Cron] 총 ${parsedPosts.length}개의 포스팅을 RSS 피드로부터 파싱 완료.`);

    // 2. 중복 방어 로직을 거쳐 DB에 저장
    const stats = await savePosts(parsedPosts);
    stats.totalFeeds = DEFAULT_FEEDS.filter((f) => f.isActive).length;

    // 3. 메인 페이지 ISR 캐시 갱신 (새로운 백링크가 즉시 렌더링되도록)
    try {
      revalidatePath('/');
    } catch {
      // revalidate 에러 무시
    }

    const elapsed = Date.now() - startTime;
    console.log(`[Cron] 수집 완료 (${elapsed}ms): 신규 저장 ${stats.savedCount}개, 중복 제외 ${stats.skippedCount}개`);

    return NextResponse.json({
      success: true,
      message: 'RSS 피드 수집 및 DB 업데이트가 성공적으로 완료되었습니다.',
      timestamp: new Date().toISOString(),
      duration: `${elapsed}ms`,
      stats: {
        totalFeeds: stats.totalFeeds,
        fetchedItems: stats.fetchedItems,
        savedCount: stats.savedCount,
        skippedCount: stats.skippedCount,
      },
    });
  } catch (error: any) {
    console.error('[Cron] 작업 중 에러 발생:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'RSS 수집 중 오류가 발생했습니다.',
        error: error?.message || String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
