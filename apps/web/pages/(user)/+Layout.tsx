import type { ReactNode } from "react";

import { AppShell } from "@/layouts/AppShell";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
