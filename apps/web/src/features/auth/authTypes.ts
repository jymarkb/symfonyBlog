export type SignInFields = {
  email: string;
  password: string;
};

export type SignInErrors = Partial<SignInFields & { server: string }>;

export type SignUpFields = {
  displayName: string;
  handle: string;
  email: string;
  password: string;
  terms: boolean;
};

export type SignUpErrors = Partial<Record<keyof SignUpFields, string> & { server: string }>;

export type ForgotPasswordErrors = {
  email?: string;
  server?: string;
};

export type ResetPasswordFields = {
  password: string;
  confirmPassword: string;
};

export type ResetPasswordErrors = Partial<
  ResetPasswordFields & { server: string }
>;

export type CallbackStatus = "loading" | "error";

export type AuthGateTab = 'signin' | 'signup';
export type AuthGateStatus = 'idle' | 'submitting' | 'success';

export type AuthProviderButtonsProps = {
  compact?: boolean;
  disabled?: boolean;
  lastUsedProvider?: SocialAuthProvider | null;
  loadingProvider?: SocialAuthProvider | null;
  onProviderSelect?: (provider: SocialAuthProvider) => void;
}

export type SocialAuthProvider = 'github' | 'google';

export type SignInInput = {
  email: string;
  password: string;
};

export type SessionUser = {
  id: number;
  email: string;
  handle: string;
  display_name: string | null;
  created_at: string | null;
};

export type UserPermissions = {
  admin: boolean;
  comment: boolean;
  manage_posts?: boolean;
  manage_users?: boolean;
  manage_tags?: boolean;
  moderate_comments?: boolean;
  upload_media?: boolean;
  [key: string]: boolean | undefined;
};

export type CurrentSession = {
  user: SessionUser;
  permissions: UserPermissions;
};

export type CurrentSessionResponse = {
  data: CurrentSession;
};

export type CurrentSessionStatus =
  | "loading"
  | "guest"
  | "authenticated"
  | "error";

export type ExperimentVariant = 'modal' | 'redirect';
export type ExperimentEvent = 'triggered' | 'converted' | 'dismissed';
export interface TrackExperimentPayload {
  experiment: string;
  variant: ExperimentVariant;
  event: ExperimentEvent;
}

export interface ExperimentVariantReport {
  variant: string;
  triggered: number;
  converted: number;
  dismissed: number;
  conversion_rate: number;
}

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
