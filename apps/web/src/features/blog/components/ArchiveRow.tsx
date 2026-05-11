import type { PostSummary } from "@/features/blog/blogTypes";

type Props = {
  post: PostSummary;
};

export function ArchiveRow({ post }: Props) {
  const formattedDate =
    post.published_at != null
      ? new Date(post.published_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "";

  const tags = post.tags ?? [];

  return (
    <article className="arc-item">
      <span className="arc-date">{formattedDate}</span>

      <div className="arc-title">
        <a href={`/blog/${post.slug}`}>{post.title}</a>
        {tags.length > 0 && (
          <div className="tags-inline">
            {tags.map((tag, index) => (
              <a
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className={`tag t-${(index % 5) + 1}`}
              >
                {tag.name}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="arc-meta">
        {post.reading_time != null && <span>{post.reading_time} min</span>}
        {post.comments_count !== undefined && post.comments_count > 0 && (
          <span className="comment-count">💬 {post.comments_count}</span>
        )}
      </div>
    </article>
  );
}
