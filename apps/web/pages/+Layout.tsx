import type { ReactNode } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MaintenancePage } from "@/components/common/MaintenancePage";
import { CurrentSessionProvider } from "@/features/auth/session/CurrentSessionContext";
import { ThemeModeProvider } from "@/lib/theme/ThemeModeContext";
import "@/styles/global.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeModeProvider>
        {import.meta.env.VITE_MAINTENANCE_MODE === "true" ? (
          <MaintenancePage />
        ) : (
          <CurrentSessionProvider>{children}</CurrentSessionProvider>
        )}
      </ThemeModeProvider>
    </ErrorBoundary>
  );
}
