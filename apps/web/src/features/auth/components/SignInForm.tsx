import type { ChangeEvent, SyntheticEvent } from "react";
import { useState } from "react";

import type {
  SignInErrors,
  SignInFields,
  SocialAuthProvider,
} from "@/features/auth/authTypes";
import { AuthFooterLinks } from "@/features/auth/components/AuthFooterLinks";
import { AuthProviderButtons } from "@/features/auth/components/AuthProviderButtons";
import { startSocialAuth } from "@/features/auth/api/registerApi";
import { signInWithEmail } from "@/features/auth/api/signInApi";
import {
  validateEmail,
  validatePassword,
} from "@/features/auth/lib/validation";
import {
  getLastAuthProvider,
} from "@/features/auth/lib/lastAuthProvider";

export function SignInForm() {
  const [fields, setFields] = useState<SignInFields>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<SignInErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [socialSubmitting, setSocialSubmitting] =
    useState<SocialAuthProvider | null>(null);
  const [lastUsedProvider] = useState<SocialAuthProvider | null>(
    getLastAuthProvider,
  );

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
      const currentUser = await signInWithEmail({
        email: fields.email,
        password: fields.password,
      });

      if (currentUser.permissions.admin) {
        window.location.replace("/dashboard");
        return;
      }

      window.location.replace("/");
    } catch (error) {
      console.error(error);
      setErrors({
        server: "We couldn't sign you in. Please try again.",
      });
      setSubmitting(false);
    }
  }

  async function handleSocialSignIn(provider: SocialAuthProvider) {
    setSocialSubmitting(provider);
    setErrors({});

    try {
      await startSocialAuth(provider);
    } catch (error) {
      console.error(error);
      setErrors({
        server: "We were unable to sign in with the selected provider. Please try again.",
      });
      setSocialSubmitting(null);
    }
  }

  return (
    <>
      <AuthProviderButtons
        disabled={submitting || socialSubmitting !== null}
        lastUsedProvider={lastUsedProvider}
        loadingProvider={socialSubmitting}
        onProviderSelect={handleSocialSignIn}
      />

      <div className="divider">or with email</div>

      <div aria-live="polite" role="status" className="form-alert">
        {errors.server ?? ""}
      </div>

      <form noValidate onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="signin-email">Email</label>
          <input
            aria-describedby={errors.email ? "signin-email-error" : undefined}
            aria-invalid={!!errors.email}
            autoComplete="email"
            className={errors.email ? "is-error" : ""}
            id="signin-email"
            onChange={set("email")}
            placeholder="you@somewhere.com"
            type="email"
            value={fields.email}
          />
          {errors.email && <span className="field-error" id="signin-email-error">{errors.email}</span>}
        </div>

        <div className="field">
          <label htmlFor="signin-password">
            Password <a href="/forgot-password">forgot?</a>
          </label>
          <input
            aria-describedby={errors.password ? "signin-password-error" : undefined}
            aria-invalid={!!errors.password}
            autoComplete="current-password"
            className={errors.password ? "is-error" : ""}
            id="signin-password"
            onChange={set("password")}
            placeholder="••••••••••••"
            type="password"
            value={fields.password}
          />
          {errors.password && (
            <span className="field-error" id="signin-password-error">{errors.password}</span>
          )}
        </div>

        <button
          className="btn btn-primary submit-btn"
          disabled={submitting || socialSubmitting !== null}
          type="submit"
        >
          {submitting ? "Signing in…" : "Sign in →"}
        </button>
      </form>

      <div className="alt-row">
        New here?{" "}
        <a className="link" href="/signup">
          Create an account
        </a>{" "}
        · or{" "}
        <a className="link" href="/">
          read without signing in
        </a>
      </div>

      <AuthFooterLinks label="jymb.blog · auth v3.2" />
    </>
  );
}
