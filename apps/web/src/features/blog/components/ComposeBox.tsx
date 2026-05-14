import { useAutoResizeTextarea } from '../hooks/useAutoResizeTextarea';

const MAX_LENGTH = 250;

function CharacterCounter({ value, max }: { value: string; max: number }) {
  const remaining = max - value.length;
  const nearLimit = remaining <= 50;
  const overLimit = remaining < 0;
  const cls = overLimit ? ' over' : nearLimit ? ' warn' : '';
  return (
    <span className={`compose-count${cls}`}>
      {overLimit
        ? `${Math.abs(remaining)} character${Math.abs(remaining) === 1 ? '' : 's'} over the limit`
        : `${remaining} character${remaining === 1 ? '' : 's'} remaining`}
    </span>
  );
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  busy: boolean;
  placeholder: string;
  showToolbar: boolean;
  avatarInitial?: string;
  error?: string | null;
};

export function ComposeBox({
  value,
  onChange,
  onSubmit,
  onCancel,
  busy,
  placeholder,
  showToolbar,
  avatarInitial,
  error,
}: Props) {
  const ref = useAutoResizeTextarea(value);

  if (showToolbar) {
    return (
      <div className="compose">
        <div className="compose-body">
          <div className="compose-avatar">{avatarInitial ?? '?'}</div>
          <textarea
            ref={ref}
            className="compose-textarea"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            readOnly={busy}
            rows={3}
          />
        </div>
        <div className="compose-foot">
          <CharacterCounter value={value} max={MAX_LENGTH} />
          <div className="compose-actions">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => void onSubmit()}
              disabled={busy || !value.trim() || value.length > MAX_LENGTH}
              aria-label={busy ? 'Posting comment' : 'Post comment'}
            >
              {busy ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </div>
        {error && <p className="compose-error-msg">{error}</p>}
      </div>
    );
  }

  return (
    <div className="reply-compose">
      <textarea
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={busy}
        rows={2}
      />
      <div className="reply-compose-counter"><CharacterCounter value={value} max={MAX_LENGTH} /></div>
      {error && <p className="compose-error-msg">{error}</p>}
      <div className="reply-compose-actions">
        {onCancel && (
          <button
            className="btn btn-sm"
            onClick={onCancel}
            disabled={busy}
            aria-label="Cancel reply"
          >
            Cancel
          </button>
        )}
        <button
          className="btn btn-sm btn-primary"
          onClick={() => void onSubmit()}
          disabled={busy || !value.trim() || value.length > MAX_LENGTH}
          aria-label={busy ? 'Posting reply' : 'Post reply'}
        >
          {busy ? 'Posting…' : 'Reply'}
        </button>
      </div>
    </div>
  );
}
