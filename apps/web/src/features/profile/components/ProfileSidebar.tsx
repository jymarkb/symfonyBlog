import { useCurrentSession } from "@/features/auth/session";
import type { ProfileSidebarProps } from "@/features/profile/profileTypes";

export function ProfileSidebar({ profile }: ProfileSidebarProps) {
  const { user } = useCurrentSession();

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <aside className="profile-sidebar">
      <div className="side-card">
        <h4>Reading stats</h4>
        <div>
          <div className="stat-row">
            <span className="label">Posts read</span>
            <span className="value">
              {profile ? profile.posts_read_count : "—"}
            </span>
          </div>
          <div className="stat-row">
            <span className="label">Comments written</span>
            <span className="value">
              {profile ? profile.comments_count : "—"}
            </span>
          </div>
          <div className="stat-row">
            <span className="label">Member since</span>
            <span className="value">{memberSince}</span>
          </div>
          <div className="stat-row">
            <span className="label">Subscribed</span>
            <span className="value">—</span>
          </div>
        </div>
      </div>

      <div className="side-card">
        <h4>Notifications</h4>
        <div className="field" style={{ marginBottom: 12 }}>
          <label htmlFor="notif-replies">Replies to my comments</label>
          <select disabled id="notif-replies">
            <option>Email me immediately</option>
            <option>Weekly digest</option>
            <option>None</option>
          </select>
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label htmlFor="notif-posts">New posts</label>
          <select defaultValue="None" disabled id="notif-posts">
            <option>Email on publish</option>
            <option>Weekly digest</option>
            <option>None</option>
          </select>
        </div>
        <p className="hint" style={{ marginBottom: 0 }}>
          Notification settings coming soon.
        </p>
      </div>

      <div className="side-card">
        <h4>Quick links</h4>
        <div style={{ display: "grid", gap: 6 }}>
          <a className="btn btn-sm btn-ghost" href="/blog">
            Browse all posts →
          </a>
          <a className="btn btn-sm btn-ghost" href="/contact">
            Contact support →
          </a>
        </div>
      </div>
    </aside>
  );
}
