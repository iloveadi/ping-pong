import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { FeedSource, ParsedPost } from './types';

// 타겟 블로그 RSS 피드 목록 (네이버 블로그 및 워드프레스 공식 피드)
export const DEFAULT_FEEDS: FeedSource[] = [
  {
    id: 'naver-desktools',
    name: '[NB]Desktools',
    url: 'https://rss.blog.naver.com/desktools.xml',
    category: 'Desk Tools',
    isActive: true,
  },
  {
    id: 'naver-clpecha',
    name: '[NB]clpecha',
    url: 'https://rss.blog.naver.com/clpecha.xml',
    category: 'Lifestyle & Tech',
    isActive: true,
  },
  {
    id: 'naver-mind-archive',
    name: '[NB]마음산책',
    url: 'https://rss.blog.naver.com/mind-archive.xml',
    category: 'Mind & Essay',
    isActive: true,
  },
  {
    id: 'wp-pechamarket',
    name: '[WP]폐차마켓',
    url: 'http://pechamarket.co.kr/feed/',
    category: 'Auto & Market',
    isActive: true,
  },
];

// fallback 기본 썸네일 목록
const FALLBACK_THUMBNAILS = [
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop&q=80',
];

/**
 * 텍스트에서 HTML 태그 및 특수 기호를 제거하고 최대 150자로 안전하게 자르는 함수
 * (스팸/유사문서 패널티 방지를 위해 원문 전체는 절대 남기지 않고 150자 이하 요약본만 생성)
 */
export function cleanAndTruncateSummary(rawHtmlOrText?: string, maxLength: number = 150): string {
  if (!rawHtmlOrText) return '요약 내용이 없습니다.';

  // Cheerio를 통한 HTML 태그 완전 제거
  const $ = cheerio.load(rawHtmlOrText || '');
  let text = $.text();

  // 줄바꿈, 다중 공백, 특수문자 정제
  text = text
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

  if (!text) return '요약 내용이 없습니다.';

  if (text.length <= maxLength) {
    return text;
  }

  // 150자 엄격 절단 후 말줄임표(...) 추가
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * RSS 항목에서 썸네일 이미지 URL을 정밀 추출하는 함수
 */
export function extractThumbnail(item: any): string {
  // 1. media:content 또는 media:thumbnail 속성 확인
  if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
    return item['media:content'].$.url;
  }
  if (item['media:thumbnail'] && item['media:thumbnail'].$ && item['media:thumbnail'].$.url) {
    return item['media:thumbnail'].$.url;
  }

  // 2. enclosure 태그 확인 (이미지 타입)
  if (item.enclosure && item.enclosure.url) {
    const type = item.enclosure.type || '';
    if (type.startsWith('image/') || item.enclosure.url.match(/\.(jpeg|jpg|gif|png|webp)/i)) {
      return item.enclosure.url;
    }
  }

  // 3. content:encoded, content, description 내부의 첫 번째 <img> 태그 파싱
  const contentSnippet = item['content:encoded'] || item.content || item.description || '';
  if (contentSnippet) {
    try {
      const $ = cheerio.load(contentSnippet);
      const firstImgSrc = $('img').first().attr('src');
      if (firstImgSrc && (firstImgSrc.startsWith('http://') || firstImgSrc.startsWith('https://'))) {
        return firstImgSrc;
      }
    } catch {
      // 파싱 실패 시 무시
    }
  }

  // 4. 추출되지 않았을 경우 안정적인 기본 이미지 반환
  const randomFallback = FALLBACK_THUMBNAILS[Math.floor(Math.random() * FALLBACK_THUMBNAILS.length)];
  return randomFallback;
}

/**
 * 단일 RSS 피드를 파싱하여 정제된 포스팅 배열로 반환
 */
export async function parseSingleFeed(feed: FeedSource): Promise<ParsedPost[]> {
  const parser = new Parser({
    customFields: {
      item: [
        ['media:content', 'media:content', { keepArray: false }],
        ['media:thumbnail', 'media:thumbnail', { keepArray: false }],
        ['content:encoded', 'content:encoded'],
      ],
    },
    timeout: 8000, // 8초 타임아웃
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 RSS-Reader/1.0',
      'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
    },
  });

  try {
    const parsedFeed = await parser.parseURL(feed.url);
    const results: ParsedPost[] = [];

    if (!parsedFeed.items || parsedFeed.items.length === 0) {
      return [];
    }

    for (const item of parsedFeed.items) {
      const link = item.link?.trim();
      const title = item.title?.trim();

      // 필수 정보(URL, 제목)가 없으면 건너뜀
      if (!link || !title) continue;

      // 썸네일 이미지 추출
      const thumbnailUrl = extractThumbnail(item);

      // 요약 텍스트 정제 (HTML 태그 제거 후 최대 150자 제한)
      const anyItem = item as any;
      const rawBody = anyItem.contentSnippet || anyItem.description || anyItem.content || anyItem['content:encoded'] || '';
      const summary = cleanAndTruncateSummary(rawBody, 150);

      // 발행일자 ISO 형식 변환
      let publishedAt = new Date().toISOString();
      if (item.isoDate) {
        publishedAt = item.isoDate;
      } else if (item.pubDate) {
        const d = new Date(item.pubDate);
        if (!isNaN(d.getTime())) {
          publishedAt = d.toISOString();
        }
      }

      results.push({
        title,
        thumbnail_url: thumbnailUrl,
        summary,
        original_url: link,
        published_at: publishedAt,
        blog_name: feed.name || parsedFeed.title || '블로그',
        category: feed.category || '기타',
      });
    }

    return results;
  } catch (error) {
    console.error(`[RSS] 피드 파싱 실패 (${feed.name} - ${feed.url}):`, error);
    return [];
  }
}

/**
 * 등록된 모든 활성 RSS 피드들을 순회하며 새로운 포스팅 데이터 추출
 */
export async function fetchAllFeeds(feeds: FeedSource[] = DEFAULT_FEEDS): Promise<ParsedPost[]> {
  const activeFeeds = feeds.filter((f) => f.isActive);
  const feedPromises = activeFeeds.map((feed) => parseSingleFeed(feed));

  const feedResults = await Promise.allSettled(feedPromises);
  const allPosts: ParsedPost[] = [];

  for (const result of feedResults) {
    if (result.status === 'fulfilled') {
      allPosts.push(...result.value);
    }
  }

  // 최신 발행일자 순 정렬
  allPosts.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  return allPosts;
}
