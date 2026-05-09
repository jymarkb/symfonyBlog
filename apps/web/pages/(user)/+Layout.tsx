import type { ReactNode } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppShell } from "@/layouts/AppShell";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <AppShell>
        {children}
      </AppShell>
    </ErrorBoundary>
  );
}
