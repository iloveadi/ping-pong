import { MetadataRoute } from 'next';
import { getPosts } from '@/lib/db';
import { BlogPost } from '@/lib/types';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.moa.quest';

  let posts: BlogPost[] = [];
  try {
    posts = await getPosts(3000);
  } catch (err) {
    console.error('[Sitemap] 포스트 목록 조회 실패:', err);
  }

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => {
    let lastMod = new Date();
    if (post.published_at) {
      const parsed = new Date(post.published_at);
      if (!isNaN(parsed.getTime())) {
        lastMod = parsed;
      }
    }

    return {
      url: `${baseUrl}/post/${encodeURIComponent(post.id)}`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    };
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    ...postEntries,
  ];
}
