import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { useThemeMode } from "@/lib/theme/useThemeMode";
import "@/styles/global.css";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { themeMode, toggleThemeMode } = useThemeMode();

  return (
    <>
      <Header themeMode={themeMode} onToggleThemeMode={toggleThemeMode} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
