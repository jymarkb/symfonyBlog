import type { ReactNode } from "react";

import { Header } from "@/components/layout/Header/Header";
import { useThemeMode } from "@/lib/theme/useThemeMode";
import "@/styles/global.css";

type AuthShellProps = {
  children: ReactNode;
  side: ReactNode;
  sidePlacement?: "start" | "end";
};

export function AuthShell({
  children,
  side,
  sidePlacement = "end",
}: AuthShellProps) {
  const { themeMode, toggleThemeMode } = useThemeMode();
  const sidePanel = <aside className="auth-side">{side}</aside>;
  const formPanel = (
    <div className="auth-form-wrap">
      <div className="auth-form">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header themeMode={themeMode} onToggleThemeMode={toggleThemeMode} />
      <div className="auth-shell">
        {sidePlacement === "start" ? sidePanel : null}
        {formPanel}
        {sidePlacement === "end" ? sidePanel : null}
      </div>
    </div>
  );
}
