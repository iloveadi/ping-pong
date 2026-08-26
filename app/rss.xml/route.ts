import { NextRequest } from 'next/server';
import { getPosts } from '@/lib/db';

export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(request: NextRequest) {
  // 실제 요청 호스트(예: moa.quest 또는 www.moa.quest) 자동 감지
  const host = request.headers.get('host') || 'moa.quest';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const posts = await getPosts(50); // 최신 50개 포스트 발행

  const rssItemsXml = posts
    .map((post) => {
      const pubDate = post.published_at
        ? new Date(post.published_at).toUTCString()
        : new Date().toUTCString();
      const escapedTitle = escapeXml(post.title || '');
      const escapedSummary = escapeXml(post.summary || '');
      const escapedLink = escapeXml(post.original_url || baseUrl);

      return `    <item>
      <title>${escapedTitle}</title>
      <link>${escapedLink}</link>
      <description>${escapedSummary}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${escapedLink}</guid>
    </item>`;
    })
    .join('\n');

  const nowRfc822 = new Date().toUTCString();
  const escapedBaseUrl = escapeXml(baseUrl);

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>핑퐁허브</title>
    <link>${escapedBaseUrl}</link>
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
