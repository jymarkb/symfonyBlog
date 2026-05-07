import type { ReactNode } from "react";

import { Header } from "@/components/layout/Header/Header";

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
  const sidePanel = <aside className="auth-side">{side}</aside>;
  const formPanel = (
    <div className="auth-form-wrap">
      <div className="auth-form">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />
      <div className="auth-shell">
        {sidePlacement === "start" ? sidePanel : null}
        {formPanel}
        {sidePlacement === "end" ? sidePanel : null}
      </div>
    </div>
  );
}
