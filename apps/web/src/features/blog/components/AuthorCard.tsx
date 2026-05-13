import { usePendingFollow } from '../hooks/usePendingFollow';
import { getInitials } from '../lib/getInitials';
import type { PostDetail } from '../blogTypes';

type AuthorCardProps = {
  post: PostDetail;
  variant: 'rail' | 'footer';
  onOpenAuthGate?: (callback: () => void) => void;
  initialFollowing?: boolean;
  initialFollowersCount?: number;
  onFollowChange?: (following: boolean, count: number) => void;
};

export function AuthorCard({ post, variant, onOpenAuthGate, initialFollowing, initialFollowersCount, onFollowChange }: AuthorCardProps) {
  const { author } = post;
  const displayName = author.display_name ?? author.handle;
  const initials = getInitials(author.display_name, author.handle);

  const { following, followerCount, busy, handleFollow } = usePendingFollow({
    authorId: author.id,
    initialFollowing: initialFollowing ?? false,
    initialFollowersCount: initialFollowersCount ?? author.followers_count ?? 0,
    onFollowChange,
    onOpenAuthGate,
  });

  if (variant === 'rail') {
    return (
      <div className="rail-author">
        <div className="rail-author-id">
          {author.avatar_url ? (
            <img className="rail-avatar" src={author.avatar_url} alt={displayName} />
          ) : (
            <div className="rail-avatar rail-avatar--initials">{initials}</div>
          )}
          <div className="rail-author-id-text">
            <div className="rail-author-name">{displayName}</div>
            <div className="rail-author-handle">{author.handle}</div>
          </div>
        </div>
        {author.bio && <p className="rail-author-bio">{author.bio}</p>}
        <div className="rail-follow-group">
          <span className="rail-followers">{followerCount.toLocaleString()} followers</span>
          <button
            className="btn btn-sm rail-follow"
            onClick={() => void handleFollow()}
            disabled={busy}
          >
            {following ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pac">
      <div className="pac-row">
        {author.avatar_url ? (
          <img className="pac-avatar" src={author.avatar_url} alt={displayName} />
        ) : (
          <div className="pac-avatar pac-avatar--initials" aria-hidden="true">{initials}</div>
        )}
        <div className="pac-info">
          <span className="pac-name">{displayName}</span>
          <div className="pac-sub">
            <span className="pac-handle">{author.handle}</span>
            <span className="pac-dot" aria-hidden="true">·</span>
            <span className="pac-followers">{followerCount.toLocaleString()} followers</span>
          </div>
        </div>
        <button
          className="pac-follow"
          onClick={() => void handleFollow()}
          disabled={busy}
        >
          {following ? 'Following' : 'Follow'}
        </button>
      </div>
      {author.bio && <p className="pac-bio">{author.bio}</p>}
    </div>
  );
}
