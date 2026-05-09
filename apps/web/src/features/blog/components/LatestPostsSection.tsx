import type { PostSummary } from '@/features/blog/blogTypes';
import { PostRow } from '@/components/common/PostCard';

type Props = {
  initialPosts?: PostSummary[];
};

export function LatestPostsSection({ initialPosts }: Props) {
  if (initialPosts !== undefined && initialPosts.length === 0) {
    return null;
  }

  const isLoading = initialPosts === undefined;
  const posts = initialPosts ?? [];

  return (
    <section>
      <div className="section-head">
        <h2>Recent</h2>
        <a href="/archive" className="count">View archive →</a>
      </div>
      <div className="post-list">
        {isLoading && (
          <>
            <div className="post-row" style={{ height: 80 }} />
            <div className="post-row" style={{ height: 80 }} />
            <div className="post-row" style={{ height: 80 }} />
          </>
        )}
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
