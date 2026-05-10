import type { PostSummary } from "@/features/blog/blogTypes";

type Props = {
  post: PostSummary;
};

export function PostRow({ post }: Props) {
  const dateDisplay =
    post.published_at != null
      ? post.published_at.slice(0, 10).replace(/-/g, "·")
      : "";

  const readingTimeDisplay =
    post.reading_time != null ? `${post.reading_time} min read` : null;

  return (
    <article className="post-row">
      <div className="post-date">{dateDisplay}</div>

      <div className="post-body">
        <h3>
          <a href={`/blog/@${post.slug}`}>{post.title}</a>
        </h3>

        {post.excerpt != null && <p className="dek">{post.excerpt}</p>}

        {(post.tags ?? []).length > 0 && (
          <div className="row-meta">
            {(post.tags ?? []).map((tag, index) => (
              <span key={tag.id} className={`tag t-${(index % 5) + 1}`}>
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {readingTimeDisplay != null ? (
        <div className="post-time">{readingTimeDisplay}</div>
      ) : (
        <div className="post-time" />
      )}
    </article>
  );
}
