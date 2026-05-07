import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/auth/supabaseClient";
import { fetchPrivateProfile } from "@/features/profile/api/profileApi";
import type { PrivateProfile } from "@/features/profile/profileTypes";

import { ProfileHead } from "@/features/profile/components/ProfileHead";
import { ProfilePage } from "@/features/profile/components/ProfilePage";
import { ProfilePasswordSection } from "@/features/profile/components/ProfilePasswordSection";
import { ProfileCommentHistory } from "@/features/profile/components/ProfileCommentHistory";
import { ProfileRecentlyViewed } from "@/features/profile/components/ProfileRecentlyViewed";
import { ProfileDangerZone } from "@/features/profile/components/ProfileDangerZone";
import { ProfileSidebar } from "@/features/profile/components/ProfileSidebar";

export default function Page() {
  const [profile, setProfile] = useState<PrivateProfile | null>(null);

  const loadProfile = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.access_token) return;
    try {
      const next = await fetchPrivateProfile(data.session.access_token);
      setProfile(next);
    } catch {
      // ProfilePage handles its own error state internally
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return (
    <>
      <ProfileHead />
      <div className="shell profile-layout">
        <div>
          <ProfilePage onProfileChange={setProfile} />
          <ProfilePasswordSection />
          <ProfileCommentHistory />
          <ProfileRecentlyViewed />
          <ProfileDangerZone />
        </div>
        <ProfileSidebar profile={profile} onProfileChange={setProfile} />
      </div>
    </>
  );
}
