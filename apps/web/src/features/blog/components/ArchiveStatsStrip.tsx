// apps/web/src/features/blog/components/ArchiveStatsStrip.tsx

import type { PostSummary } from '../blogTypes';

type Props = {
  posts: PostSummary[];
  total: number;
  isLoading: boolean;
};

export default function ArchiveStatsStrip({ posts, total, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="stats">
        <div className="stat"><span className="num">…</span><span>essays</span></div>
        <div className="stat"><span className="num">…</span><span>avg read</span></div>
        <div className="stat"><span className="num">…</span><span>comments</span></div>
        <div className="stat"><span className="num">…</span><span>since</span></div>
      </div>
    );
  }

  // Essays — use total from API meta
  const essays = total;

  // Avg read — average reading_time across posts that have it
  const postsWithReadingTime = posts.filter((p) => p.reading_time != null);
  const avgReadMin =
    postsWithReadingTime.length > 0
      ? Math.round(
          postsWithReadingTime.reduce((s, p) => s + (p.reading_time ?? 0), 0) /
            postsWithReadingTime.length
        )
      : null;
  const avgRead = avgReadMin != null ? `${avgReadMin} min` : '—';

  // Comments — sum across all loaded posts
  const comments = posts.reduce((s, p) => s + (p.comments_count ?? 0), 0);
  const commentsFormatted = comments.toLocaleString();

  // Since — earliest publication year
  const publishedPosts = posts.filter((p): p is PostSummary & { published_at: string } => p.published_at != null);
  const since =
    publishedPosts.length > 0
      ? Math.min(
          ...publishedPosts.map((p) => new Date(p.published_at).getFullYear())
        )
      : null;
  const sinceValue = since != null ? String(since) : '—';

  return (
    <div className="stats">
      <div className="stat"><span className="num">{essays}</span><span>essays</span></div>
      <div className="stat"><span className="num">{avgRead}</span><span>avg read</span></div>
      <div className="stat"><span className="num">{commentsFormatted}</span><span>comments</span></div>
      <div className="stat"><span className="num">{sinceValue}</span><span>since</span></div>
    </div>
  );
}
