import type { PostSummary } from '@/features/blog/blogTypes';
import { PostRow } from '@/components/common/PostCard';

type Props = {
  initialPosts?: PostSummary[];
  total?: number;
};

export function LatestPostsSection({ initialPosts, total }: Props) {
  const isLoading = initialPosts === undefined;
  const posts = initialPosts ?? [];

  return (
    <section>
      <div className="section-head">
        <h2>Recent</h2>
        <a href="/archive" className="count">View archive →</a>
      </div>
      <div className="post-list">
        {isLoading && Array.from({ length: 5 }).map((_, i) => (
          <article key={i} className="post-row">
            <div className="post-row-body">
              <div style={{ height: 18, width: '75%', background: 'var(--paper-3)', borderRadius: 3, marginBottom: 10 }} />
              <div style={{ height: 13, width: '95%', background: 'var(--paper-3)', borderRadius: 3, marginBottom: 5 }} />
              <div style={{ height: 13, width: '70%', background: 'var(--paper-3)', borderRadius: 3, marginBottom: 12 }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ height: 20, width: 60, background: 'var(--paper-3)', borderRadius: 999 }} />
                <div style={{ height: 20, width: 74, background: 'var(--paper-3)', borderRadius: 999 }} />
              </div>
            </div>
            <div className="post-row-aside">
              <div style={{ height: 11, width: 72, background: 'var(--paper-3)', borderRadius: 3 }} />
              <div style={{ height: 11, width: 52, background: 'var(--paper-3)', borderRadius: 3 }} />
            </div>
          </article>
        ))}
        {!isLoading && posts.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </div>
      {!isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <a href="/archive" className="btn">Browse all {total !== undefined ? `${total} ` : ''}essays →</a>
        </div>
      )}
    </section>
  );
}
