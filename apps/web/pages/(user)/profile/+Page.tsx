import { useState } from "react";
import { useData } from "vike-react/useData";

import type { PrivateProfile } from "@/features/profile/profileTypes";
import type { ProfilePageData } from "@/features/profile/profileTypes";

import { ProfileHead } from "@/features/profile/components/ProfileHead";
import { ProfilePage } from "@/features/profile/components/ProfilePage";
import { ProfilePasswordSection } from "@/features/profile/components/ProfilePasswordSection";
import { ProfileCommentHistory } from "@/features/profile/components/ProfileCommentHistory";
import { ProfileRecentlyViewed } from "@/features/profile/components/ProfileRecentlyViewed";
import { ProfileDangerZone } from "@/features/profile/components/ProfileDangerZone";
import { ProfileSidebar } from "@/features/profile/components/ProfileSidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Page() {
  const data = useData<ProfilePageData>();
  const [profile, setProfile] = useState<PrivateProfile>(data.profile);

  return (
    <ErrorBoundary>
      <ProfileHead profile={profile} />
      <div className="shell profile-layout">
        <div>
          <ProfilePage initialProfile={profile} onProfileChange={setProfile} />
          <ProfilePasswordSection />
          <ProfileCommentHistory initialComments={data.comments} />
          <ProfileRecentlyViewed initialHistory={data.readingHistory} />
          <ProfileDangerZone />
        </div>
        <ProfileSidebar profile={profile} onProfileChange={setProfile} />
      </div>
    </ErrorBoundary>
  );
}
