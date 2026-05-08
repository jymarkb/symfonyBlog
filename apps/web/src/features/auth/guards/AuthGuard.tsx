import type { ReactNode } from "react";
import { useEffect } from "react";

import { useCurrentSession } from "@/features/auth/session";

// @deprecated — replaced by +guard.ts server-side hooks. Kept as fallback for admin routes and client navigation.

type AuthGuardProps = {
  children: ReactNode;
  requireAdmin?: boolean;
  guestRedirectTo?: string;
  forbiddenRedirectTo?: string;
};

export function AuthGuard({
  children,
  requireAdmin = false,
  guestRedirectTo = "/signin",
  forbiddenRedirectTo = "/profile",
}: AuthGuardProps) {
  const { status, isLoading, isAuthenticated, isAdmin, refreshSession } =
    useCurrentSession();

  const isForbidden = isAuthenticated && requireAdmin && !isAdmin;

  useEffect(() => {
    if (isLoading || status === "error") return;

    if (!isAuthenticated) {
      window.location.replace(guestRedirectTo);
      return;
    }

    if (isForbidden) {
      window.location.replace(forbiddenRedirectTo);
    }
  }, [
    forbiddenRedirectTo,
    guestRedirectTo,
    isAuthenticated,
    isForbidden,
    isLoading,
    status,
  ]);

  if (isLoading) {
    return (
      <div className="shell py-12">
        <p className="text-ink-4">Checking your session...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="shell py-12">
        <h1>Session unavailable</h1>
        <p className="text-ink-4">Unable to load your session. Please try again.</p>
        <button
          className="btn btn-primary"
          onClick={() => void refreshSession()}
          type="button"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!isAuthenticated || isForbidden) {
    return (
      <div className="shell py-12">
        <p className="text-ink-4">Redirecting...</p>
      </div>
    );
  }

  return children;
}
