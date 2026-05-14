import { useAutoResizeTextarea } from '../hooks/useAutoResizeTextarea';

const MAX_LENGTH = 250;
const WARN_THRESHOLD = 50;

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
  const remaining = MAX_LENGTH - value.length;
  const nearLimit = remaining <= WARN_THRESHOLD;
  const overLimit = remaining < 0;

  const counterClass = overLimit ? ' over' : nearLimit ? ' warn' : '';
  const counter = (
    <span className={`compose-count${counterClass}`}>
      {overLimit
        ? `${Math.abs(remaining)} character${Math.abs(remaining) === 1 ? '' : 's'} over the limit`
        : `${remaining} character${remaining === 1 ? '' : 's'} remaining`}
    </span>
  );

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
          {counter}
          <div className="compose-actions">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => void onSubmit()}
              disabled={busy || !value.trim() || overLimit}
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
      {counter && <div className="reply-compose-counter">{counter}</div>}
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
          disabled={busy || !value.trim() || overLimit}
          aria-label={busy ? 'Posting reply' : 'Post reply'}
        >
          {busy ? 'Posting…' : 'Reply'}
        </button>
      </div>
    </div>
  );
}
