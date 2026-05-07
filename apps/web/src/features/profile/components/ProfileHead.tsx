import { useCurrentSession } from '@/features/auth/session';

export function ProfileHead() {
  const { user, isLoading } = useCurrentSession();

  if (isLoading) {
    return <div className="shell"><div className="profile-head" /></div>;
  }

  const displayName = user?.display_name ?? user?.handle?.replace(/^@/, '') ?? 'User';
  const handle = user?.handle ?? '';
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const metaItems = [
    handle || null,
    memberSince ? `Member since ${memberSince}` : null,
  ].filter(Boolean);

  return (
    <div className="shell">
      <div className="profile-head">
        {user?.avatar_url ? (
          <img alt="" className="avatar avatar-lg" src={user.avatar_url} style={{ objectFit: 'cover' }} />
        ) : (
          <div className="avatar avatar-lg">{avatarInitial}</div>
        )}

        <div className="profile-info">
          <h1 className="profile-name">{displayName}</h1>
          <div className="profile-meta">
            {metaItems.map((item, i) => (
              <span key={item}>
                {i > 0 && <span style={{ marginRight: 12 }}>·</span>}
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
