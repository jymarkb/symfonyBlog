import { supabase } from "@/lib/auth/supabaseClient";

export async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    throw new Error("Your session could not be loaded. Please sign in again.");
  }

  return data.session.access_token;
}
