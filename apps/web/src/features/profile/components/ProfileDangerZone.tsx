export function ProfileDangerZone() {
  return (
    <div className="danger-section">
      <h2>Delete account</h2>
      <p>
        Permanently removes your account, comment history, and reading data. This cannot be undone.
        Your comments on public posts will be anonymised.
      </p>
      <button
        className="btn btn-sm"
        disabled
        style={{ borderColor: 'oklch(0.65 0.14 20)', color: 'oklch(0.42 0.14 20)', opacity: 0.5, cursor: 'not-allowed' }}
        type="button"
      >
        Delete my account
      </button>
    </div>
  );
}
