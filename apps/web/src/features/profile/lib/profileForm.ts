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
  };
}

export function normalizeProfileFields(
  fields: ProfileFormFields,
): ProfileFormSubmitInput {
  return {
    display_name: emptyToNull(fields.display_name),
    first_name: emptyToNull(fields.first_name),
    last_name: emptyToNull(fields.last_name),
  };
}

export function validateProfileFields(
  _fields: ProfileFormFields,
): ProfileFormErrors {
  return {};
}

function emptyToNull(value: string) {
  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}
