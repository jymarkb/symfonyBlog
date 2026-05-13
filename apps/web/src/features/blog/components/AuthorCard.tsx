import { useEffect, useRef, useState } from 'react';

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
  initialFollowing?: boolean;
};

const PENDING_FOLLOW_KEY = 'pending_follow_author_id';

export function AuthorCard({ post, variant, onOpenAuthGate, initialFollowing }: AuthorCardProps) {
  const { author } = post;
  const displayName = author.display_name ?? author.handle;
  const initials = getInitials(author.display_name, author.handle);

  const [following, setFollowing] = useState(initialFollowing ?? false);
  const [followerCount, setFollowerCount] = useState(author.followers_count ?? 0);
  const [busy, setBusy] = useState(false);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const pendingFollowRef = useRef<(() => void) | null>(null);
  const { isAuthenticated } = useCurrentSession();

  // OAuth path: after redirect back, apply the pending follow stored before OAuth started
  useEffect(() => {
    if (!isAuthenticated) return;
    const pending = sessionStorage.getItem(PENDING_FOLLOW_KEY);
    if (pending && parseInt(pending) === author.id) {
      sessionStorage.removeItem(PENDING_FOLLOW_KEY);
      pendingFollowRef.current = null; // prevent onSuccess from firing a second applyFollow
      void applyFollow();
    }
  }, [isAuthenticated]);

  async function applyFollow() {
    setBusy(true);
    try {
      const accessToken = await getAccessToken();
      await followAuthor(author.id, accessToken);
      setFollowing(true);
      setFollowerCount(c => c + 1);
    } catch {
      // silent — user can click Follow again
    } finally {
      setBusy(false);
    }
  }

  async function handleFollow() {
    if (busy) return;
    if (!isAuthenticated) {
      // Store intent for OAuth path (page will navigate away)
      sessionStorage.setItem(PENDING_FOLLOW_KEY, String(author.id));
      // Callback for email sign-in path (page stays, apply directly)
      const callback = () => void applyFollow();
      if (onOpenAuthGate) {
        onOpenAuthGate(callback);
      } else {
        pendingFollowRef.current = callback;
        setAuthGateOpen(true);
      }
      return;
    }
    setBusy(true);
    const next = !following;
    setFollowing(next);
    setFollowerCount(c => c + (next ? 1 : -1));
    try {
      const accessToken = await getAccessToken();
      if (next) {
        await followAuthor(author.id, accessToken);
      } else {
        await unfollowAuthor(author.id, accessToken);
      }
    } catch (err) {
      setFollowing(!next);
      setFollowerCount(c => c + (next ? -1 : 1));
      if (err instanceof ApiError && err.status === 401) {
        sessionStorage.setItem(PENDING_FOLLOW_KEY, String(author.id));
        const callback = () => void applyFollow();
        if (onOpenAuthGate) {
          onOpenAuthGate(callback);
        } else {
          pendingFollowRef.current = callback;
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
          <span className="rail-followers">{followerCount.toLocaleString()} followers</span>
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
            onClose={() => {
              setAuthGateOpen(false);
              sessionStorage.removeItem(PENDING_FOLLOW_KEY);
            }}
            onSuccess={() => {
              setAuthGateOpen(false);
              sessionStorage.removeItem(PENDING_FOLLOW_KEY);
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

      {!onOpenAuthGate && (
        <AuthGateModal
          isOpen={authGateOpen}
          onClose={() => {
            setAuthGateOpen(false);
            sessionStorage.removeItem(PENDING_FOLLOW_KEY);
          }}
          onSuccess={() => {
            setAuthGateOpen(false);
            sessionStorage.removeItem(PENDING_FOLLOW_KEY);
            pendingFollowRef.current?.();
            pendingFollowRef.current = null;
          }}
        />
      )}
    </div>
  );
}
