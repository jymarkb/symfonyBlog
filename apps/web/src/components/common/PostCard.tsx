import type { PostSummary } from "@/features/blog/blogTypes";

type Props = {
  post: PostSummary;
};

export function PostRow({ post }: Props) {
  const dateDisplay =
    post.published_at != null
      ? new Date(post.published_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "";

  const readingTimeDisplay =
    post.reading_time != null ? `${post.reading_time} min read` : null;

  return (
    <article className="post-row">
      <div className="post-row-body">
        <h3 className="post-row-title">
          <a href={`/blog/${post.slug}`}>{post.title}</a>
        </h3>
        {post.excerpt != null && (
          <p className="post-row-dek">{post.excerpt}</p>
        )}
        {(post.tags ?? []).length > 0 && (
          <div className="post-row-tags">
            {(post.tags ?? []).map((tag, index) => (
              <span key={tag.id} className={`tag t-${(index % 5) + 1}`}>{tag.name}</span>
            ))}
          </div>
        )}
      </div>
      <div className="post-row-aside">
        <span className="post-row-date">{dateDisplay}</span>
        {readingTimeDisplay != null && (
          <span className="post-row-time">{readingTimeDisplay}</span>
        )}
      </div>
    </article>
  );
}
