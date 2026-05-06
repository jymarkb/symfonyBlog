import type {
  PrivateProfile,
  ProfileFormErrors,
  ProfileFormFields,
  ProfileFormSubmitInput,
} from "@/features/profile/profileTypes";

export function fieldsFromProfile(profile: PrivateProfile): ProfileFormFields {
  return {
    display_name: profile.display_name ?? "",
    first_name: profile.first_name ?? "",
    last_name: profile.last_name ?? "",
    avatar_url: profile.avatar_url ?? "",
  };
}

export function normalizeProfileFields(
  fields: ProfileFormFields,
): ProfileFormSubmitInput {
  return {
    display_name: emptyToNull(fields.display_name),
    first_name: emptyToNull(fields.first_name),
    last_name: emptyToNull(fields.last_name),
    avatar_url: emptyToNull(fields.avatar_url),
  };
}

export function validateProfileFields(
  fields: ProfileFormFields,
): ProfileFormErrors {
  const errors: ProfileFormErrors = {};
  const avatarUrl = fields.avatar_url.trim();

  if (avatarUrl) {
    try {
      new URL(avatarUrl);
    } catch {
      errors.avatar_url = "Enter a valid URL.";
    }
  }

  return errors;
}

function emptyToNull(value: string) {
  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}
