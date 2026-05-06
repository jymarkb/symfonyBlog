import { useContext } from "react";

import { CurrentSessionContext } from "@/features/auth/session/CurrentSessionContext";

export function useCurrentSession() {
  const context = useContext(CurrentSessionContext);

  if (!context) {
    throw new Error("useCurrentSession must be used within CurrentSessionProvider.");
  }

  return context;
}
