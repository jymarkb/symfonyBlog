import { useEffect, useState } from 'react';

import { ApiError } from '@/lib/api/apiClient';
import { getAccessToken } from '@/lib/auth/getAccessToken';
import { useCurrentSession } from '@/features/auth/session/useCurrentSession';
import { toggleReaction } from '../api/blogApi';
import type { ReactionCounts, ReactionType, ReactionToggleResponse } from '../blogTypes';

const PENDING_REACTION_KEY = 'pending_reaction';

type ReactionButtonProps = {
  emoji: string;
  label: string;
  reactionType: ReactionType;
  postSlug: string;
  initialCount: number;
  initialActive: boolean;
  openAuthGate: (callback: () => void) => void;
  onCountsUpdate?: (counts: ReactionCounts) => void;
};

export function ReactionButton({
  emoji,
  label,
  reactionType,
  postSlug,
  initialCount,
  initialActive,
  openAuthGate,
  onCountsUpdate,
}: ReactionButtonProps) {
  const [active, setActive] = useState(initialActive);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const { isAuthenticated } = useCurrentSession();

  // OAuth path: after redirect back, apply the pending reaction stored before OAuth started
  useEffect(() => {
    if (!isAuthenticated) return;
    const raw = sessionStorage.getItem(PENDING_REACTION_KEY);
    if (!raw) return;
    try {
      const pending = JSON.parse(raw) as { slug: string; reaction: string };
      if (pending.slug === postSlug && pending.reaction === reactionType) {
        sessionStorage.removeItem(PENDING_REACTION_KEY);
        void applyReaction();
      }
    } catch {
      // malformed storage entry — ignore
    }
  }, [isAuthenticated]);

  async function applyReaction() {
    if (busy) return;
    setBusy(true);
    const wasActive = active;
    const delta = wasActive ? -1 : 1;
    setActive(!wasActive);
    setCount((c) => c + delta);
    try {
      const accessToken = await getAccessToken();
      const result: ReactionToggleResponse = await toggleReaction(postSlug, reactionType, accessToken);
      // Sync with server truth
      setActive(result.reaction === reactionType);
      setCount(result.counts[reactionType]);
      onCountsUpdate?.(result.counts);
    } catch (err) {
      // Roll back
      setActive(wasActive);
      setCount((c) => c - delta);
      if (err instanceof ApiError && err.status === 401) {
        sessionStorage.setItem(PENDING_REACTION_KEY, JSON.stringify({ slug: postSlug, reaction: reactionType }));
        openAuthGate(() => void applyReaction());
      }
    } finally {
      setBusy(false);
    }
  }

  function handleClick() {
    if (busy) return;
    if (!isAuthenticated) {
      sessionStorage.setItem(PENDING_REACTION_KEY, JSON.stringify({ slug: postSlug, reaction: reactionType }));
      openAuthGate(() => void applyReaction());
      return;
    }
    void applyReaction();
  }

  return (
    <button
      className={`react-btn${active ? ' react-btn--active' : ''}`}
      onClick={handleClick}
      disabled={busy}
      aria-label={label}
      aria-pressed={active}
    >
      {emoji} <span className="count">{count > 0 ? count : '—'}</span>
    </button>
  );
}
