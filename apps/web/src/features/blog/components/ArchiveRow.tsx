import type { PostSummary } from "@/features/blog/blogTypes";

type Props = {
  post: PostSummary;
  onTagChange?: (slug: string) => void;
};

export function ArchiveRow({ post, onTagChange }: Props) {
  const formattedDate =
    post.published_at != null
      ? new Date(post.published_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "";

  const formattedYear =
    post.published_at != null
      ? new Date(post.published_at).getFullYear()
      : null;

  const tags = post.tags ?? [];

  return (
    <article className="arc-item">
      <span className="arc-date">
        {formattedDate}
        {formattedYear != null && <span className="arc-date-year">{formattedYear}</span>}
      </span>

      <div className="arc-title">
        <a href={`/blog/${post.slug}`}>{post.title}</a>
        {post.excerpt != null && (
          <p className="arc-dek">{post.excerpt}</p>
        )}
        {tags.length > 0 && (
          <div className="tags-inline">
            {tags.map((tag, index) =>
              onTagChange != null ? (
                <button
                  key={tag.id}
                  className={`tag t-${(index % 5) + 1}`}
                  onClick={() => onTagChange(tag.slug)}
                >
                  {tag.name}
                </button>
              ) : (
                <a
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className={`tag t-${(index % 5) + 1}`}
                >
                  {tag.name}
                </a>
              )
            )}
          </div>
        )}
      </div>

      <div className="arc-meta">
        {post.reading_time != null && <span>{post.reading_time} min</span>}
        {post.comments_count != null && post.comments_count > 0 && (
          <span className="comment-count" aria-label={`${post.comments_count} comments`}>
            <span aria-hidden="true">💬</span> {post.comments_count}
          </span>
        )}
      </div>
    </article>
  );
}
