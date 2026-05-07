import type { ChangeEvent, SyntheticEvent } from "react";
import { useEffect, useState } from "react";

import type {
  ResetPasswordErrors,
  ResetPasswordFields,
} from "@/features/auth/authTypes";
import { AuthFooterLinks } from "@/features/auth/components/AuthFooterLinks";
import { AuthIntro } from "@/components/ui/AuthIntro";
import {
  signOutAfterPasswordUpdate,
  startPasswordRecoverySession,
  updatePassword,
} from "@/features/auth/api/resetPasswordApi";
import {
  passwordStrength,
  validateNewPassword,
} from "@/features/auth/lib/validation";
import { PasswordStrengthHint } from "@/components/ui/PasswordStrengthHint";
import { logError } from "@/lib/utils/logError";
import { getApiErrorMessage } from "@/lib/api/apiErrors";

export function ResetPasswordForm() {
  const [fields, setFields] = useState<ResetPasswordFields>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [isReady, setIsReady] = useState(false);
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
          server: "We could not verify this reset link. Please request a new one.",
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
    } catch (error) {
      logError(error);
      setErrors({
        server: getApiErrorMessage(error, "We were unable to update your password. Please try again."),
      });
      setSubmitting(false);
      return;
    }

    try {
      await signOutAfterPasswordUpdate();
    } catch (error) {
      logError(error);
      setErrors({
        server:
          "Your password was updated but we could not sign you out. Please close all browser tabs and sign in again.",
      });
      setSubmitting(false);
      return;
    }

    setFields({
      password: "",
      confirmPassword: "",
    });
    window.location.replace('/signin');
  }

  return (
    <div aria-live="polite" role="status">
      {errors.server && <div className="form-alert">{errors.server}</div>}

      {!isReady ? (
        <>
          {!errors.server && (
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
      ) : (
        <>
          <AuthIntro
              eyebrow="Set a new password"
              heading="Choose a new"
              em="password"
              lede="Pick something long and unique. This will replace your old password immediately."
            />

          <form noValidate onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="reset-password">New password</label>
              <input
                aria-describedby={errors.password ? "reset-new-password-error" : undefined}
                aria-invalid={errors.password ? true : undefined}
                autoComplete="new-password"
                className={errors.password ? "is-error" : ""}
                id="reset-password"
                maxLength={72}
                onChange={setField("password")}
                placeholder="At least 12 characters"
                type="password"
                value={fields.password}
              />
              <PasswordStrengthHint password={fields.password} strength={strength} />
              {errors.password && (
                <span className="field-error" id="reset-new-password-error">{errors.password}</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="reset-password-confirm">Confirm password</label>
              <input
                aria-describedby={errors.confirmPassword ? "reset-confirm-password-error" : undefined}
                aria-invalid={errors.confirmPassword ? true : undefined}
                autoComplete="new-password"
                className={errors.confirmPassword ? "is-error" : ""}
                id="reset-password-confirm"
                onChange={setField("confirmPassword")}
                placeholder="Type it once more"
                type="password"
                value={fields.confirmPassword}
              />
              {errors.confirmPassword && (
                <span className="field-error" id="reset-confirm-password-error">{errors.confirmPassword}</span>
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
      )}
    </div>
  );
}
