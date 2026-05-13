import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/apiClient';
import { getAccessToken, probeAccessToken } from '@/lib/auth/getAccessToken';
import { toggleReaction } from '../api/blogApi';
import type { ReactionType, ReactionCounts } from '../blogTypes';

const PENDING_REACTION_KEY = 'pending_reaction';

type Params = {
  postSlug: string;
  initialActiveReaction: ReactionType | null;
  initialCounts: ReactionCounts;
  onOpenAuthGate?: () => void;
};

type Result = {
  activeReaction: ReactionType | null;
  reactionCounts: ReactionCounts;
  busy: boolean;
  handleReaction: (type: ReactionType) => Promise<void>;
};

export function usePendingReaction({ postSlug, initialActiveReaction, initialCounts, onOpenAuthGate }: Params): Result {
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(initialActiveReaction);
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>(initialCounts);
  const [busy, setBusy] = useState(false);

  // Sync when page-level initial values update (e.g. after client-side userState fetch)
  useEffect(() => {
    setActiveReaction(initialActiveReaction);
  }, [initialActiveReaction]);

  useEffect(() => {
    setReactionCounts(initialCounts);
  }, [initialCounts]);

  // Pick up pending reaction after login
  useEffect(() => {
    const raw = sessionStorage.getItem(PENDING_REACTION_KEY);
    if (!raw) return;
    let pending: { slug: string; reaction: string } | null = null;
    try { pending = JSON.parse(raw); } catch { return; }
    if (!pending || pending.slug !== postSlug) return;
    sessionStorage.removeItem(PENDING_REACTION_KEY);
    void handleReaction(pending.reaction as ReactionType);
  // This effect must run whenever the hook mounts after a login redirect — no deps needed
  // beyond postSlug because the sessionStorage key is the authoritative signal.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postSlug]);

  async function handleReaction(reactionType: ReactionType): Promise<void> {
    if (busy) return;

    const token = await probeAccessToken();
    if (!token) {
      sessionStorage.setItem(PENDING_REACTION_KEY, JSON.stringify({ slug: postSlug, reaction: reactionType }));
      onOpenAuthGate?.();
      return;
    }

    const prevReaction = activeReaction;
    const prevCounts = { ...reactionCounts } as ReactionCounts;
    const nextReaction: ReactionType | null = activeReaction === reactionType ? null : reactionType;

    setActiveReaction(nextReaction);
    setReactionCounts(prev => {
      const next = { ...prev } as ReactionCounts;
      if (prevReaction) next[prevReaction] = Math.max(0, (next[prevReaction] ?? 0) - 1);
      if (nextReaction) next[nextReaction] = (next[nextReaction] ?? 0) + 1;
      return next;
    });
    setBusy(true);

    try {
      const accessToken = await getAccessToken();
      const result = await toggleReaction(postSlug, reactionType, accessToken);
      setActiveReaction(result.reaction);
      setReactionCounts(result.counts);
    } catch (err) {
      setActiveReaction(prevReaction);
      setReactionCounts(prevCounts);
      if (err instanceof ApiError && err.status === 401) {
        sessionStorage.setItem(PENDING_REACTION_KEY, JSON.stringify({ slug: postSlug, reaction: reactionType }));
        onOpenAuthGate?.();
      }
    } finally {
      setBusy(false);
    }
  }

  return { activeReaction, reactionCounts, busy, handleReaction };
}
