import type { ReactNode } from "react";

import { AuthGuard } from "@/features/auth/guards/AuthGuard";

// @deprecated — replaced by +guard.ts server-side hooks. Kept as fallback for admin routes and client navigation.

export function RequireAuth({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
