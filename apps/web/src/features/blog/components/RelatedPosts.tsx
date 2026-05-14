import type { PostSummary } from '../blogTypes';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

type Props = {
  posts: PostSummary[];
};

export function RelatedPosts({ posts }: Props) {
  return (
    <div className="related">
      <h4 className="related-label">Related essays</h4>
      {posts.length === 0 ? (
        <p className="related-empty">Similar posts will appear here once more content is published.</p>
      ) : (
        <div className="related-grid">
          {posts.map((post) => (
            <a key={post.id} className="related-card" href={`/${post.slug}`}>
              <div className="date">{formatDate(post.published_at)}</div>
              <h5>{post.title}</h5>
              {post.excerpt != null && (
                <p>
                  {post.excerpt.length > 120 ? post.excerpt.slice(0, 120) + '…' : post.excerpt}
                </p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
