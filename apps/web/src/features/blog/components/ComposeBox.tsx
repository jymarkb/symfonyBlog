type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  busy: boolean;
  placeholder: string;
  showToolbar: boolean;
  avatarInitial?: string;
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
}: Props) {
  if (showToolbar) {
    return (
      <div className="compose">
        <div className="compose-body">
          <div className="compose-avatar">{avatarInitial ?? '?'}</div>
          <textarea
            className="compose-textarea"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            readOnly={busy}
            rows={3}
          />
        </div>
        <div className="compose-foot">
          <div className="compose-actions">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => void onSubmit()}
              disabled={busy || !value.trim()}
              aria-label={busy ? 'Posting comment' : 'Post comment'}
            >
              {busy ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reply-compose">
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={busy}
        rows={2}
      />
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
          disabled={busy || !value.trim()}
          aria-label={busy ? 'Posting reply' : 'Post reply'}
        >
          {busy ? 'Posting…' : 'Reply'}
        </button>
      </div>
    </div>
  );
}
