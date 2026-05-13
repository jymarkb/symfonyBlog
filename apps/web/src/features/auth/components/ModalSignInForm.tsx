import type { ChangeEvent, SyntheticEvent } from "react";
import { useState } from "react";

import type { SignInErrors, SignInFields, SocialAuthProvider } from "@/features/auth/authTypes";
import { AuthProviderButtons } from "@/features/auth/components/AuthProviderButtons";
import { signInWithEmail } from "@/features/auth/api/signInApi";
import { startSocialAuth } from "@/features/auth/api/registerApi";
import { validateEmail, validatePassword } from "@/features/auth/lib/validation";
import { getLastAuthProvider } from "@/features/auth/lib/lastAuthProvider";
import { setAuthReturnTo } from "@/features/auth/lib/authReturnTo";
import { logError } from "@/lib/utils/logError";

type Props = {
  onSuccess: () => void;
  onSwitchToSignUp?: () => void;
};

const INVALID_CREDENTIALS_MSG = "Invalid login credentials";

export function ModalSignInForm({ onSuccess, onSwitchToSignUp }: Props) {
  const [fields, setFields] = useState<SignInFields>({ email: "", password: "" });
  const [errors, setErrors] = useState<SignInErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [socialSubmitting, setSocialSubmitting] = useState<SocialAuthProvider | null>(null);
  const [lastUsedProvider] = useState<SocialAuthProvider | null>(getLastAuthProvider);

  const isDisabled = submitting || socialSubmitting !== null;

  function set(field: keyof SignInFields) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setFields((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function validate(): SignInErrors {
    return {
      email: validateEmail(fields.email) ?? undefined,
      password: validatePassword(fields.password) ?? undefined,
    };
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (errs.email || errs.password) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await signInWithEmail({ email: fields.email, password: fields.password });
      onSuccess();
    } catch (error) {
      logError(error);
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes(INVALID_CREDENTIALS_MSG) || msg.toLowerCase().includes("email not found")) {
        onSwitchToSignUp?.();
        return;
      }
      setErrors({ server: "We couldn't sign you in. Please check your email and password." });
      setSubmitting(false);
    }
  }

  async function handleSocialSignIn(provider: SocialAuthProvider) {
    setSocialSubmitting(provider);
    setErrors({});
    try {
      setAuthReturnTo(window.location.pathname);
      await startSocialAuth(provider);
    } catch (error) {
      logError(error);
      setErrors({ server: "We were unable to sign in with the selected provider. Please try again." });
      setSocialSubmitting(null);
    }
  }

  return (
    <div className="modal-body">
      <AuthProviderButtons
        disabled={isDisabled}
        lastUsedProvider={lastUsedProvider}
        loadingProvider={socialSubmitting}
        onProviderSelect={handleSocialSignIn}
      />

      <div className="divider">or with email</div>

      {errors.server && (
        <div className="auth-gate-error-banner" role="alert">
          <span className="auth-gate-err-icon" aria-hidden="true">⚠</span>
          <span>{errors.server}</span>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="mg-signin-email">Email</label>
          <input
            aria-describedby={errors.email ? "mg-signin-email-error" : undefined}
            aria-invalid={errors.email ? true : undefined}
            autoComplete="email"
            className={errors.email ? "is-error" : ""}
            disabled={isDisabled}
            id="mg-signin-email"
            onChange={set("email")}
            placeholder="you@example.com"
            type="email"
            value={fields.email}
          />
          {errors.email && (
            <span className="field-error" id="mg-signin-email-error">{errors.email}</span>
          )}
        </div>

        <div className="field">
          <label htmlFor="mg-signin-password">
            Password{" "}
            <a href="/forgot-password" target="_blank" rel="noreferrer" className="link">
              Forgot?
            </a>
          </label>
          <input
            aria-describedby={errors.password ? "mg-signin-password-error" : undefined}
            aria-invalid={errors.password ? true : undefined}
            autoComplete="current-password"
            className={errors.password ? "is-error" : ""}
            disabled={isDisabled}
            id="mg-signin-password"
            onChange={set("password")}
            placeholder="••••••••"
            type="password"
            value={fields.password}
          />
          {errors.password && (
            <span className="field-error" id="mg-signin-password-error">{errors.password}</span>
          )}
        </div>

        <button
          className="btn btn-primary submit-btn"
          disabled={isDisabled}
          type="submit"
        >
          {submitting ? "Signing in…" : "Sign in →"}
        </button>
      </form>

      <div className="modal-alt-row">
        New here?{" "}
        <button
          className="link-btn"
          disabled={isDisabled}
          onClick={() => onSwitchToSignUp?.()}
          type="button"
        >
          Create an account
        </button>
      </div>
    </div>
  );
}
