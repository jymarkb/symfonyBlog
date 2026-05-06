import { useCallback, useEffect, useState } from "react";

import {
  fetchPrivateProfile,
  updatePrivateProfile,
} from "@/features/profile/api/profileApi";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import type {
  PrivateProfile,
  ProfileFormErrors,
  ProfileFormFields,
} from "@/features/profile/profileTypes";
import {
  fieldsFromProfile,
  normalizeProfileFields,
  validateProfileFields,
} from "@/features/profile/lib/profileForm";
import { useCurrentSession } from "@/features/auth/session";
import { supabase } from "@/lib/auth/supabaseClient";

export function ProfilePage() {
  const { refreshSession } = useCurrentSession();
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [fields, setFields] = useState<ProfileFormFields>({
    display_name: "",
    first_name: "",
    last_name: "",
    avatar_url: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<PrivateProfile | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getAccessToken = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session?.access_token) {
      throw new Error("Your session could not be loaded. Please sign in again.");
    }

    return data.session.access_token;
  }, []);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const accessToken = await getAccessToken();
      const nextProfile = await fetchPrivateProfile(accessToken);

      setProfile(nextProfile);
      setFields(fieldsFromProfile(nextProfile));
    } catch (error) {
      setErrors({
        server:
          error instanceof Error
            ? error.message
            : "Unable to load your profile.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  function handleChange(field: keyof ProfileFormFields, value: string) {
    setFields((currentFields) => ({
      ...currentFields,
      [field]: value,
    }));
    setSuccessMessage(null);

    if (errors[field] || errors.server) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [field]: undefined,
        server: undefined,
      }));
    }
  }

  async function handleSubmit() {
    const nextErrors = validateProfileFields(fields);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage(null);

    try {
      const accessToken = await getAccessToken();
      const nextProfile = await updatePrivateProfile(
        accessToken,
        normalizeProfileFields(fields),
      );

      setProfile(nextProfile);
      setFields(fieldsFromProfile(nextProfile));
      setSuccessMessage("Profile updated.");
      await refreshSession();
    } catch (error) {
      setErrors({
        server:
          error instanceof Error
            ? error.message
            : "Unable to update your profile.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="profile-section">
        <p style={{ color: 'var(--ink-4)', fontSize: '14px', margin: 0 }}>Loading your profile…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-section">
        <h2>Account</h2>
        {errors.server && <p style={{ color: 'var(--ink-4)', fontSize: '14px' }}>{errors.server}</p>}
        <button className="btn btn-primary" onClick={() => void loadProfile()} type="button">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <ProfileForm
        errors={errors}
        fields={fields}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
        profile={profile}
        successMessage={successMessage}
      />
    </div>
  );
}
