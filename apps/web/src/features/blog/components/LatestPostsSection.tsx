import type { PostSummary } from '@/features/blog/blogTypes';
import { PostRow } from '@/components/common/PostCard';

type Props = {
  initialPosts?: PostSummary[];
};

export function LatestPostsSection({ initialPosts }: Props) {
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
            <div style={{ height: 11, width: 80, background: 'var(--paper-3)', borderRadius: 3, marginTop: 4 }} />
            <div>
              <div style={{ height: 17, width: '78%', background: 'var(--paper-3)', borderRadius: 3, marginBottom: 8 }} />
              <div style={{ height: 13, width: '92%', background: 'var(--paper-3)', borderRadius: 3, marginBottom: 5 }} />
              <div style={{ height: 13, width: '68%', background: 'var(--paper-3)', borderRadius: 3, marginBottom: 10 }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ height: 20, width: 60, background: 'var(--paper-3)', borderRadius: 999 }} />
                <div style={{ height: 20, width: 74, background: 'var(--paper-3)', borderRadius: 999 }} />
              </div>
            </div>
            <div style={{ height: 11, width: 64, background: 'var(--paper-3)', borderRadius: 3, marginTop: 4 }} />
          </article>
        ))}
        {!isLoading && posts.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </div>
      {!isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <a href="/archive" className="btn">Browse all essays →</a>
        </div>
      )}
    </section>
  );
}
