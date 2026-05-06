import type { ReactNode } from "react";
import { useEffect } from "react";

import { useCurrentSession } from "@/features/auth/session";

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
  const { status, error, isLoading, isAuthenticated, isAdmin, refreshSession } =
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
        <p className="text-muted">Checking your session...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="shell py-12">
        <h1>Session unavailable</h1>
        <p className="text-muted">{error}</p>
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
        <p className="text-muted">Redirecting...</p>
      </div>
    );
  }

  return children;
}
