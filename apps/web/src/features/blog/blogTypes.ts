// apps/web/src/features/blog/blogTypes.ts

import type { BlockElement } from '@jymarkb/block-editor/render';

// ── Primitive sub-shapes ──────────────────────────────────────────────────────

export type PostAuthor = {
  id: number;
  display_name: string | null;
  handle: string;
  avatar_url: string | null;
  bio: string | null;
  followers_count: number;
};

export type PostTag = {
  id: number;
  name: string;
  slug: string;
  posts_count: number | null;
};

export type PostYear = {
  year: number;
  count: number;
};

// ── Primary resource shapes ───────────────────────────────────────────────────

// Mirrors PostSummaryResource — returned by GET /api/v1/posts
export type PostSummary = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  reading_time: number | null;
  is_featured: boolean;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  author: PostAuthor;
  tags: PostTag[] | null;
  comments_count: number | null;
  stars_count: number | null;
};

// Mirrors PostDetailResource — returned by GET /api/v1/posts/:slug
export type PostDetail = PostSummary & {
  body: BlockElement[];
};

// ── API response wrappers ─────────────────────────────────────────────────────

// GET /api/v1/posts → paginated collection
export type PostsResponse = {
  data: PostSummary[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
};

// GET /api/v1/tags → simple collection, no pagination
export type TagsResponse = {
  data: PostTag[];
};

// ── Page-level aggregate ──────────────────────────────────────────────────────

// Returned by pages/index/+data.ts, consumed via useData() in +Page.tsx
export type HomePageData = {
  featuredPosts: PostSummary[];
  latestPosts: PostSummary[];
  totalPosts: number;
  tags: PostTag[];
};

export type PostDetailPageData = {
  post: PostDetail;
};

export interface FollowResponse {
  follower_id: number;
  author_id: number;
  created_at: string;
}

export type ArchivePageData = {
  posts: PostSummary[];
  total: number;
  lastPage: number;
  currentPage: number;
  tags: PostTag[];
  years: PostYear[];
};
