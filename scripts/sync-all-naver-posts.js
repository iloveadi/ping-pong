const fs = require('fs');
const path = require('path');
const https = require('https');
const cheerio = require('cheerio');

const BLOGS = [
  {
    blogId: 'mind-archive',
    name: '마음 산책',
    category: 'Mind & Essay',
  },
  {
    blogId: 'desktools',
    name: 'Desktools 블로그',
    category: 'Desk Tools',
  },
  {
    blogId: 'clpecha',
    name: 'Clpecha 블로그',
    category: 'Lifestyle & Tech',
  },
];

const FALLBACK_THUMBNAILS = [
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop&q=80',
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Referer: 'https://blog.naver.com/',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
        res.on('error', reject);
      }
    ).on('error', reject);
  });
}

function decodeNaverTitle(rawTitle) {
  if (!rawTitle) return '';
  try {
    return decodeURIComponent(rawTitle.replace(/\+/g, ' '));
  } catch {
    try {
      return decodeURI(rawTitle.replace(/\+/g, ' '));
    } catch {
      return rawTitle;
    }
  }
}

function cleanAndTruncateSummary(rawText, maxLength = 150) {
  if (!rawText) return '블로그 본문 내용입니다. 원문 보러 가기를 통해 전체 내용을 확인하실 수 있습니다.';
  let text = rawText
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

function safeParseNaverResponse(rawString) {
  // 1. 기본 JSON.parse 시도
  try {
    return JSON.parse(rawString);
  } catch (e) {
    // 2. 잘못된 escape 문자 정규화 후 시도
    try {
      const fixed = rawString.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
      return JSON.parse(fixed);
    } catch (e2) {
      // 3. 정규식을 통한 아이템 파싱
      const items = [];
      const totalMatch = rawString.match(/"totalCount":\s*(\d+)/) || rawString.match(/"totalCount":\s*"(\d+)"/);
      const totalCount = totalMatch ? parseInt(totalMatch[1]) : 0;

      // logNo와 title, addDate 추출
      const logNoRegex = /"logNo"\s*:\s*"(\d+)"/g;
      const titleRegex = /"title"\s*:\s*"([^"]*)"/g;
      const dateRegex = /"addDate"\s*:\s*"([^"]*)"/g;

      const logNos = [...rawString.matchAll(logNoRegex)].map((m) => m[1]);
      const titles = [...rawString.matchAll(titleRegex)].map((m) => m[1]);
      const dates = [...rawString.matchAll(dateRegex)].map((m) => m[1]);

      for (let i = 0; i < logNos.length; i++) {
        items.push({
          logNo: logNos[i],
          title: titles[i] || '',
          addDate: dates[i] || '',
        });
      }

      return { totalCount: totalCount || items.length, postList: items };
    }
  }
}

async function fetchBlogPostsList(blogId) {
  let page = 1;
  const countPerPage = 30;
  const allListItems = [];

  while (true) {
    const url = `https://blog.naver.com/PostTitleListAsync.naver?blogId=${blogId}&viewdate=&currentPage=${page}&categoryNo=&parentCategoryNo=&countPerPage=${countPerPage}`;
    try {
      const rawRes = await fetchUrl(url);
      const parsed = safeParseNaverResponse(rawRes);
      if (!parsed.postList || parsed.postList.length === 0) break;

      allListItems.push(...parsed.postList);
      console.log(`[${blogId}] 페이지 ${page} 수집 완료 (${parsed.postList.length}건, 누적 ${allListItems.length} / 총 ${parsed.totalCount}건)`);

      if (allListItems.length >= parsed.totalCount || parsed.postList.length < countPerPage) {
        break;
      }
      page++;
      await new Promise((r) => setTimeout(r, 60));
    } catch (e) {
      console.error(`[${blogId}] 페이지 ${page} 요청 에러:`, e);
      break;
    }
  }

  return allListItems;
}

// 모바일 뷰에서 썸네일과 첫 150자 본문 가져오기
async function fetchPostDetail(blogId, logNo) {
  const mobileUrl = `https://m.blog.naver.com/${blogId}/${logNo}`;
  try {
    const html = await fetchUrl(mobileUrl);
    const $ = cheerio.load(html);

    // 1. 썸네일 이미지 추출
    let thumbnail =
      $('meta[property="og:image"]').attr('content') ||
      $('.se-image-resource').first().attr('src') ||
      $('.se_mediaImage').first().attr('src') ||
      $('img.se_mediaImage').first().attr('src') ||
      $('img._img').first().attr('src');

    if (!thumbnail || thumbnail.includes('static.naver.net') || thumbnail.includes('blogthumb.pstatic.net/default')) {
      thumbnail = FALLBACK_THUMBNAILS[Math.floor(Math.random() * FALLBACK_THUMBNAILS.length)];
    }

    // 2. 150자 요약 추출
    let summary = $('meta[property="og:description"]').attr('content') || $('.se-main-container').text() || '';
    summary = cleanAndTruncateSummary(summary, 150);

    return { thumbnail, summary };
  } catch {
    return {
      thumbnail: FALLBACK_THUMBNAILS[Math.floor(Math.random() * FALLBACK_THUMBNAILS.length)],
      summary: '블로그 본문 내용입니다. 원문 보러 가기를 통해 전체 내용을 확인하실 수 있습니다.',
    };
  }
}

async function main() {
  const postsFile = path.join(process.cwd(), 'data', 'posts.json');
  let existingPosts = [];
  if (fs.existsSync(postsFile)) {
    existingPosts = JSON.parse(fs.readFileSync(postsFile, 'utf8'));
  }
  const existingUrlMap = new Map(existingPosts.map((p) => [p.original_url.split('?')[0], p]));

  console.log(`기존 DB에 저장된 글 수: ${existingPosts.length}건`);

  const allParsedPosts = [];

  for (const blog of BLOGS) {
    console.log(`\n========================================`);
    console.log(`▶ [${blog.name} (@${blog.blogId})] 과거 글 전체 수집 시작...`);
    const listItems = await fetchBlogPostsList(blog.blogId);
    console.log(`▶ [${blog.name}] 총 ${listItems.length}개의 포스팅 목록 확보! 세부 정제 진행 중...`);

    let count = 0;
    for (const item of listItems) {
      count++;
      const logNo = item.logNo;
      const originalUrl = `https://blog.naver.com/${blog.blogId}/${logNo}`;
      const cleanUrlKey = originalUrl.split('?')[0];

      const decodedTitle = decodeNaverTitle(item.title);

      // 발행일자 파싱
      let publishedAt = new Date().toISOString();
      if (item.addDate) {
        const parts = item.addDate.replace(/\./g, ' ').trim().split(/\s+/);
        if (parts.length >= 3) {
          const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          if (!isNaN(d.getTime())) {
            publishedAt = d.toISOString();
          }
        }
      }

      // 이미 저장된 글이면 기존 썸네일/요약 재사용하여 고속 처리
      let thumbnail_url = '';
      let summary = '';

      if (existingUrlMap.has(cleanUrlKey)) {
        const existing = existingUrlMap.get(cleanUrlKey);
        thumbnail_url = existing.thumbnail_url;
        summary = existing.summary;
      } else {
        // 새 글인 경우 모바일 뷰에서 썸네일 & 150자 요약 가져오기
        const detail = await fetchPostDetail(blog.blogId, logNo);
        thumbnail_url = detail.thumbnail;
        summary = detail.summary;
        await new Promise((r) => setTimeout(r, 40));
      }

      if (count % 30 === 0 || count === listItems.length) {
        console.log(`  - [${blog.name}] ${count}/${listItems.length} 글 정제 완료...`);
      }

      allParsedPosts.push({
        id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        title: decodedTitle,
        thumbnail_url: thumbnail_url,
        summary: summary,
        original_url: `${originalUrl}?fromRss=true&trackingCode=rss`,
        published_at: publishedAt,
        blog_name: blog.name,
        category: blog.category,
        created_at: new Date().toISOString(),
      });
    }
  }

  // 최신 발행일순 정렬
  allParsedPosts.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  console.log(`\n========================================`);
  console.log(`🎉 모든 블로그 과거 글 수집 완료! 총 ${allParsedPosts.length}건`);

  fs.writeFileSync(postsFile, JSON.stringify(allParsedPosts, null, 2), 'utf8');
  console.log(`data/posts.json 파일에 성공적으로 저장되었습니다!`);
}

main().catch(console.error);
