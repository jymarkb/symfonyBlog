export function ProfilePasswordSection() {
  return (
    <div className="profile-section">
      <h2>Change password</h2>
      <div className="field">
        <label htmlFor="pw-current">Current password</label>
        <input disabled id="pw-current" placeholder="Enter your current password" type="password" />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="pw-new">New password</label>
          <input disabled id="pw-new" placeholder="At least 8 characters" type="password" />
        </div>
        <div className="field">
          <label htmlFor="pw-confirm">Confirm new password</label>
          <input disabled id="pw-confirm" placeholder="Repeat new password" type="password" />
        </div>
      </div>
      <button className="btn" disabled type="button">Update password</button>
      <p className="hint" style={{ marginTop: 10, marginBottom: 0 }}>Password change coming soon.</p>
    </div>
  );
}
