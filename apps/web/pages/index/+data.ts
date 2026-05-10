import type { HomePageData, PostSummary, PostTag } from '@/features/blog/blogTypes';

const PLACEHOLDER_AUTHOR = { id: 1, display_name: 'Jymb', handle: '@jymb', avatar_url: null };

const PLACEHOLDER_FEATURED: PostSummary[] = [
  {
    id: 1, user_id: 1,
    title: "The cost of context: what it actually takes to build agents that don't lie.",
    slug: 'the-cost-of-context',
    excerpt: "Six months running an agent in production taught me that hallucinations are a downstream symptom, not the bug. The real problem lives in the prompt assembly layer — and almost nobody is logging it correctly.",
    cover_image: null, reading_time: 18, is_featured: true, status: 'published',
    published_at: '2026-04-30T00:00:00Z', created_at: '2026-04-30T00:00:00Z', updated_at: '2026-04-30T00:00:00Z',
    author: PLACEHOLDER_AUTHOR,
    tags: [
      { id: 1, name: 'ai-agents', slug: 'ai-agents' },
      { id: 2, name: 'infrastructure', slug: 'infrastructure' },
      { id: 3, name: 'postmortem', slug: 'postmortem' },
    ],
    comments_count: 142, stars_count: undefined,
  },
];

const PLACEHOLDER_LATEST: PostSummary[] = [
  {
    id: 2, user_id: 1,
    title: 'A field guide to flaky tests, and why your CI is lying to you.',
    slug: 'flaky-tests-guide',
    excerpt: "Most \"flaky\" tests aren't flaky — they're racing on shared global state nobody documented. Here's the taxonomy I use to triage them in 30 seconds.",
    cover_image: null, reading_time: 11, is_featured: false, status: 'published',
    published_at: '2026-04-22T00:00:00Z', created_at: '2026-04-22T00:00:00Z', updated_at: '2026-04-22T00:00:00Z',
    author: PLACEHOLDER_AUTHOR,
    tags: [{ id: 4, name: 'testing', slug: 'testing' }, { id: 5, name: 'engineering', slug: 'engineering' }],
    comments_count: undefined, stars_count: undefined,
  },
  {
    id: 3, user_id: 1,
    title: "I rewrote my note-taking system for the fifth time. Here's what stuck.",
    slug: 'note-taking-system',
    excerpt: 'After Notion, Obsidian, Roam, plain text, and a brief flirtation with Tana — I landed somewhere unexpected. A short essay on the friction that actually matters.',
    cover_image: null, reading_time: 7, is_featured: false, status: 'published',
    published_at: '2026-04-14T00:00:00Z', created_at: '2026-04-14T00:00:00Z', updated_at: '2026-04-14T00:00:00Z',
    author: PLACEHOLDER_AUTHOR,
    tags: [{ id: 6, name: 'tools', slug: 'tools' }, { id: 7, name: 'workflow', slug: 'workflow' }, { id: 8, name: 'essay', slug: 'essay' }],
    comments_count: undefined, stars_count: undefined,
  },
  {
    id: 4, user_id: 1,
    title: 'On reading source code as literature.',
    slug: 'source-code-as-literature',
    excerpt: 'SQLite, Redis, and the Linux scheduler taught me more about taste than any blog post ever has. A reading list and a method.',
    cover_image: null, reading_time: 9, is_featured: false, status: 'published',
    published_at: '2026-04-03T00:00:00Z', created_at: '2026-04-03T00:00:00Z', updated_at: '2026-04-03T00:00:00Z',
    author: PLACEHOLDER_AUTHOR,
    tags: [{ id: 8, name: 'essay', slug: 'essay' }, { id: 9, name: 'reading', slug: 'reading' }],
    comments_count: undefined, stars_count: undefined,
  },
  {
    id: 5, user_id: 1,
    title: 'Vector databases are a deployment problem, not a math problem.',
    slug: 'vector-databases-deployment',
    excerpt: 'Everyone benchmarks recall@10. Almost nobody benchmarks "what does my on-call rotation look like at 50M vectors." Notes from a year of running pgvector in anger.',
    cover_image: null, reading_time: 14, is_featured: false, status: 'published',
    published_at: '2026-03-19T00:00:00Z', created_at: '2026-03-19T00:00:00Z', updated_at: '2026-03-19T00:00:00Z',
    author: PLACEHOLDER_AUTHOR,
    tags: [{ id: 1, name: 'ai-agents', slug: 'ai-agents' }, { id: 2, name: 'infrastructure', slug: 'infrastructure' }],
    comments_count: undefined, stars_count: undefined,
  },
  {
    id: 6, user_id: 1,
    title: 'A short defense of boring stacks.',
    slug: 'boring-stacks',
    excerpt: "Postgres, Django, a single Linux box, and a cron job will outrun your fancy event-driven microservice mesh for the first three years of any company's life. Probably longer.",
    cover_image: null, reading_time: 5, is_featured: false, status: 'published',
    published_at: '2026-03-08T00:00:00Z', created_at: '2026-03-08T00:00:00Z', updated_at: '2026-03-08T00:00:00Z',
    author: PLACEHOLDER_AUTHOR,
    tags: [{ id: 8, name: 'essay', slug: 'essay' }, { id: 2, name: 'infrastructure', slug: 'infrastructure' }],
    comments_count: undefined, stars_count: undefined,
  },
  {
    id: 7, user_id: 1,
    title: 'The only diagram I ever draw before writing code.',
    slug: 'diagram-before-code',
    excerpt: "It's not a sequence diagram. It's not a state machine. It's three boxes and a question. I'll show you the question.",
    cover_image: null, reading_time: 4, is_featured: false, status: 'published',
    published_at: '2026-02-24T00:00:00Z', created_at: '2026-02-24T00:00:00Z', updated_at: '2026-02-24T00:00:00Z',
    author: PLACEHOLDER_AUTHOR,
    tags: [{ id: 7, name: 'workflow', slug: 'workflow' }, { id: 5, name: 'engineering', slug: 'engineering' }],
    comments_count: undefined, stars_count: undefined,
  },
];

const PLACEHOLDER_TAGS: PostTag[] = [
  { id: 1, name: 'ai-agents', slug: 'ai-agents' },
  { id: 2, name: 'infrastructure', slug: 'infrastructure' },
  { id: 8, name: 'essay', slug: 'essay' },
  { id: 7, name: 'workflow', slug: 'workflow' },
  { id: 6, name: 'tools', slug: 'tools' },
  { id: 5, name: 'engineering', slug: 'engineering' },
  { id: 4, name: 'testing', slug: 'testing' },
];

export function data(): HomePageData {
  return {
    featuredPosts: PLACEHOLDER_FEATURED,
    latestPosts: PLACEHOLDER_LATEST,
    tags: PLACEHOLDER_TAGS,
  };
}
