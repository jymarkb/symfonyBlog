interface Props {
  error?: string | null;
  success?: string | null;
}

export function FormMessage({ error, success }: Props) {
  return (
    <div aria-live="polite" role="status">
      {error && <div className="form-alert">{error}</div>}
      {success && <div className="form-success">{success}</div>}
    </div>
  );
}
