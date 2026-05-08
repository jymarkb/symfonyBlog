import type { ReactNode } from "react";

import { RequireAdmin } from "@/features/auth/guards";
import { DashboardShell } from "@/layouts/DashboardShell";

// Server-side security is enforced by pages/(admin)/+config.ts (accessLevel: 'admin-required')
// and the global pages/+guard.ts hook. RequireAdmin here is a client-side fallback
// for graceful handling during hydration and client-side navigation.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAdmin>
      <DashboardShell>{children}</DashboardShell>
    </RequireAdmin>
  );
}
