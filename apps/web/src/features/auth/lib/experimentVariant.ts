import type { ExperimentVariant } from '@/features/auth/authTypes';

const COOKIE_NAME = 'auth_gate_variant';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function readVariantCookie(): ExperimentVariant | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  const value = match?.[1];
  return value === 'modal' || value === 'redirect' ? value : null;
}

export function getOrAssignVariant(): ExperimentVariant {
  const existing = readVariantCookie();
  if (existing) return existing;
  const variant: ExperimentVariant = Math.random() < 0.5 ? 'modal' : 'redirect';
  document.cookie = `${COOKIE_NAME}=${variant}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
  return variant;
}
