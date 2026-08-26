import { NextRequest } from 'next/server';
import { getPosts } from '@/lib/db';

export const dynamic = 'force-dynamic';

function cleanCdata(text: string): string {
  if (!text) return '';
  return text.replace(/]]>/g, ']]&gt;');
}

export async function GET(request: NextRequest) {
  // 사용자가 요청한 실제 호스트 도메인(예: https://moa.quest)을 자동 감지
  const host = request.headers.get('host') || 'moa.quest';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const posts = await getPosts(50); // 최신 50개 포스트 발행

  const rssItemsXml = posts
    .map((post) => {
      const pubDate = post.published_at
        ? new Date(post.published_at).toUTCString()
        : new Date().toUTCString();
      const title = cleanCdata(post.title);
      const summary = cleanCdata(post.summary);
      const link = post.original_url || baseUrl;

      return `<item>
<title><![CDATA[${title}]]></title>
<link>${link}</link>
<description><![CDATA[${summary}]]></description>
<pubDate>${pubDate}</pubDate>
<guid isPermaLink="true">${link}</guid>
</item>`;
    })
    .join('\n');

  const nowRfc822 = new Date().toUTCString();

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>핑퐁허브</title>
<link>${baseUrl}</link>
<description>생산성 도구, 자동차 라이프, 마음 치유 에세이 등 유익한 최신 블로그 아티클 큐레이션</description>
<language>ko</language>
<pubDate>${nowRfc822}</pubDate>
<lastBuildDate>${nowRfc822}</lastBuildDate>
${rssItemsXml}
</channel>
</rss>`.trim();

  return new Response(xmlContent, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
