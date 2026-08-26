export interface BlogPost {
  id: string;
  title: string;
  thumbnail_url: string;
  summary: string; // HTML 태그 제거 후 최대 150자 요약
  original_url: string; // 원본 포스트 URL (고유 키, 중복 방지용)
  published_at: string; // ISO 8601 문자열
  blog_name: string;
  category?: string;
  created_at?: string;
}

export type ParsedPost = Omit<BlogPost, 'id' | 'created_at'>;

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: string;
  isActive: boolean;
}

export interface SyncStats {
  totalFeeds: number;
  fetchedItems: number;
  savedCount: number;
  skippedCount: number;
}

export interface CronSyncResponse {
  success: boolean;
  message: string;
  timestamp: string;
  stats: SyncStats;
  errors?: string[];
}
