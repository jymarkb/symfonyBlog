import type { ReactNode } from "react";

import { AuthGuard } from "@/features/auth/guards/AuthGuard";

export function RequireAuth({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
