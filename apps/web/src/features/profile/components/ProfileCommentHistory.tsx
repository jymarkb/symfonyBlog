import type { ProfileComment } from "@/features/profile/profileTypes";
import { fetchProfileComments } from "@/features/profile/api/profileApi";
import { useProfileFetch } from "@/features/profile/hooks/useProfileFetch";
import { ProfilePlaceholder } from "@/features/profile/components/ProfilePlaceholder";
import { ProfileSection } from "@/features/profile/components/ProfileSection";
import CommentList from "./comment/list";

export function ProfileCommentHistory() {
  const { data: comments, isLoading, error } = useProfileFetch<ProfileComment>(
    fetchProfileComments,
    "Unable to load comment history.",
  );

  if (isLoading) {
    return (
      <ProfileSection title="Comment history">
        <ProfilePlaceholder>Loading…</ProfilePlaceholder>
      </ProfileSection>
    );
  }

  if (error) {
    return (
      <ProfileSection title="Comment history">
        <ProfilePlaceholder>{error}</ProfilePlaceholder>
      </ProfileSection>
    );
  }

  if (comments.length === 0) {
    return (
      <ProfileSection title="Comment history">
        <ProfilePlaceholder>
          No comments yet. Join the conversation on any post.
        </ProfilePlaceholder>
      </ProfileSection>
    );
  }

  return (
    <ProfileSection title="Comment history">
      <CommentList commentList={comments} />
    </ProfileSection>
  );
}
