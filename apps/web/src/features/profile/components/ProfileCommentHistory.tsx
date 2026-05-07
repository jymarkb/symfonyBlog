import type { ProfileComment } from "@/features/profile/profileTypes";
import { fetchProfileComments } from "@/features/profile/api/profileApi";
import { useProfileFetch } from "@/features/profile/hooks/useProfileFetch";
import { ProfilePlaceholder } from "@/features/profile/components/ProfilePlaceholder";
import CommentList from "./comment/list";

export function ProfileCommentHistory() {
  const { data: comments, isLoading, error } = useProfileFetch<ProfileComment>(
    fetchProfileComments,
    "Unable to load comment history.",
  );

  if (isLoading) {
    return (
      <div className="profile-section">
        <h2>Comment history</h2>
        <ProfilePlaceholder>Loading…</ProfilePlaceholder>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-section">
        <h2>Comment history</h2>
        <ProfilePlaceholder>{error}</ProfilePlaceholder>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="profile-section">
        <h2>Comment history</h2>
        <ProfilePlaceholder>
          No comments yet. Join the conversation on any post.
        </ProfilePlaceholder>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <h2>Comment history</h2>
      <CommentList commentList={comments} />
    </div>
  );
}
