import type { ReactNode } from "react";
import { useEffect } from "react";

import { useCurrentSession } from "@/features/auth/session";

export function RequireGuest({ children }: { children: ReactNode }) {
  const { isAdmin, isAuthenticated, isLoading } = useCurrentSession();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    window.location.replace(isAdmin ? "/dashboard" : "/");
  }, [isAdmin, isAuthenticated, isLoading]);

  if (isLoading || isAuthenticated) return null;

  return children;
}
