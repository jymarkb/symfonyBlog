import type {
  CurrentSession,
  SessionUser,
  UserPermissions,
} from "@/features/auth/authTypes";

export type CurrentSessionStatus =
  | "loading"
  | "guest"
  | "authenticated"
  | "error";

export type CurrentSessionContextValue = {
  status: CurrentSessionStatus;
  currentSession: CurrentSession | null;
  user: SessionUser | null;
  permissions: UserPermissions | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: string | null;
  refreshSession: () => Promise<CurrentSession | null>;
  signOut: () => Promise<void>;
};
