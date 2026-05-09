interface Props {
  eyebrow: string;
  heading: string;
  em: string;
  lede: string;
  error?: string;
  children: React.ReactNode;
}

export function AuthConfirm({ eyebrow, heading, em, lede, error, children }: Props) {
  return (
    <div className="auth-confirm">
      <div aria-hidden="true" className="auth-confirm-mark">
        OK
      </div>

      <div className="eyebrow mb-4">{eyebrow}</div>

      <h1>
        {heading} <em>{em}</em>.
      </h1>

      <p className="lede">{lede}</p>

      {error && (
        <div aria-live="polite" role="status">
          <div className="form-alert">{error}</div>
        </div>
      )}

      <div className="callback-actions">{children}</div>
    </div>
  );
}
