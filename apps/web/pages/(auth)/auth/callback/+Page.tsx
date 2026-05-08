import { useEffect, useRef, useState } from "react";

import { fetchCurrentUser } from "@/features/auth/api/currentUserApi";
import { AuthShell } from "@/layouts/AuthShell";
import { supabase } from "@/lib/auth/supabaseClient";
import type { CallbackStatus, SocialAuthProvider } from "@/features/auth/authTypes";
import {
  clearPendingAuthProvider,
  getPendingAuthProvider,
  setLastAuthProvider,
} from "@/features/auth/lib/lastAuthProvider";

export default function Page() {
  const hasStarted = useRef(false);
  const [isSilent, setIsSilent] = useState(true);
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState("Confirming your account and opening your session.");

  function showError(nextMessage: string) {
    setIsSilent(false);
    setStatus("error");
    setMessage(nextMessage);
  }

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    async function finishAuth() {
      const url = new URL(window.location.href);
      const authCode = url.searchParams.get("code");
      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, ""),
      );
      const hashAccessToken = hashParams.get("access_token");
      const hashRefreshToken = hashParams.get("refresh_token");
      const pendingProvider = getPendingAuthProvider();
      const shouldShowCallbackUi = !authCode && !pendingProvider;

      window.history.replaceState({}, document.title, "/auth/callback");

      if (shouldShowCallbackUi) {
        setIsSilent(false);
      }

      if (authCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(authCode);

        if (error) {
          console.error(error);
          clearPendingAuthProvider();
          showError("We were unable to sign you in. Please try again.");
          return;
        }
      } else if (hashAccessToken && hashRefreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: hashAccessToken,
          refresh_token: hashRefreshToken,
        });

        if (error) {
          console.error(error);
          clearPendingAuthProvider();
          showError("We were unable to sign you in. Please try again.");
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
        clearPendingAuthProvider();
        showError("We were unable to sign you in. Please try again.");
        return;
      }

      if (!data.session?.access_token) {
        clearPendingAuthProvider();
        showError("No auth session was found. Please sign in again.");
        return;
      }

      const currentUser = await fetchCurrentUser(data.session.access_token);
      const provider = pendingProvider ?? data.session.user.app_metadata.provider;

      if (provider === "github" || provider === "google") {
        setLastAuthProvider(provider as SocialAuthProvider);
      }

      clearPendingAuthProvider();

      if (currentUser.permissions.admin) {
        window.location.replace("/dashboard");
        return;
      }

      window.location.replace("/");
    }

    finishAuth().catch(() => {
      clearPendingAuthProvider();
      showError(
        "Unable to connect this session to the API. Please sign in again.",
      );
    });
  }, []);

  if (isSilent && status === "loading") {
    return null;
  }

  return (
    <AuthShell side={<CallbackSidePanel />} sidePlacement="start">
      <div className="auth-callback" aria-live="polite" aria-atomic="true">
        <div
          aria-hidden="true"
          className={status === "loading" ? "callback-mark is-loading" : "callback-mark is-error"}
        >
          {status === "loading" ? "" : "!"}
        </div>

        <div className="eyebrow mb-4">
          {status === "loading" ? "Account confirmation" : "Session check"}
        </div>

        <h1>
          {status === "loading" ? (
            <>
              Finishing <em>sign in</em>.
            </>
          ) : (
            <>
              Could not finish <em>sign in</em>.
            </>
          )}
        </h1>

        <p className="lede">{message}</p>

        {status === "error" ? (
          <div className="callback-actions">
            <a className="btn btn-primary" href="/signin">
              Back to sign in
            </a>
            <a className="btn btn-ghost" href="/signup">
              Create account
            </a>
          </div>
        ) : (
          <div className="callback-progress" aria-label="Loading">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
    </AuthShell>
  );
}

function CallbackSidePanel() {
  return (
    <>
      <div className="brand">
        <span className="brand-mark">j</span>
        <span>
          jymb<span className="brand-dot">.</span>blog
        </span>
      </div>

      <div className="side-reset">
        <h2>
          One last <em>check</em>.
        </h2>
        <p>
          We are confirming the Supabase session, syncing your local blog
          profile, and then sending you to the right place.
        </p>
        <div className="side-steps">
          <div className="side-step">
            <span className="num">01</span>
            <span>Confirm the token from your email link.</span>
          </div>
          <div className="side-step">
            <span className="num">02</span>
            <span>Resolve your local Laravel profile.</span>
          </div>
          <div className="side-step">
            <span className="num">03</span>
            <span>Open your account or dashboard.</span>
          </div>
        </div>
      </div>

      <div className="side-meta">
        <span>Secure callback</span>
        <span>Supabase + Laravel</span>
      </div>
    </>
  );
}
