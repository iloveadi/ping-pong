const fs = require('fs');
const path = require('path');
const https = require('https');
const cheerio = require('cheerio');

const DATA_FILE = path.join(__dirname, '..', 'data', 'posts.json');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(fetchHtml(res.headers.location));
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
        res.on('error', reject);
      }
    ).on('error', reject);
  });
}

function cleanAndTruncateSummary(rawText, maxLength = 150) {
  if (!rawText) return '도서 인사이트 및 서평 본문입니다. 원문 보러 가기를 통해 전문을 확인하실 수 있습니다.';
  let text = rawText
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

async function run() {
  console.log('[ReadPics] sitemap.xml 조회 중...');
  const sitemapXml = await fetchHtml('https://read.pics/sitemap.xml');
  const entryUrls = [...sitemapXml.matchAll(/<loc>(https:\/\/read\.pics\/entry\/[^<]+)<\/loc>/g)].map(
    (m) => m[1]
  );

  console.log(`[ReadPics] 총 ${entryUrls.length}개의 아티클 URL 발견. 전체 포스트 메타데이터 수집 시작...`);

  const existingPosts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const existingUrlMap = new Map(existingPosts.map((p) => [p.original_url, p]));

  const collectedPosts = [];
  const CONCURRENCY = 15;
  let completed = 0;

  for (let i = 0; i < entryUrls.length; i += CONCURRENCY) {
    const batch = entryUrls.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (url) => {
        try {
          const html = await fetchHtml(url);
          const $ = cheerio.load(html);
          let title =
            $('meta[property="og:title"]').attr('content') ||
            $('title').text().replace(' :: 인사이트 북스 (Insight Books)', '').trim();
          let rawSummary =
            $('meta[property="og:description"]').attr('content') ||
            $('.entry-content, .article, .tt_article_useless_p_margin').first().text() ||
            '';
          let image = $('meta[property="og:image"]').attr('content') || '';
          let publishedAt = $('meta[property="article:published_time"]').attr('content') || '';

          if (!publishedAt) {
            const dateText = $('.date, time, .published').first().text();
            if (dateText) {
              const d = new Date(dateText);
              if (!isNaN(d.getTime())) publishedAt = d.toISOString();
            }
          }
          if (!publishedAt) {
            publishedAt = new Date().toISOString();
          }

          title = title
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();

          const summary = cleanAndTruncateSummary(rawSummary, 150);

          collectedPosts.push({
            id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            title,
            thumbnail_url: image || '',
            summary,
            original_url: url,
            published_at: new Date(publishedAt).toISOString(),
            blog_name: '인사이트 북스',
            category: 'Books & Insight',
            created_at: new Date().toISOString(),
          });
        } catch (e) {
          console.error(`[ReadPics] 실패 (${url}):`, e.message);
        } finally {
          completed++;
        }
      })
    );
    process.stdout.write(`\r진행률: ${completed}/${entryUrls.length} (${Math.round((completed / entryUrls.length) * 100)}%)`);
  }
  console.log('\n[ReadPics] 메타데이터 수집 완료!');

  // 기존 posts.json과 병합 (인사이트 북스 글은 최신 수집 데이터로 덮어쓰기/추가)
  const nonReadPicsPosts = existingPosts.filter((p) => p.blog_name !== '인사이트 북스');
  const combined = [...collectedPosts, ...nonReadPicsPosts];

  // 최신 발행일자 순 정렬
  combined.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  fs.writeFileSync(DATA_FILE, JSON.stringify(combined, null, 2), 'utf-8');
  console.log(`[ReadPics] posts.json 갱신 완료! (인사이트 북스: ${collectedPosts.length}건, 전체: ${combined.length}건)`);
}

run().catch(console.error);
