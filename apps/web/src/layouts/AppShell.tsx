import type { ReactNode } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <Header />
      <ErrorBoundary>
        <main>{children}</main>
      </ErrorBoundary>
      <Footer />
    </>
  );
}
