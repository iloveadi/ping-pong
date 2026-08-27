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
  // 실제 요청 호스트 (예: moa.quest 또는 www.moa.quest) 자동 감지
  const host = request.headers.get('host') || 'moa.quest';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const posts = await getPosts(50); // 최신 50개 포스트 발행

  const rssItemsXml = posts
    .map((post, idx) => {
      const pubDate = post.published_at
        ? new Date(post.published_at).toUTCString()
        : new Date().toUTCString();
      const escapedTitle = escapeXml(post.title || '');
      const escapedSummary = escapeXml(post.summary || '');
      // 네이버 서치어드바이저 RSS 필수 규칙: <link>와 <guid>가 반드시 등록 사이트 도메인(moa.quest) 내부 URL이어야 함!
      const siteItemLink = escapeXml(`${baseUrl}/?post=${encodeURIComponent(post.id || idx)}`);
      const originalUrl = escapeXml(post.original_url || baseUrl);

      return `    <item>
      <title>${escapedTitle}</title>
      <link>${siteItemLink}</link>
      <description><![CDATA[${post.summary || ''}<br/><br/>* 출처: ${post.blog_name} (<a href="${post.original_url}">원문 보기</a>)]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${siteItemLink}</guid>
      <author>${escapeXml(post.blog_name)}</author>
      <category>${escapeXml(post.category || 'Curation')}</category>
    </item>`;
    })
    .join('\n');

  const nowRfc822 = new Date().toUTCString();
  const escapedBaseUrl = escapeXml(baseUrl);

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>모아 퀘스트 (MOA.QUEST)</title>
    <link>${escapedBaseUrl}</link>
    <description>생산성 도구, 자동차 라이프, 마음 치유 에세이 등 유익한 최신 블로그 아티클 큐레이션</description>
    <language>ko</language>
    <pubDate>${nowRfc822}</pubDate>
    <lastBuildDate>${nowRfc822}</lastBuildDate>
    <atom:link href="${escapedBaseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
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
