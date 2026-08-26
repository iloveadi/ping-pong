import { getPosts } from '@/lib/db';

export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ping-pong.vercel.app';
  const posts = await getPosts(50); // 최신 50개 포스트를 RSS 피드로 발행

  const rssItemsXml = posts
    .map((post) => {
      const pubDate = post.published_at ? new Date(post.published_at).toUTCString() : new Date().toUTCString();
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${post.original_url}</link>
      <guid isPermaLink="true">${post.original_url}</guid>
      <description><![CDATA[${post.summary}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author><![CDATA[${post.blog_name}]]></author>
      <category><![CDATA[${post.category || 'Curation'}]]></category>
    </item>`;
    })
    .join('');

  const rssFeedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>핑퐁허브 (PingPong Hub)</title>
    <link>${baseUrl}</link>
    <description>생산성 도구, 자동차 라이프, 마음 치유 에세이까지 유익한 최신 블로그 아티클을 전해드리는 큐레이션 허브입니다.</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItemsXml}
  </channel>
</rss>`;

  return new Response(rssFeedXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
