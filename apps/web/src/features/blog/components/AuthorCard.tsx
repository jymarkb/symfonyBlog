import { useRef, useState } from 'react';

import { ApiError } from '@/lib/api/apiClient';
import { getAccessToken } from '@/lib/auth/getAccessToken';
import { useCurrentSession } from '@/features/auth/session/useCurrentSession';
import { AuthGateModal } from '@/features/auth/components/AuthGateModal';
import { followAuthor, unfollowAuthor } from '../api/blogApi';
import { getInitials } from '../lib/getInitials';
import type { PostDetail } from '../blogTypes';

type AuthorCardProps = {
  post: PostDetail;
  variant: 'rail' | 'footer';
  onOpenAuthGate?: (callback: () => void) => void;
};

export function AuthorCard({ post, variant, onOpenAuthGate }: AuthorCardProps) {
  const { author } = post;
  const displayName = author.display_name ?? author.handle;
  const initials = getInitials(author.display_name, author.handle);
  const followers = author.followers_count ?? 0;

  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const pendingFollowRef = useRef<(() => void) | null>(null);
  const { isAuthenticated } = useCurrentSession();

  async function handleFollow() {
    if (busy) return;
    if (!isAuthenticated) {
      if (onOpenAuthGate) {
        onOpenAuthGate(() => void handleFollow());
      } else {
        pendingFollowRef.current = () => void handleFollow();
        setAuthGateOpen(true);
      }
      return;
    }
    setBusy(true);
    const next = !following;
    setFollowing(next);
    try {
      const accessToken = await getAccessToken();
      if (next) {
        await followAuthor(author.id, accessToken);
      } else {
        await unfollowAuthor(author.id, accessToken);
      }
    } catch (err) {
      setFollowing(!next);
      if (err instanceof ApiError && err.status === 401) {
        if (onOpenAuthGate) {
          onOpenAuthGate(() => void handleFollow());
        } else {
          pendingFollowRef.current = () => void handleFollow();
          setAuthGateOpen(true);
        }
      }
    } finally {
      setBusy(false);
    }
  }

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
          <span className="rail-followers">{followers.toLocaleString()} followers</span>
          <button
            className="btn btn-sm rail-follow"
            onClick={() => void handleFollow()}
            disabled={busy}
          >
            {following ? 'Following' : 'Follow'}
          </button>
        </div>

        {!onOpenAuthGate && (
          <AuthGateModal
            isOpen={authGateOpen}
            onClose={() => setAuthGateOpen(false)}
            onSuccess={() => {
              setAuthGateOpen(false);
              pendingFollowRef.current?.();
              pendingFollowRef.current = null;
            }}
          />
        )}
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
            <span className="pac-followers">{followers.toLocaleString()} followers</span>
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

      {!onOpenAuthGate && (
        <AuthGateModal
          isOpen={authGateOpen}
          onClose={() => setAuthGateOpen(false)}
          onSuccess={() => {
            setAuthGateOpen(false);
            pendingFollowRef.current?.();
            pendingFollowRef.current = null;
          }}
        />
      )}
    </div>
  );
}
