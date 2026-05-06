export function ProfileRecentlyViewed() {
  return (
    <div className="profile-section">
      <h2>Recently viewed</h2>
      <p style={{ fontSize: '14px', color: 'var(--ink-4)', margin: '0 0 14px' }}>
        No reading history yet.
      </p>
      <a className="btn btn-sm btn-ghost" href="/blog">Browse posts →</a>
    </div>
  );
}
