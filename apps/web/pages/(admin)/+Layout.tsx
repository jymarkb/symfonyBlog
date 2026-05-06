import type { ReactNode } from "react";

import { RequireAdmin } from "@/features/auth/guards";
import { DashboardShell } from "@/layouts/DashboardShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAdmin>
      <DashboardShell>{children}</DashboardShell>
    </RequireAdmin>
  );
}
