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

export type CallbackStatus = "loading" | "error";

export type AuthProviderButtonsProps = {
  compact?: boolean;
  disabled?: boolean;
  lastUsedProvider?: SocialAuthProvider | null;
  loadingProvider?: SocialAuthProvider | null;
  onProviderSelect?: (provider: SocialAuthProvider) => void;
}

export type SocialAuthProvider = 'github' | 'google';
