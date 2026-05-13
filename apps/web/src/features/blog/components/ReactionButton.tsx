import type { ReactionType } from '../blogTypes';

type ReactionButtonProps = {
  emoji: string;
  label: string;
  reactionType: ReactionType;
  count: number;
  isActive: boolean;
  busy: boolean;
  onClick: () => void;
};

export function ReactionButton({
  emoji,
  label,
  count,
  isActive,
  busy,
  onClick,
}: ReactionButtonProps) {
  return (
    <button
      className={`react-btn${isActive ? ' react-btn--active' : ''}`}
      onClick={onClick}
      disabled={busy}
      aria-label={label}
      aria-pressed={isActive}
    >
      {emoji} <span className="count">{count > 0 ? count : '—'}</span>
    </button>
  );
}
