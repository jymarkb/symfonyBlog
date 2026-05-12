// apps/web/src/features/blog/components/ArchiveSection.tsx

import { PostSummary } from '../blogTypes';
import { ArchiveRow } from './ArchiveRow';

type Props = {
  posts: PostSummary[];
  isLoading: boolean;
  onTagChange?: (slug: string) => void;
};

function groupByYear(posts: PostSummary[]): Map<number, PostSummary[]> {
  const map = new Map<number, PostSummary[]>();
  for (const post of posts) {
    if (!post.published_at) continue;
    const year = new Date(post.published_at).getFullYear();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(post);
  }
  return map;
}

export default function ArchiveSection({ posts, isLoading, onTagChange }: Props) {
  if (isLoading) {
    return (
      <section className="archive">
        <div className="year-block">
          <div className="year-label">
            <span style={{ opacity: 0.2 }}>—</span>
          </div>
          <div className="arc-list">
            <div className="arc-item" style={{ opacity: 0.4 }} aria-hidden="true" />
            <div className="arc-item" style={{ opacity: 0.4 }} aria-hidden="true" />
            <div className="arc-item" style={{ opacity: 0.4 }} aria-hidden="true" />
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="archive">
        <p className="empty-state">No posts match your search.</p>
      </section>
    );
  }

  const grouped = groupByYear(posts);
  const years = Array.from(grouped.keys()).sort((a, b) => b - a);

  return (
    <section className="archive">
      {years.map((year) => {
        const yearPosts = grouped.get(year)!;
        return (
          <div key={year} className="year-block">
            <div className="year-label">
              <span>{year}</span>
              <span className="count">{yearPosts.length} posts</span>
            </div>
            <div className="arc-list">
              {yearPosts.map((post) => (
                <ArchiveRow key={post.slug} post={post} onTagChange={onTagChange} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
