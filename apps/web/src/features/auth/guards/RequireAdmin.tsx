import type { ReactNode } from "react";

import { AuthGuard } from "@/features/auth/guards/AuthGuard";

export function RequireAdmin({ children }: { children: ReactNode }) {
  return <AuthGuard requireAdmin>{children}</AuthGuard>;
}
