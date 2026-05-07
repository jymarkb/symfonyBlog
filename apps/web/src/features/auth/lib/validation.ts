const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HANDLE_RE = /^@[a-z0-9_]{2,19}$/;

export function validateEmail(value: string): string | null {
  if (!value.trim()) return 'Email is required.';
  if (!EMAIL_RE.test(value.trim())) return 'Enter a valid email address.';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Password is required.';
  return null;
}

export function validateNewPassword(value: string): string | null {
  if (!value) return 'Password is required.';
  if (value.length < 12) return 'Password must be at least 12 characters.';
  if (value.length > 72) return 'Password must be 72 characters or fewer.';
  return null;
}

export function validateDisplayName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Display name is required.';
  if (trimmed.length < 2) return 'At least 2 characters.';
  if (trimmed.length > 50) return 'Max 50 characters.';
  return null;
}

export function validateHandle(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Handle is required.';
  const normalized = trimmed.toLowerCase();
  const v = normalized.startsWith('@') ? normalized : `@${normalized}`;
  if (!HANDLE_RE.test(v)) return 'Use 2–19 lowercase letters, numbers, or underscores.';
  return null;
}

export function passwordStrength(value: string): 0 | 1 | 2 | 3 | 4 {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 12) score++;
  if (value.length >= 16) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^a-zA-Z0-9]/.test(value)) score++;
  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
}

const STRENGTH_LABEL: Record<number, string> = {
  0: '',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
};

export function strengthLabel(score: number): string {
  return STRENGTH_LABEL[score] ?? '';
}
