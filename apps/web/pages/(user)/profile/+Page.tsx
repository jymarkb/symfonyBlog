import { RequireAuth } from "@/features/auth/guards";
import { AppShell } from "@/layouts/AppShell";

export default function Page() {
  return (
    <RequireAuth>
      <AppShell>
        <h1>Profile</h1>
      </AppShell>
    </RequireAuth>
  );
}
