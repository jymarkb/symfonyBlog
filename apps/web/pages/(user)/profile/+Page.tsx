import { ProfileCommentHistory } from '@/features/profile/components/ProfileCommentHistory';
import { ProfileDangerZone } from '@/features/profile/components/ProfileDangerZone';
import { ProfileHead } from '@/features/profile/components/ProfileHead';
import { ProfilePasswordSection } from '@/features/profile/components/ProfilePasswordSection';
import { ProfilePage } from '@/features/profile/components/ProfilePage';
import { ProfileRecentlyViewed } from '@/features/profile/components/ProfileRecentlyViewed';
import { ProfileSidebar } from '@/features/profile/components/ProfileSidebar';

export default function Page() {
  return (
    <>
      <ProfileHead />

      <div className="shell profile-layout">
        <div>
          <ProfilePage />
          <ProfilePasswordSection />
          <ProfileCommentHistory />
          <ProfileRecentlyViewed />
          <ProfileDangerZone />
        </div>

        <ProfileSidebar />
      </div>
    </>
  );
}
