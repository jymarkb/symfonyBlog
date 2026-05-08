import { useState } from "react";

import { updatePassword } from "@/features/auth/api/resetPasswordApi";
import { useCurrentSession } from "@/features/auth/session";
import { passwordStrength, validateNewPassword } from "@/features/auth/lib/validation";
import { supabase } from "@/lib/auth/supabaseClient";
import { PasswordStrengthHint } from "@/components/ui/PasswordStrengthHint";
import { logError } from "@/lib/utils/logError";
import { getApiErrorMessage } from "@/lib/api/apiErrors";
import { ProfileSection } from "@/features/profile/components/ProfileSection";
import { FormMessage } from "@/components/ui/FormMessage";
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

  const strength = passwordStrength(fields.newPassword);

  if (!user) return null;

  const currentUser = user;

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
    if (fields.newPassword && !fields.confirmPassword) {
      next.confirmPassword = "Please confirm your new password.";
    } else if (fields.newPassword && fields.confirmPassword !== fields.newPassword) {
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

    if (!currentUser.email) {
      setErrors({ server: "Password change is not available for accounts signed in with a social provider." });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    let passwordUpdated = false;
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: fields.currentPassword,
      });

      if (signInError) {
        setErrors({ currentPassword: "Sign-in failed. Please check your current password." });
        setFields((prev) => ({ ...prev, currentPassword: "" }));
        return;
      }

      await updatePassword(fields.newPassword);
      passwordUpdated = true;
    } catch (error) {
      logError(error);
      setErrors({
        server: getApiErrorMessage(error, "Unable to update password."),
      });
    } finally {
      setIsSubmitting(false);
    }

    if (passwordUpdated) {
      await signOut().catch(() => {});
      window.location.replace("/signin");
    }
  }

  return (
    <ProfileSection title="Change password">
      <FormMessage error={errors.server} />
      <form noValidate onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="pw-current">Current password</label>
          <input
            aria-describedby={errors.currentPassword ? "pw-current-error" : undefined}
            aria-invalid={errors.currentPassword ? true : undefined}
            autoComplete="current-password"
            className={errors.currentPassword ? "is-error" : ""}
            id="pw-current"
            onChange={(e) => handleChange("currentPassword", e.target.value)}
            placeholder="Enter your current password"
            type="password"
            value={fields.currentPassword}
          />
          {errors.currentPassword && (
            <span className="field-error" id="pw-current-error">{errors.currentPassword}</span>
          )}
        </div>
        <div className="field">
          <label htmlFor="pw-new">New password</label>
          <input
            aria-describedby={errors.newPassword ? "pw-new-error" : undefined}
            aria-invalid={errors.newPassword ? true : undefined}
            autoComplete="new-password"
            className={errors.newPassword ? "is-error" : ""}
            id="pw-new"
            maxLength={72}
            onChange={(e) => handleChange("newPassword", e.target.value)}
            placeholder="At least 12 characters"
            type="password"
            value={fields.newPassword}
          />
          <PasswordStrengthHint password={fields.newPassword} strength={strength} />
          {errors.newPassword && (
            <span className="field-error" id="pw-new-error">{errors.newPassword}</span>
          )}
        </div>
        <div className="field">
          <label htmlFor="pw-confirm">Confirm new password</label>
          <input
            aria-describedby={errors.confirmPassword ? "pw-confirm-error" : undefined}
            aria-invalid={errors.confirmPassword ? true : undefined}
            autoComplete="new-password"
            className={errors.confirmPassword ? "is-error" : ""}
            id="pw-confirm"
            maxLength={72}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            placeholder="Repeat new password"
            type="password"
            value={fields.confirmPassword}
          />
          {errors.confirmPassword && (
            <span className="field-error" id="pw-confirm-error">{errors.confirmPassword}</span>
          )}
        </div>
        <button className="btn" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </ProfileSection>
  );
}
