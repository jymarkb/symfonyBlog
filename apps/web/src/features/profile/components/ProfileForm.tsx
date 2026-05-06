import type { ChangeEvent, FormEvent } from "react";

import type {
  ProfileFormFields,
  ProfileFormProps,
} from "@/features/profile/profileTypes";

export function ProfileForm({
  errors,
  fields,
  isSubmitting,
  onChange,
  onSubmit,
  profile,
  successMessage,
}: ProfileFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function set(field: keyof ProfileFormFields) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      onChange(field, event.target.value);
    };
  }

  return (
    <form className="card grid gap-5" noValidate onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow mb-2">Private profile</p>
        <h1>Profile</h1>
        <p className="text-muted">
          Update the account details that are safe to sync with your public
          profile.
        </p>
      </div>

      {errors.server ? <div className="form-alert">{errors.server}</div> : null}
      {successMessage ? <div className="form-alert">{successMessage}</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="field">
          <label htmlFor="profile-display-name">Display name</label>
          <input
            className={errors.display_name ? "is-error" : ""}
            id="profile-display-name"
            onChange={set("display_name")}
            placeholder="Your display name"
            type="text"
            value={fields.display_name}
          />
          {errors.display_name ? (
            <span className="field-error">{errors.display_name}</span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="profile-avatar-url">Avatar URL</label>
          <input
            className={errors.avatar_url ? "is-error" : ""}
            id="profile-avatar-url"
            onChange={set("avatar_url")}
            placeholder="https://example.com/avatar.jpg"
            type="url"
            value={fields.avatar_url}
          />
          {errors.avatar_url ? (
            <span className="field-error">{errors.avatar_url}</span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="profile-first-name">First name</label>
          <input
            className={errors.first_name ? "is-error" : ""}
            id="profile-first-name"
            onChange={set("first_name")}
            placeholder="First name"
            type="text"
            value={fields.first_name}
          />
          {errors.first_name ? (
            <span className="field-error">{errors.first_name}</span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="profile-last-name">Last name</label>
          <input
            className={errors.last_name ? "is-error" : ""}
            id="profile-last-name"
            onChange={set("last_name")}
            placeholder="Last name"
            type="text"
            value={fields.last_name}
          />
          {errors.last_name ? (
            <span className="field-error">{errors.last_name}</span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 border-t border-rule pt-4 text-sm md:grid-cols-2">
        <ProfileMeta label="Email" value={profile.email} />
        <ProfileMeta label="Handle" value={profile.handle} />
        <ProfileMeta label="Role" value={profile.role} />
        <ProfileMeta
          label="Joined"
          value={
            profile.created_at
              ? new Date(profile.created_at).toLocaleDateString()
              : "Not available"
          }
        />
      </div>

      <div>
        <button className="btn btn-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}

function ProfileMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase text-muted">{label}</div>
      <div className="mt-1 font-medium text-ink">{value}</div>
    </div>
  );
}
