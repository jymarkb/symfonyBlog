import type { PostSummary } from '../blogTypes';
import { formatDate } from '../utils/formatDate';

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
          {posts.map((post) => {
            const date = formatDate(post.published_at);
            return (
            <a key={post.id} className="related-card" href={`/${post.slug}`}>
              {date && <div className="date">{date}</div>}
              <h5>{post.title}</h5>
              {post.excerpt != null && (
                <p>
                  {post.excerpt.length > 120 ? post.excerpt.slice(0, 120) + '…' : post.excerpt}
                </p>
              )}
            </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
