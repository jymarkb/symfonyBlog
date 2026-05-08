import { useEffect, useRef, useState } from "react";

import { useCurrentSession } from "@/features/auth/session";
import { getAccessToken } from "@/lib/auth/getAccessToken";
import { logError } from "@/lib/utils/logError";
import { updateNotifications } from "@/features/profile/api/profileApi";
import { FormMessage } from "@/components/ui/FormMessage";
import type {
  NotificationPreference,
  ProfileSidebarProps,
  UpdateNotificationsPayload,
} from "@/features/profile/profileTypes";

export function ProfileSidebar({ profile, onProfileChange }: ProfileSidebarProps) {
  const { user } = useCurrentSession();
  const [notifError, setNotifError] = useState<string | null>(null);
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";

  async function handleNotifChange(
    field: keyof UpdateNotificationsPayload,
    value: NotificationPreference,
  ) {
    setIsSaving(true);
    try {
      const accessToken = await getAccessToken();
      const updatedProfile = await updateNotifications(accessToken, { [field]: value });
      if (!mountedRef.current) return;
      onProfileChange(updatedProfile);
      setNotifError(null);
      setNotifSuccess("Saved.");
      setTimeout(() => { if (mountedRef.current) setNotifSuccess(null); }, 2000);
    } catch (error) {
      logError(error);
      if (mountedRef.current) setNotifError("Failed to save preference.");
    } finally {
      if (mountedRef.current) setIsSaving(false);
    }
  }

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
        </div>
      </div>

      <div className="side-card">
        <h4>Notifications</h4>
        <div className="field" style={{ marginBottom: 12 }}>
          <label htmlFor="notif-replies">Replies to my comments</label>
          <select
            disabled={isSaving || !profile}
            id="notif-replies"
            value={profile?.notify_comment_replies ?? 'none'}
            onChange={(e) =>
              void handleNotifChange(
                'notify_comment_replies',
                e.target.value as NotificationPreference,
              )
            }
          >
            <option value="immediate">Email me immediately</option>
            <option value="digest">Weekly digest</option>
            <option value="none">None</option>
          </select>
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label htmlFor="notif-posts">New posts</label>
          <select
            disabled={isSaving || !profile}
            id="notif-posts"
            value={profile?.notify_new_posts ?? 'none'}
            onChange={(e) =>
              void handleNotifChange(
                'notify_new_posts',
                e.target.value as NotificationPreference,
              )
            }
          >
            <option value="immediate">Email on publish</option>
            <option value="digest">Weekly digest</option>
            <option value="none">None</option>
          </select>
        </div>
        <FormMessage error={notifError} success={notifSuccess} />
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
