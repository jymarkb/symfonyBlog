import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/auth/supabaseClient";
import type { ProfileComment } from "@/features/profile/profileTypes";
import { fetchProfileComments } from "@/features/profile/api/profileApi";
import { CommentSkeleton } from "./comment/skeleton";
import CommentList from "./comment/list";

export function ProfileCommentHistory() {
  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !data.session?.access_token) return;

    try {
      const result = await fetchProfileComments(data.session.access_token);
      setComments(result);
    } catch {
      setError("Unable to load comment history.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="profile-section">
        <h2>Comment history</h2>
        <CommentSkeleton>Loading…</CommentSkeleton>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-section">
        <h2>Comment history</h2>
        <CommentSkeleton>{error}</CommentSkeleton>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="profile-section">
        <h2>Comment history</h2>
        <CommentSkeleton>
          No comments yet. Join the conversation on any post.
        </CommentSkeleton>
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
