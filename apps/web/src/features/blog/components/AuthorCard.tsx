import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api/apiClient';
import { getAccessToken, tryGetAccessToken } from '@/lib/auth/getAccessToken';
import { useCurrentSession } from '@/features/auth/session/useCurrentSession';
import { followAuthor, unfollowAuthor } from '../api/blogApi';
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

const PENDING_FOLLOW_KEY = 'pending_follow_author_id';

export function AuthorCard({ post, variant, onOpenAuthGate, initialFollowing, initialFollowersCount, onFollowChange }: AuthorCardProps) {
  const { author } = post;
  const displayName = author.display_name ?? author.handle;
  const initials = getInitials(author.display_name, author.handle);

  const [following, setFollowing] = useState(initialFollowing ?? false);
  const [followerCount, setFollowerCount] = useState(initialFollowersCount ?? author.followers_count ?? 0);
  const [busy, setBusy] = useState(false);
  const { isAuthenticated } = useCurrentSession();

  useEffect(() => {
    setFollowing(initialFollowing ?? false);
    if (initialFollowersCount !== undefined) {
      setFollowerCount(initialFollowersCount);
    }
  }, [initialFollowing, initialFollowersCount]);

  async function handleFollow() {
    if (busy) return;
    if (!isAuthenticated) {
      // isAuthenticated comes from CurrentSessionContext which waits for fetchCurrentUser
      // before flipping to true. getSession() resolves immediately from localStorage, so
      // we probe it here to avoid treating a mid-resolve authenticated user as a guest.
      let token: string | null = null;
      try {
        token = await tryGetAccessToken();
      } catch {
        // Supabase unreachable — treat as unauthenticated
      }
      if (!token) {
        sessionStorage.setItem(PENDING_FOLLOW_KEY, String(author.id));
        onOpenAuthGate?.(() => {});
        return;
      }
      // Token exists — context hasn't caught up yet; fall through to authenticated path.
    }
    setBusy(true);
    const next = !following;
    setFollowing(next);
    if (next) {
      setFollowerCount(c => c + 1);
    } else {
      setFollowerCount(c => Math.max(0, c - 1));
    }
    try {
      const accessToken = await getAccessToken();
      if (next) {
        const result = await followAuthor(author.id, accessToken);
        setFollowerCount(result.followers_count);
        onFollowChange?.(true, result.followers_count);
      } else {
        await unfollowAuthor(author.id, accessToken);
        let newCount = 0;
        setFollowerCount(c => {
          newCount = Math.max(0, c - 1);
          return newCount;
        });
        onFollowChange?.(false, newCount);
      }
    } catch (err) {
      setFollowing(!next);
      setFollowerCount(c => c + (next ? -1 : 1));
      if (err instanceof ApiError && err.status === 401) {
        sessionStorage.setItem(PENDING_FOLLOW_KEY, String(author.id));
        onOpenAuthGate?.(() => {});
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
