import type { ChangeEvent, FormEvent } from 'react';

import type { ProfileFormFields, ProfileFormProps } from '@/features/profile/profileTypes';

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
    <form noValidate onSubmit={handleSubmit}>
      <h2>Account</h2>

      {errors.server && <div className="form-alert">{errors.server}</div>}
      {successMessage && <div className="form-alert">{successMessage}</div>}

      <div className="field">
        <label htmlFor="profile-display-name">Display name</label>
        <input
          className={errors.display_name ? 'is-error' : ''}
          id="profile-display-name"
          onChange={set('display_name')}
          placeholder="Your display name"
          type="text"
          value={fields.display_name}
        />
        {errors.display_name && <span className="field-error">{errors.display_name}</span>}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="profile-first-name">First name</label>
          <input
            className={errors.first_name ? 'is-error' : ''}
            id="profile-first-name"
            onChange={set('first_name')}
            placeholder="First name"
            type="text"
            value={fields.first_name}
          />
          {errors.first_name && <span className="field-error">{errors.first_name}</span>}
        </div>

        <div className="field">
          <label htmlFor="profile-last-name">Last name</label>
          <input
            className={errors.last_name ? 'is-error' : ''}
            id="profile-last-name"
            onChange={set('last_name')}
            placeholder="Last name"
            type="text"
            value={fields.last_name}
          />
          {errors.last_name && <span className="field-error">{errors.last_name}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="profile-avatar-url">Avatar URL</label>
        <input
          className={errors.avatar_url ? 'is-error' : ''}
          id="profile-avatar-url"
          onChange={set('avatar_url')}
          placeholder="https://example.com/avatar.jpg"
          type="url"
          value={fields.avatar_url}
        />
        {errors.avatar_url && <span className="field-error">{errors.avatar_url}</span>}
      </div>

      <div className="field">
        <label htmlFor="profile-email">Email address</label>
        <input
          id="profile-email"
          readOnly
          style={{ opacity: 0.6, cursor: 'default' }}
          type="email"
          value={profile.email}
        />
        <span className="hint">Used for sign-in and notifications. Never shown publicly.</span>
      </div>

      <button className="btn btn-primary" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
