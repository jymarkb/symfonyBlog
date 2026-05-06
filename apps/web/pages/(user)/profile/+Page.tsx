import { RequireAuth } from "@/features/auth/guards";
import { ProfilePage } from "@/features/profile/components/ProfilePage";
import { AppShell } from "@/layouts/AppShell";

export default function Page() {
  return (
    <AppShell>
      <RequireAuth>
        <ProfilePage />
      </RequireAuth>
    </AppShell>
  );
}
