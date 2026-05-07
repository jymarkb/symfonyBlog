import type { ChangeEvent } from 'react';

import type { ProfileFormFields, ProfileFormProps } from '@/features/profile/profileTypes';
import { useCurrentSession } from '@/features/auth/session';

export function ProfileForm({
  errors,
  fields,
  isSubmitting,
  onChange,
  onSubmit,
  successMessage,
}: ProfileFormProps) {
  const { user } = useCurrentSession();

  function handleSubmit(event: { preventDefault(): void }) {
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

      <div aria-live="polite" role="status">
        {errors.server && <div className="form-alert">{errors.server}</div>}
        {successMessage && <div className="form-success">{successMessage}</div>}
      </div>

      <div className="field">
        <label htmlFor="profile-display-name">Display name</label>
        <input
          aria-describedby={errors.display_name ? 'profile-display-name-error' : undefined}
          aria-invalid={errors.display_name ? true : undefined}
          className={errors.display_name ? 'is-error' : ''}
          id="profile-display-name"
          maxLength={120}
          onChange={set('display_name')}
          placeholder="Your display name"
          type="text"
          value={fields.display_name}
        />
        {errors.display_name && (
          <span className="field-error" id="profile-display-name-error">{errors.display_name}</span>
        )}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="profile-first-name">First name</label>
          <input
            aria-describedby={errors.first_name ? 'profile-first-name-error' : undefined}
            aria-invalid={errors.first_name ? true : undefined}
            className={errors.first_name ? 'is-error' : ''}
            id="profile-first-name"
            onChange={set('first_name')}
            placeholder="First name"
            type="text"
            value={fields.first_name}
          />
          {errors.first_name && (
            <span className="field-error" id="profile-first-name-error">{errors.first_name}</span>
          )}
        </div>

        <div className="field">
          <label htmlFor="profile-last-name">Last name</label>
          <input
            aria-describedby={errors.last_name ? 'profile-last-name-error' : undefined}
            aria-invalid={errors.last_name ? true : undefined}
            className={errors.last_name ? 'is-error' : ''}
            id="profile-last-name"
            maxLength={120}
            onChange={set('last_name')}
            placeholder="Last name"
            type="text"
            value={fields.last_name}
          />
          {errors.last_name && (
            <span className="field-error" id="profile-last-name-error">{errors.last_name}</span>
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor="profile-email">Email address</label>
        <input
          autoComplete="email"
          id="profile-email"
          readOnly
          style={{ opacity: 0.6, cursor: 'default' }}
          type="email"
          value={user?.email ?? ''}
        />
        <span className="hint">Used for sign-in and notifications. Never shown publicly.</span>
      </div>

      <button className="btn btn-primary" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
