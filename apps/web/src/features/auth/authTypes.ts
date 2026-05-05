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
