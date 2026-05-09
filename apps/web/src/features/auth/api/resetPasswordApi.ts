import { ApiError } from "@/lib/api/apiClient";
import { supabase } from "@/lib/auth/supabaseClient";

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    if (error.status === 429) {
      throw new ApiError("Rate limited.", 429);
    }
    throw new Error("Unable to send reset link. Please try again.");
  }
}

export async function startPasswordRecoverySession() {
  const url = new URL(window.location.href);
  const authCode = url.searchParams.get("code");
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const hashAccessToken = hashParams.get("access_token");
  const hashRefreshToken = hashParams.get("refresh_token");

  window.history.replaceState({}, document.title, "/reset-password");

  if (!authCode && !(hashAccessToken && hashRefreshToken)) {
    throw new Error("This reset link is invalid or has expired. Please request a new one.");
  }

  if (authCode) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);
    if (error || !data.session?.access_token) {
      throw new Error("This reset link has expired or was already used.");
    }
  } else if (hashAccessToken && hashRefreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: hashAccessToken,
      refresh_token: hashRefreshToken,
    });
    if (error || !data.session?.access_token) {
      throw new Error("This reset link has expired or was already used.");
    }
  }
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    if (error.status === 429) {
      throw new ApiError("Rate limited.", 429);
    }
    console.error('Password update failed:', error.code ?? error.message);
    throw new Error(getPasswordUpdateErrorMessage(error));
  }
}

export async function signOutAfterPasswordUpdate() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign-out after password update failed:', error.code ?? error.message);
    throw new Error("Sign-out failed after password update.");
  }
}

function getPasswordUpdateErrorMessage(error: { code?: string; message?: string }) {
  if (error.code === "same_password") {
    return "Choose a password you have not used for this account before.";
  }

  if (error.message?.toLowerCase().includes("same password")) {
    return "Choose a password you have not used for this account before.";
  }

  return "Unable to update password. Please try again.";
}
