import type { PostSummary } from "@/features/blog/blogTypes";

type Props = {
  post: PostSummary;
};

export function FeaturedPostCard({ post }: Props) {
  const eyebrow =
    post.reading_time != null
      ? `Long read · ${post.reading_time} min`
      : "Feature";

  const formattedDate =
    post.published_at != null
      ? new Date(post.published_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  const authorInitial =
    (post.author.display_name ?? post.author.handle).charAt(0).toUpperCase();

  return (
    <article className="featured">
      {post.cover_image != null ? (
        <img
          className="featured-img"
          src={post.cover_image}
          alt={post.title}
        />
      ) : (
        <div
          className="featured-img img-placeholder"
          data-label="Cover image"
        />
      )}

      <div className="featured-body">
        <span className="eyebrow">{eyebrow}</span>

        <h3>
          <a href={`/blog/@${post.slug}`}>{post.title}</a>
        </h3>

        {post.excerpt != null && <p className="dek">{post.excerpt}</p>}

        {(post.tags ?? []).length > 0 && (
          <div className="featured-tags">
            {(post.tags ?? []).map((tag, index) => (
              <span key={tag.id} className={`tag t-${(index % 5) + 1}`}>
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="featured-byline">
          {post.author.avatar_url != null ? (
            <img
              className="avatar avatar-sm"
              src={post.author.avatar_url}
              alt={post.author.display_name ?? post.author.handle}
            />
          ) : (
            <div className="avatar avatar-sm">{authorInitial}</div>
          )}

          <span>{post.author.display_name ?? post.author.handle}</span>

          {formattedDate != null && (
            <>
              <span>·</span>
              <span>{formattedDate}</span>
            </>
          )}

          {post.comments_count !== undefined && (
            <>
              <span>·</span>
              <span>{post.comments_count} comments</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
