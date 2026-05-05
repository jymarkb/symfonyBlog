import { fetchCurrentUser } from "@/features/auth/api/currentUserApi";
import { supabase } from "@/lib/auth/supabaseClient";
import type { SignInInput } from "@/features/auth/authTypes";

export async function signInWithEmail(params: SignInInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  });

  if (error) {
    throw new Error("We couldn't sign you in with those details.");
  }

  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error("No sign-in session was created. Please try again.");
  }

  return fetchCurrentUser(accessToken);
}

export async function getSignedInUser() {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    return null;
  }

  return fetchCurrentUser(data.session.access_token);
}
