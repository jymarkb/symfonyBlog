import type { ReactNode } from "react";

import { MaintenancePage } from "@/components/common/MaintenancePage";
import { CurrentSessionProvider } from "@/features/auth/session/CurrentSessionContext";
import { ThemeModeProvider } from "@/lib/theme/ThemeModeContext";
import "@/styles/global.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ThemeModeProvider>
      {import.meta.env.VITE_MAINTENANCE_MODE === "true" ? (
        <MaintenancePage />
      ) : (
        <CurrentSessionProvider>{children}</CurrentSessionProvider>
      )}
    </ThemeModeProvider>
  );
}
