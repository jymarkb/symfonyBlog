import type { ProfileReadingHistoryItem } from "@/features/profile/profileTypes";
import { fetchReadingHistory } from "@/features/profile/api/profileApi";
import { useProfileFetch } from "@/features/profile/hooks/useProfileFetch";
import { ProfileDataSection } from "@/features/profile/components/ProfileDataSection";

export function ProfileRecentlyViewed({ initialHistory }: { initialHistory?: ProfileReadingHistoryItem[] }) {
  const { data: history, isLoading, error } = useProfileFetch<ProfileReadingHistoryItem>(
    fetchReadingHistory,
    "Unable to load reading history.",
    initialHistory,
  );

  return (
    <ProfileDataSection
      title="Recently viewed"
      isLoading={isLoading}
      error={error}
      isEmpty={history.length === 0}
      emptyMessage="No reading history yet. Start reading to track your progress."
    >
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
    </ProfileDataSection>
  );
}
