import type { ProfileComment } from "@/features/profile/profileTypes";
import { fetchProfileComments } from "@/features/profile/api/profileApi";
import { useProfileFetch } from "@/features/profile/hooks/useProfileFetch";
import { ProfileDataSection } from "@/features/profile/components/ProfileDataSection";
import CommentList from "./comment/list";

export function ProfileCommentHistory() {
  const { data: comments, isLoading, error } = useProfileFetch<ProfileComment>(
    fetchProfileComments,
    "Unable to load comment history.",
  );

  return (
    <ProfileDataSection
      title="Comment history"
      isLoading={isLoading}
      error={error}
      isEmpty={comments.length === 0}
      emptyMessage="No comments yet. Join the conversation on any post."
    >
      <CommentList commentList={comments} />
    </ProfileDataSection>
  );
}
