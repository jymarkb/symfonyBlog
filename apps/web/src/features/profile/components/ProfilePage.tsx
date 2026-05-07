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
import { getAccessToken } from "@/lib/auth/getAccessToken";
import { logError } from "@/lib/utils/logError";
import { ProfileSection } from "@/features/profile/components/ProfileSection";
import { ProfilePlaceholder } from "@/features/profile/components/ProfilePlaceholder";

export function ProfilePage({
  onProfileChange,
}: {
  onProfileChange?: (p: PrivateProfile) => void;
}) {
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

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const accessToken = await getAccessToken();
      const nextProfile = await fetchPrivateProfile(accessToken);

      setProfile(nextProfile);
      setFields(fieldsFromProfile(nextProfile));
    } catch (error) {
      logError(error);
      setErrors({ server: "Unable to load your profile." });
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      onProfileChange?.(nextProfile);
      setSuccessMessage("Profile updated.");
      await refreshSession();
    } catch (error) {
      logError(error);
      setErrors({ server: "Unable to update your profile." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <ProfileSection>
        <ProfilePlaceholder>Loading your profile…</ProfilePlaceholder>
      </ProfileSection>
    );
  }

  if (!profile) {
    return (
      <ProfileSection title="Account">
        {errors.server && (
          <ProfilePlaceholder>{errors.server}</ProfilePlaceholder>
        )}
        <button
          className="btn btn-primary"
          onClick={() => void loadProfile()}
          type="button"
        >
          Try again
        </button>
      </ProfileSection>
    );
  }

  return (
    <ProfileSection>
      <ProfileForm
        errors={errors}
        fields={fields}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
        profile={profile}
        successMessage={successMessage}
      />
    </ProfileSection>
  );
}
