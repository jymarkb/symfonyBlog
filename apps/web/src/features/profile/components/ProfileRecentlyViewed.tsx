import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/auth/supabaseClient";
import type { ProfileReadingHistoryItem } from "@/features/profile/profileTypes";
import { fetchReadingHistory } from "@/features/profile/api/profileApi";

export function ProfileRecentlyViewed() {
  const [history, setHistory] = useState<ProfileReadingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !data.session?.access_token) {
      setError("Unable to load reading history.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await fetchReadingHistory(data.session.access_token);
      setHistory(result);
    } catch {
      setError("Unable to load reading history.");
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
        <h2>Recently viewed</h2>
        <p>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-section">
        <h2>Recently viewed</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="profile-section">
        <h2>Recently viewed</h2>
        <p>No reading history yet. Start reading to track your progress.</p>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <h2>Recently viewed</h2>
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
    </div>
  );
}
