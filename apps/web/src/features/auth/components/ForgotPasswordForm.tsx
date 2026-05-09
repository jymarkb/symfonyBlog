import type { SyntheticEvent } from "react";
import { useState } from "react";

import type { ForgotPasswordErrors } from "@/features/auth/authTypes";
import { AuthFooterLinks } from "@/features/auth/components/AuthFooterLinks";
import { AuthIntro } from "@/features/auth/components/AuthIntro";
import { AuthConfirm } from "@/features/auth/components/AuthConfirm";
import { validateEmail } from "@/features/auth/lib/validation";
import { sendPasswordResetEmail } from "@/features/auth/api/resetPasswordApi";
import { logError } from "@/lib/utils/logError";
import { getApiErrorMessage } from "@/lib/api/apiErrors";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<ForgotPasswordErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await sendPasswordResetEmail(email);
      setSent(true);
      setEmail("");
    } catch (error) {
      logError(error);
      setErrors({
        server: getApiErrorMessage(error, "Unable to send reset link. Please try again."),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div aria-live="polite" role="status">
      {sent ? (
        <>
          <AuthConfirm
            eyebrow="Check your email"
            heading="Recovery link"
            em="sent"
            lede="If an account exists for that email, we sent a reset link. Check your inbox and spam folder."
          >
            <a className="btn btn-primary" href="/signin">
              Back to sign in
            </a>

            <button
              className="btn btn-ghost"
              onClick={() => {
                setSent(false);
                setErrors({});
              }}
              type="button"
            >
              Send another email
            </button>
          </AuthConfirm>

          <AuthFooterLinks label="No account lookup · private by design" />
        </>
      ) : (
        <>
          <AuthIntro
            eyebrow="Password reset"
            heading="Reset your"
            em="password"
            lede="Enter the email address on your account and we'll send you a reset link. It expires in 30 minutes."
          />

          {errors.server && <div className="form-alert">{errors.server}</div>}

          <form noValidate onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="forgot-password-email">Email address</label>
              <input
                aria-describedby={errors.email ? "forgot-password-email-error" : undefined}
                aria-invalid={errors.email ? true : undefined}
                autoComplete="email"
                maxLength={254}
                className={errors.email ? "is-error" : ""}
                id="forgot-password-email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({});
                }}
                placeholder="you@somewhere.com"
                type="email"
                value={email}
              />
              <span className="hint">
                We'll send a one-time reset link to this address.
              </span>
              {errors.email && <span className="field-error" id="forgot-password-email-error">{errors.email}</span>}
            </div>

            <button
              className="btn btn-primary submit-btn mt-1"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Sending…" : "Send reset link →"}
            </button>
          </form>

          <div className="alt-row">
            Remembered it?{" "}
            <a className="link" href="/signin">
              Back to sign in
            </a>
          </div>

          <AuthFooterLinks label="Link expires after 30 min" />
        </>
      )}
    </div>
  );
}
