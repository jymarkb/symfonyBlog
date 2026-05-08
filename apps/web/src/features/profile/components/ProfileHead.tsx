import type { PrivateProfile } from '@/features/profile/profileTypes';

export function ProfileHead({ profile }: { profile: PrivateProfile }) {
  const displayName = profile.display_name ?? profile.handle?.replace(/^@/, '') ?? 'User';
  const handle = profile.handle ?? '';
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const metaItems = [
    handle || null,
    memberSince ? `Member since ${memberSince}` : null,
  ].filter(Boolean);

  return (
    <div className="shell">
      <div className="profile-head">
        <div className="avatar avatar-lg">{avatarInitial}</div>

        <div className="profile-info">
          <h1 className="profile-name">{displayName}</h1>
          <div className="profile-meta">
            {metaItems.map((item, i) => (
              <span key={i}>
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
