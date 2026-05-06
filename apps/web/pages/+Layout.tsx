import type { ReactNode } from "react";

import { MaintenancePage } from "@/components/MaintenancePage";
import { CurrentSessionProvider } from "@/features/auth/session/CurrentSessionContext";

export default function Layout({ children }: { children: ReactNode }) {
  if (import.meta.env.VITE_MAINTENANCE_MODE === "true") {
    return <MaintenancePage />;
  }

  return <CurrentSessionProvider>{children}</CurrentSessionProvider>;
}
