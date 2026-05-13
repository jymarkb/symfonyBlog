import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api/apiClient';
import { getAccessToken, probeAccessToken } from '@/lib/auth/getAccessToken';
import { followAuthor, unfollowAuthor } from '../api/blogApi';

export const PENDING_FOLLOW_KEY = 'pending_follow_author_id';

type UsePendingFollowParams = {
  authorId: number;
  initialFollowing: boolean;
  initialFollowersCount: number;
  onFollowChange?: (following: boolean, count: number) => void;
  onOpenAuthGate?: (callback: () => void) => void;
};

type UsePendingFollowResult = {
  following: boolean;
  followerCount: number;
  busy: boolean;
  handleFollow: () => Promise<void>;
};

export function usePendingFollow({
  authorId,
  initialFollowing,
  initialFollowersCount,
  onFollowChange,
  onOpenAuthGate,
}: UsePendingFollowParams): UsePendingFollowResult {
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowersCount);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFollowing(initialFollowing);
    setFollowerCount(initialFollowersCount);
  }, [initialFollowing, initialFollowersCount]);

  async function handleFollow() {
    if (busy) return;

    const token = await probeAccessToken();
    if (!token) {
      sessionStorage.setItem(PENDING_FOLLOW_KEY, String(authorId));
      onOpenAuthGate?.(() => {});
      return;
    }

    setBusy(true);
    const next = !following;
    setFollowing(next);
    setFollowerCount(c => Math.max(0, c + (next ? 1 : -1)));

    try {
      const accessToken = await getAccessToken();
      if (next) {
        const result = await followAuthor(authorId, accessToken);
        setFollowerCount(result.followers_count);
        onFollowChange?.(true, result.followers_count);
      } else {
        await unfollowAuthor(authorId, accessToken);
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
        sessionStorage.setItem(PENDING_FOLLOW_KEY, String(authorId));
        onOpenAuthGate?.(() => {});
      }
    } finally {
      setBusy(false);
    }
  }

  return { following, followerCount, busy, handleFollow };
}
