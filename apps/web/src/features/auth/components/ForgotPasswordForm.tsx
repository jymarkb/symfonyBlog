import type { SyntheticEvent } from "react";
import { useState } from "react";

import type { ForgotPasswordErrors } from "@/features/auth/authTypes";
import { AuthFooterLinks } from "@/features/auth/components/AuthFooterLinks";
import { ForgotPasswordIntro } from "@/features/auth/components/ForgotPasswordIntro";
import { validateEmail } from "@/features/auth/lib/validation";
import { sendPasswordResetEmail } from "@/features/auth/api/resetPasswordApi";

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
      console.error(error);
      setErrors({
        server: "Unable to send reset link. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div aria-live="polite" role="status">
      {sent ? (
        <>
          <div className="auth-confirm">
            <div aria-hidden="true" className="auth-confirm-mark">
              OK
            </div>

            <div className="eyebrow mb-4">Check your email</div>

            <h1>
              Recovery link <em>sent</em>.
            </h1>

            <p className="lede">
              If an account exists for that email, we sent a reset link. Check
              your inbox and spam folder.
            </p>

            <div className="callback-actions">
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
            </div>
          </div>

          <AuthFooterLinks label="No account lookup · private by design" />
        </>
      ) : (
        <>
          <ForgotPasswordIntro />

          <div className="form-alert">
            {errors.server ?? ""}
          </div>

          <form noValidate onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="forgot-password-email">Email address</label>
              <input
                aria-describedby={errors.email ? "forgot-password-email-error" : undefined}
                aria-invalid={!!errors.email}
                autoComplete="email"
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
