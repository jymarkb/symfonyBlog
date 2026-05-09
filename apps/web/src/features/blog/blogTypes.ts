// apps/web/src/features/blog/blogTypes.ts

// ── Primitive sub-shapes ──────────────────────────────────────────────────────

export type PostAuthor = {
  id: number;
  display_name: string | null;
  handle: string;
  avatar_url: string | null;
};

export type PostTag = {
  id: number;
  name: string;
  slug: string;
};

// ── Primary resource shapes ───────────────────────────────────────────────────

// Mirrors PostSummaryResource — returned by GET /api/v1/posts
export type PostSummary = {
  id: number;
  user_id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  reading_time: number | null;
  is_featured: boolean;
  status: string;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  author: PostAuthor;
  tags: PostTag[] | undefined;
  comments_count: number | undefined;
  stars_count: number | undefined;
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
  tags: PostTag[];
};
