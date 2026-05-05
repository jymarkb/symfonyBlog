import type { SocialAuthProvider } from "@/features/auth/authTypes";

const lastAuthProviderKey = "last-auth-provider";
const pendingAuthProviderKey = "pending-auth-provider";

const providerLabels: Record<SocialAuthProvider, string> = {
  github: "GitHub",
  google: "Google",
};

export function getLastAuthProvider(): SocialAuthProvider | null {
  if (typeof window === "undefined") return null;

  const storedProvider = window.localStorage.getItem(lastAuthProviderKey);

  return storedProvider === "github" || storedProvider === "google"
    ? storedProvider
    : null;
}

export function setLastAuthProvider(provider: SocialAuthProvider): void {
  window.localStorage.setItem(lastAuthProviderKey, provider);
}

export function getPendingAuthProvider(): SocialAuthProvider | null {
  if (typeof window === "undefined") return null;

  const storedProvider = window.sessionStorage.getItem(pendingAuthProviderKey);

  return storedProvider === "github" || storedProvider === "google"
    ? storedProvider
    : null;
}

export function setPendingAuthProvider(provider: SocialAuthProvider): void {
  window.sessionStorage.setItem(pendingAuthProviderKey, provider);
}

export function clearPendingAuthProvider(): void {
  window.sessionStorage.removeItem(pendingAuthProviderKey);
}

export function formatAuthProvider(provider: SocialAuthProvider): string {
  return providerLabels[provider];
}
