import type { PostSummary } from "@/features/blog/blogTypes";

type Props = {
  post: PostSummary;
};

export function PostCard({ post }: Props) {
  const firstTag = post.tags?.[0];

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const avatarInitial = post.author.display_name
    ? post.author.display_name.charAt(0).toUpperCase()
    : post.author.handle.charAt(1).toUpperCase();

  return (
    <article className="card flex flex-col gap-0 overflow-hidden p-0">
      {/* Cover image */}
      <div className="relative h-44">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="img-placeholder absolute inset-0 h-full w-full"
            data-label="Cover image"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {firstTag && (
          <div>
            <span className="tag t-1">{firstTag.name}</span>
          </div>
        )}

        <h3 className="text-base font-semibold leading-snug text-ink">
          <a
            href={`/blog/@${post.slug}`}
            className="transition-colors duration-150 hover:text-accent-ink"
          >
            {post.title}
          </a>
        </h3>

        {post.excerpt && (
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-3">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <div className="flex items-center gap-2">
            <div className="avatar avatar-sm" aria-hidden="true">
              {post.author.avatar_url ? (
                <img
                  src={post.author.avatar_url}
                  alt={post.author.display_name ?? post.author.handle}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                avatarInitial
              )}
            </div>
            <span className="text-xs font-medium text-ink-2">
              {post.author.display_name ?? post.author.handle}
            </span>
          </div>

          <div className="meta">
            {formattedDate && <span>{formattedDate}</span>}
            {post.reading_time != null && (
              <span className="meta-dot">{post.reading_time} min read</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
