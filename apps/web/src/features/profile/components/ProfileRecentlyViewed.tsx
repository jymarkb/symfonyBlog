import type { ProfileReadingHistoryItem } from "@/features/profile/profileTypes";
import { fetchReadingHistory } from "@/features/profile/api/profileApi";
import { useProfileFetch } from "@/features/profile/hooks/useProfileFetch";
import { ProfilePlaceholder } from "@/features/profile/components/ProfilePlaceholder";
import { ProfileSection } from "@/features/profile/components/ProfileSection";

export function ProfileRecentlyViewed() {
  const { data: history, isLoading, error } = useProfileFetch<ProfileReadingHistoryItem>(
    fetchReadingHistory,
    "Unable to load reading history.",
  );

  if (isLoading) {
    return (
      <ProfileSection title="Recently viewed">
        <ProfilePlaceholder>Loading…</ProfilePlaceholder>
      </ProfileSection>
    );
  }

  if (error) {
    return (
      <ProfileSection title="Recently viewed">
        <ProfilePlaceholder>{error}</ProfilePlaceholder>
      </ProfileSection>
    );
  }

  if (history.length === 0) {
    return (
      <ProfileSection title="Recently viewed">
        <ProfilePlaceholder>
          No reading history yet. Start reading to track your progress.
        </ProfilePlaceholder>
      </ProfileSection>
    );
  }

  return (
    <ProfileSection title="Recently viewed">
      <div className="viewed-list">
        {history.map((item) => (
          <div key={item.post_id} className="viewed-item">
            <a href={`/blog/${item.post_slug}`}>{item.post_title}</a>
            <div className="viewed-meta">
              {new Date(item.last_viewed_at).toLocaleDateString()}
              <div className="read-progress-bar">
                <i style={{ width: `${item.read_progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ProfileSection>
  );
}
