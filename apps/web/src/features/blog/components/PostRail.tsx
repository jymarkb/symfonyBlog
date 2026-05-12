import type { PostDetail } from '../blogTypes';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getInitials(displayName: string | null, handle: string): string {
  if (displayName && displayName.trim().length > 0) {
    return displayName.trim()[0].toUpperCase();
  }
  return handle[0].toUpperCase();
}

export function PostRail({ post }: { post: PostDetail }) {
  const { author } = post;
  const displayName = author.display_name ?? author.handle;
  const initials = getInitials(author.display_name, author.handle);

  return (
    <aside className="post-rail">

      {/* Author card */}
      <div className="rail-author">
        <div className="rail-author-top">
          {author.avatar_url ? (
            <img className="avatar" src={author.avatar_url} alt={displayName} />
          ) : (
            <div className="avatar">{initials}</div>
          )}
          <div>
            <div className="rail-author-name">{displayName}</div>
            <div className="rail-author-handle">@{author.handle}</div>
          </div>
        </div>
        <p className="rail-author-bio">
          {/* bio is not present in PostDetail — stub text */}
          Engineer and writer.
        </p>
        <button className="btn btn-sm rail-follow" disabled>Follow</button>
      </div>

      {/* Post stats */}
      <div className="rail-stats">
        <div className="stat-pill">
          <span className="stat-val">★ {post.stars_count ?? 0}</span>
          <span className="stat-lbl">Stars</span>
        </div>
        <div className="stat-pill">
          <span className="stat-val">
            <a href="#comments" style={{ color: 'inherit' }}>
              {post.comments_count ?? 0}
            </a>
          </span>
          <span className="stat-lbl">Comments</span>
        </div>
        <div className="stat-pill full">
          <span className="stat-val">{formatDate(post.published_at)}</span>
          {post.reading_time != null && (
            <span className="stat-lbl">· {post.reading_time} min read</span>
          )}
        </div>
      </div>

      {/* Sticky wrapper: TOC + progress + actions */}
      <div className="rail-sticky">
        <nav className="rail-toc">
          <p className="rail-toc-label">On this page</p>
          {/* TOC items deferred — no items, no scroll tracking */}
        </nav>

        <div className="rail-progress">
          <div className="progress-bar"><i></i></div>
        </div>

        <div className="rail-actions">
          <button disabled><span>Copy link</span><kbd>⌘L</kbd></button>
          <button disabled><span>Print</span><kbd>⌘P</kbd></button>
          <a href="#comments"><span>Comments</span><kbd>C</kbd></a>
        </div>
      </div>

    </aside>
  );
}
