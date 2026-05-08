import { supabase } from "@/lib/auth/supabaseClient";

export async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    window.location.replace("/signin");
    throw new Error("Session expired.");
  }

  return data.session.access_token;
}
