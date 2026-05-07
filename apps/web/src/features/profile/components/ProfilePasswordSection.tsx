import { useState } from "react";

import { updatePassword } from "@/features/auth/api/resetPasswordApi";
import { useCurrentSession } from "@/features/auth/session";
import { validateNewPassword } from "@/features/auth/lib/validation";
import { supabase } from "@/lib/auth/supabaseClient";
import type {
  ChangePasswordErrors,
  ChangePasswordFields,
} from "@/features/profile/profileTypes";

export function ProfilePasswordSection() {
  const { signOut, user } = useCurrentSession();
  const [fields, setFields] = useState<ChangePasswordFields>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ChangePasswordErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: keyof ChangePasswordFields, value: string) {
    setFields((prev) => ({ ...prev, [field]: value }));
    if (errors[field] ?? errors.server) {
      setErrors((prev) => ({ ...prev, [field]: undefined, server: undefined }));
    }
  }

  function validate(): ChangePasswordErrors {
    const next: ChangePasswordErrors = {};
    if (!fields.currentPassword) {
      next.currentPassword = "Current password is required.";
    }
    const pwError = validateNewPassword(fields.newPassword);
    if (pwError) next.newPassword = pwError;
    if (fields.newPassword && fields.confirmPassword !== fields.newPassword) {
      next.confirmPassword = "Passwords must match.";
    }
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email,
        password: fields.currentPassword,
      });

      if (signInError) {
        setErrors({ currentPassword: "Current password is incorrect." });
        return;
      }

      await updatePassword(fields.newPassword);
      await signOut();
      window.location.replace("/signin");
    } catch (error) {
      setErrors({
        server:
          error instanceof Error ? error.message : "Unable to update password.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="profile-section">
      <h2>Change password</h2>
      {errors.server && <div className="form-alert">{errors.server}</div>}
      <form noValidate onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="pw-current">Current password</label>
          <input
            autoComplete="current-password"
            className={errors.currentPassword ? "is-error" : ""}
            id="pw-current"
            onChange={(e) => handleChange("currentPassword", e.target.value)}
            placeholder="Enter your current password"
            type="password"
            value={fields.currentPassword}
          />
          {errors.currentPassword && (
            <span className="field-error">{errors.currentPassword}</span>
          )}
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="pw-new">New password</label>
            <input
              autoComplete="new-password"
              className={errors.newPassword ? "is-error" : ""}
              id="pw-new"
              onChange={(e) => handleChange("newPassword", e.target.value)}
              placeholder="At least 12 characters"
              type="password"
              value={fields.newPassword}
            />
            {errors.newPassword && (
              <span className="field-error">{errors.newPassword}</span>
            )}
          </div>
          <div className="field">
            <label htmlFor="pw-confirm">Confirm new password</label>
            <input
              autoComplete="new-password"
              className={errors.confirmPassword ? "is-error" : ""}
              id="pw-confirm"
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              placeholder="Repeat new password"
              type="password"
              value={fields.confirmPassword}
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </div>
        </div>
        <button className="btn" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
