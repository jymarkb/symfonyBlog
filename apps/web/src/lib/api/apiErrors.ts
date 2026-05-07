import { ApiError } from "@/lib/api/apiClient";

export const RATE_LIMIT_MESSAGE = "Too many requests. Please wait a moment and try again.";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.status === 429) return RATE_LIMIT_MESSAGE;
  return fallback;
}
