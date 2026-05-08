import type { ReactNode } from "react";
import { useEffect } from "react";

import { useCurrentSession } from "@/features/auth/session";

// @deprecated — replaced by +guard.ts server-side hooks. Kept as fallback for admin routes and client navigation.

export function RequireGuest({ children }: { children: ReactNode }) {
  const { isAdmin, isAuthenticated, isLoading } = useCurrentSession();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    window.location.replace(isAdmin ? "/dashboard" : "/");
  }, [isAdmin, isAuthenticated, isLoading]);

  if (isLoading || isAuthenticated) return null;

  return children;
}
