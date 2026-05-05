import type { ChangeEvent, SyntheticEvent } from "react";
import { useEffect, useState } from "react";

import type {
  ResetPasswordErrors,
  ResetPasswordFields,
} from "@/features/auth/authTypes";
import { AuthFooterLinks } from "@/features/auth/components/AuthFooterLinks";
import { ResetPasswordIntro } from "@/features/auth/components/ResetPasswordIntro";
import {
  signOutAfterPasswordUpdate,
  startPasswordRecoverySession,
  updatePassword,
} from "@/features/auth/api/resetPasswordApi";
import {
  passwordStrength,
  strengthLabel,
  validateNewPassword,
} from "@/features/auth/lib/validation";

export function ResetPasswordForm() {
  const [fields, setFields] = useState<ResetPasswordFields>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [isReady, setIsReady] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const strength = passwordStrength(fields.password);

  useEffect(() => {
    let isMounted = true;

    async function prepareRecoverySession() {
      try {
        await startPasswordRecoverySession();
        if (isMounted) setIsReady(true);
      } catch (error) {
        if (!isMounted) return;
        setErrors({
          server:
            error instanceof Error
              ? error.message
              : "We could not verify this reset link.",
        });
      }
    }

    prepareRecoverySession();

    return () => {
      isMounted = false;
    };
  }, []);

  function setField(field: keyof ResetPasswordFields) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setFields((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function validate(): ResetPasswordErrors {
    const password = validateNewPassword(fields.password) ?? undefined;
    const confirmPassword =
      fields.confirmPassword !== fields.password
        ? "Passwords must match."
        : undefined;

    return { password, confirmPassword };
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors = validate();
    if (nextErrors.password || nextErrors.confirmPassword) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await updatePassword(fields.password);
      await signOutAfterPasswordUpdate();
      setFields({
        password: "",
        confirmPassword: "",
      });
      setIsComplete(true);
    } catch (error) {
      setErrors({
        server:
          error instanceof Error ? error.message : "Unable to update password.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (isComplete) {
    return (
      <>
        <div className="auth-confirm">
          <div aria-hidden="true" className="auth-confirm-mark">
            OK
          </div>

          <div className="eyebrow mb-4">Password updated</div>

          <h1>
            You are ready to <em>sign in</em>.
          </h1>

          <p className="lede">
            Your password was updated. Use the new password the next time you
            sign in.
          </p>

          <div className="callback-actions">
            <a className="btn btn-primary" href="/signin">
              Go to sign in
            </a>
          </div>
        </div>

        <AuthFooterLinks label="Password updated securely" />
      </>
    );
  }

  if (!isReady) {
    return (
      <>
        {errors.server ? (
          <div className="form-alert">{errors.server}</div>
        ) : (
          <div className="callback-progress" aria-label="Loading">
            <span />
            <span />
            <span />
          </div>
        )}

        <div className="alt-row">
          Need a new link?{" "}
          <a className="link" href="/forgot-password">
            Request another reset
          </a>
        </div>

        <AuthFooterLinks label="Recovery links are one-time use" />
      </>
    );
  }

  return (
    <>
      <ResetPasswordIntro />

      {errors.server && <div className="form-alert">{errors.server}</div>}

      <form noValidate onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="reset-password">New password</label>
          <input
            autoComplete="new-password"
            className={errors.password ? "is-error" : ""}
            id="reset-password"
            onChange={setField("password")}
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

        <div className="field">
          <label htmlFor="reset-password-confirm">Confirm password</label>
          <input
            autoComplete="new-password"
            className={errors.confirmPassword ? "is-error" : ""}
            id="reset-password-confirm"
            onChange={setField("confirmPassword")}
            placeholder="Type it once more"
            type="password"
            value={fields.confirmPassword}
          />
          {errors.confirmPassword && (
            <span className="field-error">{errors.confirmPassword}</span>
          )}
        </div>

        <button
          className="btn btn-primary submit-btn"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Updating password..." : "Update password"}
        </button>
      </form>

      <AuthFooterLinks label="Use a long, unique password" />
    </>
  );
}
