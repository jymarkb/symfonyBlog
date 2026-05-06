import type { ReactNode } from "react";

import { RequireAuth } from "@/features/auth/guards";
import { AppShell } from "@/layouts/AppShell";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <RequireAuth>{children}</RequireAuth>
    </AppShell>
  );
}
