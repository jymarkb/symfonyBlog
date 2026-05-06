import { RequireAdmin } from "@/features/auth/guards";
import { DashboardShell } from "@/layouts/DashboardShell";

export default function Page() {
  return (
    <RequireAdmin>
      <DashboardShell>
        <h1>Dashboard Post page</h1>
      </DashboardShell>
    </RequireAdmin>
  );
}
