import { ApiError } from "@/lib/api/apiClient";
import { fetchCurrentUser } from "@/features/auth/api/currentUserApi";
import { supabase } from "@/lib/auth/supabaseClient";
import type { SignInInput } from "@/features/auth/authTypes";

export async function signInWithEmail(params: SignInInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });

  if (error) {
    if ((error as { status?: number }).status === 429) {
      throw new ApiError("Rate limited.", 429);
    }
    throw new Error("We couldn't sign you in with those details.");
  }

  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error("No sign-in session was created. Please try again.");
  }

  return fetchCurrentUser(accessToken);
}

