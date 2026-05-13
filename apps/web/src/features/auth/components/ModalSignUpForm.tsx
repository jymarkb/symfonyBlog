import type { SyntheticEvent } from "react";
import { useState } from "react";

import type { SignUpErrors, SignUpFields, SocialAuthProvider } from "@/features/auth/authTypes";
import { AuthProviderButtons } from "@/features/auth/components/AuthProviderButtons";
import { PasswordStrengthHint } from "@/components/common/PasswordStrengthHint";
import {
  passwordStrength,
  validateDisplayName,
  validateEmail,
  validateHandle,
  validateNewPassword,
} from "@/features/auth/lib/validation";
import { formatAuthProvider, getLastAuthProvider } from "@/features/auth/lib/lastAuthProvider";
import { setAuthReturnTo } from "@/features/auth/lib/authReturnTo";
import { registerWithEmail, startSocialAuth } from "@/features/auth/api/registerApi";

type Props = {
  onSuccess: () => void;
  onSwitchToSignIn?: () => void;
};

export function ModalSignUpForm({ onSuccess, onSwitchToSignIn }: Props) {
  const [fields, setFields] = useState<SignUpFields>({
    displayName: "",
    handle: "",
    email: "",
    password: "",
    terms: false,
  });
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [socialSubmitting, setSocialSubmitting] = useState<SocialAuthProvider | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);
  const [lastUsedProvider] = useState<SocialAuthProvider | null>(getLastAuthProvider);

  const isDisabled = submitting || socialSubmitting !== null;
  const strength = passwordStrength(fields.password);

  function setField<K extends keyof SignUpFields>(field: K, value: SignUpFields[K]) {
    setFields((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): SignUpErrors {
    return {
      displayName: validateDisplayName(fields.displayName) ?? undefined,
      handle: validateHandle(fields.handle) ?? undefined,
      email: validateEmail(fields.email) ?? undefined,
      password: validateNewPassword(fields.password) ?? undefined,
      terms: !fields.terms ? "You must accept the guidelines to continue." : undefined,
    };
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.values(errs).some(Boolean)) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const result = await registerWithEmail({
        displayName: fields.displayName,
        handle: fields.handle,
        email: fields.email,
        password: fields.password,
      });

      if (result.needsEmailConfirmation || !result.currentUser) {
        setConfirmMessage(
          lastUsedProvider
            ? `Almost there. A confirmation email may have been sent. If you don't see one, continue with ${formatAuthProvider(lastUsedProvider)} — your last sign-in method.`
            : "Almost there. A confirmation email has been sent — open it to finish creating your account."
        );
        setFields({ displayName: "", handle: "", email: "", password: "", terms: false });
        return;
      }

      onSuccess();
    } catch {
      setErrors({ server: "We were unable to create your account. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSocialRegister(provider: SocialAuthProvider) {
    setSocialSubmitting(provider);
    setErrors({});
    try {
      setAuthReturnTo(window.location.pathname);
      await startSocialAuth(provider);
    } catch {
      setErrors({ server: "We were unable to create your account. Please try again." });
      setSocialSubmitting(null);
    }
  }

  if (confirmMessage) {
    return (
      <div className="auth-gate-confirm" role="status" aria-live="polite">
        <div className="auth-gate-confirm-icon" aria-hidden="true">✉</div>
        <p className="auth-gate-confirm-title">Check your email</p>
        <p className="auth-gate-confirm-text">{confirmMessage}</p>
        <div className="auth-gate-confirm-actions">
          {lastUsedProvider && (
            <button
              className="btn btn-primary"
              disabled={socialSubmitting !== null}
              onClick={() => void handleSocialRegister(lastUsedProvider)}
              type="button"
            >
              {socialSubmitting === lastUsedProvider
                ? `Opening ${formatAuthProvider(lastUsedProvider)}…`
                : `Continue with ${formatAuthProvider(lastUsedProvider)}`}
            </button>
          )}
          <button
            className="btn btn-ghost"
            onClick={() => { setConfirmMessage(null); setErrors({}); }}
            type="button"
          >
            Try another email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-body">
      <AuthProviderButtons
        compact
        disabled={isDisabled}
        lastUsedProvider={lastUsedProvider}
        loadingProvider={socialSubmitting}
        onProviderSelect={handleSocialRegister}
      />

      <div className="divider">or with email</div>

      {errors.server && (
        <div className="auth-gate-error-banner" role="alert">
          <span className="auth-gate-err-icon" aria-hidden="true">⚠</span>
          <span>{errors.server}</span>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit}>
        <div className="row-2">
          <div className="field">
            <label htmlFor="mg-signup-display-name">Display name</label>
            <input
              aria-describedby={errors.displayName ? "mg-signup-display-name-error" : undefined}
              aria-invalid={errors.displayName ? true : undefined}
              autoComplete="name"
              className={errors.displayName ? "is-error" : ""}
              disabled={isDisabled}
              id="mg-signup-display-name"
              onChange={(e) => setField("displayName", e.target.value)}
              placeholder="Hannah"
              type="text"
              value={fields.displayName}
            />
            {errors.displayName && (
              <span className="field-error" id="mg-signup-display-name-error">{errors.displayName}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="mg-signup-handle">Handle</label>
            <input
              aria-describedby={errors.handle ? "mg-signup-handle-error" : undefined}
              aria-invalid={errors.handle ? true : undefined}
              autoComplete="username"
              className={errors.handle ? "is-error" : ""}
              disabled={isDisabled}
              id="mg-signup-handle"
              onChange={(e) => setField("handle", e.target.value)}
              placeholder="@hannah"
              type="text"
              value={fields.handle}
            />
            {errors.handle && (
              <span className="field-error" id="mg-signup-handle-error">{errors.handle}</span>
            )}
          </div>
        </div>

        <div className="field">
          <label htmlFor="mg-signup-email">Email</label>
          <input
            aria-describedby={errors.email ? "mg-signup-email-error" : undefined}
            aria-invalid={errors.email ? true : undefined}
            autoComplete="email"
            className={errors.email ? "is-error" : ""}
            disabled={isDisabled}
            id="mg-signup-email"
            onChange={(e) => setField("email", e.target.value)}
            placeholder="you@example.com"
            type="email"
            value={fields.email}
          />
          {errors.email && (
            <span className="field-error" id="mg-signup-email-error">{errors.email}</span>
          )}
        </div>

        <div className="field">
          <label htmlFor="mg-signup-password">Password</label>
          <input
            aria-describedby={errors.password ? "mg-signup-password-error" : undefined}
            aria-invalid={errors.password ? true : undefined}
            autoComplete="new-password"
            className={errors.password ? "is-error" : ""}
            disabled={isDisabled}
            id="mg-signup-password"
            maxLength={72}
            onChange={(e) => setField("password", e.target.value)}
            placeholder="At least 12 characters"
            type="password"
            value={fields.password}
          />
          <PasswordStrengthHint password={fields.password} strength={strength} />
          {errors.password && (
            <span className="field-error" id="mg-signup-password-error">{errors.password}</span>
          )}
        </div>

        <label className="check-row">
          <input
            aria-describedby={errors.terms ? "mg-signup-terms-error" : undefined}
            aria-invalid={errors.terms ? true : undefined}
            checked={fields.terms}
            disabled={isDisabled}
            onChange={(e) => setField("terms", e.target.checked)}
            type="checkbox"
          />
          <span>
            I've read and accept the{" "}
            <a href="/terms" target="_blank" rel="noreferrer">community guidelines</a>{" "}
            and <a href="/privacy" target="_blank" rel="noreferrer">privacy notice</a>.
          </span>
        </label>
        {errors.terms && (
          <span className="field-error" id="mg-signup-terms-error">{errors.terms}</span>
        )}

        <button
          className="btn btn-primary submit-btn"
          disabled={isDisabled}
          type="submit"
        >
          {submitting ? "Creating account…" : "Create account →"}
        </button>
      </form>

      <div className="modal-alt-row">
        Already have one?{" "}
        <button
          className="link-btn"
          disabled={isDisabled}
          onClick={() => onSwitchToSignIn?.()}
          type="button"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
