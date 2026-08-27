const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const cheerio = require('cheerio');

const FEEDS = [
  {
    id: 'tistory-readpics',
    name: '인사이트 북스',
    url: 'https://read.pics/rss',
    category: 'Books & Insight',
    isActive: true,
  },
  {
    id: 'naver-desktools',
    name: 'Desktools.run 블로그',
    url: 'https://rss.blog.naver.com/desktools.xml',
    category: 'Desk Tools',
    isActive: true,
  },
  {
    id: 'naver-clpecha',
    name: '폐차마켓 블로그',
    url: 'https://rss.blog.naver.com/clpecha.xml',
    category: 'Lifestyle & Tech',
    isActive: true,
  },
  {
    id: 'naver-mind-archive',
    name: '마음산책',
    url: 'https://rss.blog.naver.com/mind-archive.xml',
    category: 'Mind & Essay',
    isActive: true,
  },
  {
    id: 'wp-pechamarket',
    name: '폐차마켓',
    url: 'http://pechamarket.co.kr/feed/',
    category: 'Auto & Market',
    isActive: true,
  },
  {
    id: 'naver-freek22',
    name: '폐차119',
    url: 'https://rss.blog.naver.com/freek22.xml',
    category: 'Auto & Market',
    isActive: true,
  },
];

const DATA_FILE = path.join(__dirname, '..', 'data', 'posts.json');

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media:content', { keepArray: false }],
      ['media:thumbnail', 'media:thumbnail', { keepArray: false }],
      ['content:encoded', 'content:encoded'],
    ],
  },
  timeout: 10000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 RSS-Reader/1.0',
    Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
  },
});

function cleanAndTruncateSummary(rawHtmlOrText, maxLength = 150) {
  if (!rawHtmlOrText) return '요약 내용이 없습니다.';
  const $ = cheerio.load(rawHtmlOrText || '');
  let text = $.text();
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
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

function extractThumbnail(item) {
  if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
    return item['media:content'].$.url;
  }
  if (item['media:thumbnail'] && item['media:thumbnail'].$ && item['media:thumbnail'].$.url) {
    return item['media:thumbnail'].$.url;
  }
  if (item.enclosure && item.enclosure.url) {
    const type = item.enclosure.type || '';
    if (type.startsWith('image/') || item.enclosure.url.match(/\.(jpeg|jpg|gif|png|webp)/i)) {
      return item.enclosure.url;
    }
  }

  const contentSnippet = item['content:encoded'] || item.content || item.description || '';
  if (contentSnippet) {
    try {
      const $ = cheerio.load(contentSnippet);
      const candidates = [];
      $('img').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-url') || $(el).attr('data-phocus');
        if (!src || (!src.startsWith('http://') && !src.startsWith('https://'))) return;

        const w = parseInt($(el).attr('data-origin-width') || $(el).attr('width') || '0', 10);
        const h = parseInt($(el).attr('data-origin-height') || $(el).attr('height') || '0', 10);
        const fn = ($(el).attr('data-filename') || '').toLowerCase();
        const alt = ($(el).attr('alt') || '').toLowerCase();

        if (fn.includes('쿠팡') || alt.includes('쿠팡') || fn.includes('파트너스') || (w > 0 && h > 0 && w <= 450 && h <= 120)) {
          return;
        }

        candidates.push(src);
      });

      if (candidates.length > 0) {
        return candidates[0];
      }

      const firstImgSrc = $('img').first().attr('src') || $('img').first().attr('data-url');
      if (firstImgSrc && (firstImgSrc.startsWith('http://') || firstImgSrc.startsWith('https://'))) {
        return firstImgSrc;
      }
    } catch {}
  }
  return '';
}

async function syncAll() {
  console.log('[Sync] 모든 RSS 피드 수집 시작...');
  const existingPosts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const existingUrlSet = new Set(existingPosts.map((p) => p.original_url));
  console.log(`[Sync] 기존 로컬 저장 포스트: ${existingPosts.length}건`);

  const newPosts = [];

  for (const feed of FEEDS) {
    if (!feed.isActive) continue;
    try {
      console.log(`[Sync] 피드 파싱 중: ${feed.name} (${feed.url})`);
      const parsedFeed = await parser.parseURL(feed.url);
      let count = 0;
      for (const item of parsedFeed.items || []) {
        const link = item.link?.trim();
        let title = item.title?.trim();
        if (!link || !title) continue;

        title = title
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        const thumbnailUrl = extractThumbnail(item);
        const rawBody = item.contentSnippet || item.description || item.content || item['content:encoded'] || '';
        const summary = cleanAndTruncateSummary(rawBody, 150);

        let publishedAt = new Date().toISOString();
        if (item.isoDate) {
          publishedAt = item.isoDate;
        } else if (item.pubDate) {
          const d = new Date(item.pubDate);
          if (!isNaN(d.getTime())) {
            publishedAt = d.toISOString();
          }
        }

        if (!existingUrlSet.has(link)) {
          existingUrlSet.add(link);
          newPosts.push({
            id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            title,
            thumbnail_url: thumbnailUrl,
            summary,
            original_url: link,
            published_at: publishedAt,
            blog_name: feed.name,
            category: feed.category || '기타',
            created_at: new Date().toISOString(),
          });
          count++;
        }
      }
      console.log(`[Sync] -> ${feed.name}: ${count}건 신규 추가`);
    } catch (err) {
      console.error(`[Sync] -> ${feed.name} 파싱 실패:`, err.message);
    }
  }

  if (newPosts.length > 0) {
    const combined = [...newPosts, ...existingPosts];
    // 최신순 정렬
    combined.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    fs.writeFileSync(DATA_FILE, JSON.stringify(combined, null, 2), 'utf-8');
    console.log(`[Sync] 총 ${newPosts.length}건 신규 포스트가 저장되었습니다. (전체: ${combined.length}건)`);
  } else {
    console.log('[Sync] 새로 추가할 포스트가 없습니다.');
  }
}

syncAll();
