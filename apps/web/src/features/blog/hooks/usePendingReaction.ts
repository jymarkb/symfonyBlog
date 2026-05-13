import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/apiClient';
import { getAccessToken, probeAccessToken } from '@/lib/auth/getAccessToken';
import { toggleReaction } from '../api/blogApi';
import type { ReactionType, ReactionCounts } from '../blogTypes';

const PENDING_REACTION_KEY = 'pending_reaction';

type Params = {
  postSlug: string;
  initialActiveReaction: ReactionType[];
  initialCounts: ReactionCounts;
  onOpenAuthGate?: () => void;
};

type Result = {
  activeReactions: ReactionType[];
  reactionCounts: ReactionCounts;
  busy: boolean;
  handleReaction: (type: ReactionType) => Promise<void>;
};

export function usePendingReaction({ postSlug, initialActiveReaction, initialCounts, onOpenAuthGate }: Params): Result {
  const [activeReactions, setActiveReactions] = useState<ReactionType[]>(initialActiveReaction);
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>(initialCounts);
  const [busy, setBusy] = useState(false);

  // Sync when page-level initial values update (e.g. after client-side userState fetch).
  // JSON.stringify used as dep to guard against new-reference-same-value re-fires (e.g. [] !== []).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setActiveReactions(initialActiveReaction); }, [JSON.stringify(initialActiveReaction)]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setReactionCounts(initialCounts); }, [JSON.stringify(initialCounts)]);

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

    const isActive = activeReactions.includes(reactionType);
    const prevReactions = [...activeReactions];
    const prevCounts = { ...reactionCounts } as ReactionCounts;

    // Optimistic update
    setActiveReactions(prev =>
      isActive ? prev.filter(r => r !== reactionType) : [...prev, reactionType]
    );
    setReactionCounts(prev => {
      const next = { ...prev } as ReactionCounts;
      next[reactionType] = Math.max(0, (next[reactionType] ?? 0) + (isActive ? -1 : 1));
      return next;
    });
    setBusy(true);

    try {
      const accessToken = await getAccessToken();
      const result = await toggleReaction(postSlug, reactionType, accessToken);
      setActiveReactions(result.reaction);  // server-reconciled array
      setReactionCounts(result.counts);
    } catch (err) {
      setActiveReactions(prevReactions);
      setReactionCounts(prevCounts);
      if (err instanceof ApiError && err.status === 401) {
        sessionStorage.setItem(PENDING_REACTION_KEY, JSON.stringify({ slug: postSlug, reaction: reactionType }));
        onOpenAuthGate?.();
      }
    } finally {
      setBusy(false);
    }
  }

  return { activeReactions, reactionCounts, busy, handleReaction };
}
