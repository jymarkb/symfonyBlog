import type { SyntheticEvent } from "react";
import { useState } from "react";

import type {
  SignUpErrors,
  SignUpFields,
  SocialAuthProvider,
} from "@/features/auth/authTypes";
import { AuthFooterLinks } from "@/features/auth/components/AuthFooterLinks";
import { AuthProviderButtons } from "@/features/auth/components/AuthProviderButtons";
import {
  passwordStrength,
  strengthLabel,
  validateDisplayName,
  validateEmail,
  validateHandle,
  validateNewPassword,
} from "@/features/auth/lib/validation";
import {
  formatAuthProvider,
  getLastAuthProvider,
} from "@/features/auth/lib/lastAuthProvider";
import {
  registerWithEmail,
  startSocialAuth,
} from "@/features/auth/api/registerApi";
import { SignUpIntro } from "@/features/auth/components/SignUpIntro";

export function SignUpForm() {
  const [fields, setFields] = useState<SignUpFields>({
    displayName: "",
    handle: "",
    email: "",
    password: "",
    terms: false,
  });
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [socialSubmitting, setSocialSubmitting] =
    useState<SocialAuthProvider | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null,
  );
  const [lastUsedProvider] = useState<SocialAuthProvider | null>(
    getLastAuthProvider,
  );

  const strength = passwordStrength(fields.password);

  function setField<K extends keyof SignUpFields>(
    field: K,
    value: SignUpFields[K],
  ) {
    setFields((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): SignUpErrors {
    return {
      displayName: validateDisplayName(fields.displayName) ?? undefined,
      handle: validateHandle(fields.handle) ?? undefined,
      email: validateEmail(fields.email) ?? undefined,
      password: validateNewPassword(fields.password) ?? undefined,
      terms: !fields.terms
        ? "You must accept the guidelines to continue."
        : undefined,
    };
  }

  function getPendingSignupMessage() {
    if (lastUsedProvider) {
      return `Almost there. A confirmation email may have been sent. If you do not see one, continue with ${formatAuthProvider(lastUsedProvider)}, your last used sign-in method.`;
    }

    return "Almost there. A confirmation email may have been sent, open it to finish creating your account.";
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
        setConfirmationMessage(getPendingSignupMessage());
        setFields({
          displayName: "",
          handle: "",
          email: "",
          password: "",
          terms: false,
        });
        return;
      }

      window.location.replace("/");
    } catch (error) {
      setErrors({
        server:
          error instanceof Error ? error.message : "Unable to create account.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSocialRegister(provider: SocialAuthProvider) {
    setSocialSubmitting(provider);
    setErrors({});

    try {
      await startSocialAuth(provider);
    } catch (error) {
      setErrors({
        server:
          error instanceof Error
            ? error.message
            : "Unable to start social registration.",
      });
      setSocialSubmitting(null);
    }
  }

  if (confirmationMessage) {
    return (
      <>
        <div className="auth-confirm">
          <div aria-hidden="true" className="auth-confirm-mark">
            OK
          </div>

          <div className="eyebrow mb-4">Email confirmation</div>

          <h1>
            Check your <em>email</em>.
          </h1>

          <p className="lede">{confirmationMessage}</p>

          {errors.server && <div className="form-alert">{errors.server}</div>}

          <div className="callback-actions">
            {lastUsedProvider ? (
              <button
                className="btn btn-primary"
                disabled={socialSubmitting !== null}
                onClick={() => handleSocialRegister(lastUsedProvider)}
                type="button"
              >
                {socialSubmitting === lastUsedProvider
                  ? `Opening ${formatAuthProvider(lastUsedProvider)}...`
                  : `Continue with ${formatAuthProvider(lastUsedProvider)}`}
              </button>
            ) : (
              <a className="btn btn-primary" href="/signin">
                Back to sign in
              </a>
            )}

            <button
              className="btn btn-ghost"
              onClick={() => {
                setConfirmationMessage(null);
                setErrors({});
              }}
              type="button"
            >
              Try another email
            </button>
          </div>
        </div>

        <AuthFooterLinks label="No tracking pixels · no third-party scripts" />
      </>
    );
  }

  return (
    <>
      <SignUpIntro />

      <AuthProviderButtons
        compact
        disabled={submitting || socialSubmitting !== null}
        lastUsedProvider={lastUsedProvider}
        loadingProvider={socialSubmitting}
        onProviderSelect={handleSocialRegister}
      />

      <div className="divider">or with email</div>

      {errors.server && <div className="form-alert">{errors.server}</div>}

      <form noValidate onSubmit={handleSubmit}>
        <div className="row-2">
          <div className="field">
            <label htmlFor="signup-display-name">Display name</label>
            <input
              autoComplete="name"
              className={errors.displayName ? "is-error" : ""}
              id="signup-display-name"
              onChange={(e) => setField("displayName", e.target.value)}
              placeholder="Hannah"
              type="text"
              value={fields.displayName}
            />
            {errors.displayName && (
              <span className="field-error">{errors.displayName}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="signup-handle">Handle</label>
            <input
              autoComplete="username"
              className={errors.handle ? "is-error" : ""}
              id="signup-handle"
              onChange={(e) => setField("handle", e.target.value)}
              placeholder="@hannah_d"
              type="text"
              value={fields.handle}
            />
            {errors.handle && (
              <span className="field-error">{errors.handle}</span>
            )}
          </div>
        </div>

        <div className="field">
          <label htmlFor="signup-email">Email</label>
          <input
            autoComplete="email"
            className={errors.email ? "is-error" : ""}
            id="signup-email"
            onChange={(e) => setField("email", e.target.value)}
            placeholder="you@somewhere.com"
            type="email"
            value={fields.email}
          />
          <span className="hint">
            Used only for confirmation + reply notifications.
          </span>
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="field">
          <label htmlFor="signup-password">Password</label>
          <input
            autoComplete="new-password"
            className={errors.password ? "is-error" : ""}
            id="signup-password"
            onChange={(e) => setField("password", e.target.value)}
            placeholder="At least 12 characters"
            type="password"
            value={fields.password}
          />
          {fields.password && (
            <>
              <div aria-hidden="true" className={`strength s-${strength}`}>
                <i />
                <i />
                <i />
                <i />
              </div>
              <span className="hint">
                Strength: {strengthLabel(strength)}.
                {strength < 3 ? " Try a passphrase." : " Nice."}
              </span>
            </>
          )}
          {errors.password && (
            <span className="field-error">{errors.password}</span>
          )}
        </div>

        <label className="check-row">
          <input
            checked={fields.terms}
            onChange={(e) => setField("terms", e.target.checked)}
            type="checkbox"
          />
          <span>
            I've read and accept the <a href="#">community guidelines</a> and{" "}
            <a href="#">privacy notice</a>. Be kind in the comments — that's the
            whole policy.
          </span>
        </label>
        {errors.terms && <span className="field-error">{errors.terms}</span>}

        <label className="check-row">
          <input type="checkbox" />
          <span>
            Also subscribe me to new essays via email (you can also do this on
            the <a href="/subscribe">subscribe page</a>).
          </span>
        </label>

        <button
          className="btn btn-primary submit-btn"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Creating account…" : "Create account →"}
        </button>
      </form>

      <div className="alt-row">
        Already have one?{" "}
        <a className="link" href="/signin">
          Sign in
        </a>
      </div>

      <AuthFooterLinks label="No tracking pixels · no third-party scripts" />
    </>
  );
}
