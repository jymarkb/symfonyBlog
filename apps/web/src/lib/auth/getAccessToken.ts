import { supabase } from "@/lib/auth/supabaseClient";

export async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    window.location.replace("/signin");
    throw new Error("Session expired.");
  }

  return data.session.access_token;
}

// Soft check — returns the token if a valid Supabase session exists, null otherwise.
// Does NOT redirect. Use this when you need to probe auth state without the React
// context (isAuthenticated lags behind getSession because it waits for fetchCurrentUser).
export async function tryGetAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

// Returns the active Supabase token without redirecting, or null if none.
// Swallows network errors so callers can treat them as "unauthenticated".
export async function probeAccessToken(): Promise<string | null> {
  try {
    return await tryGetAccessToken();
  } catch {
    return null;
  }
}
