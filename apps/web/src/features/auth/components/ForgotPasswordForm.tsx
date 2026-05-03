import { useState } from 'react';

import { AuthFooterLinks } from '@/features/auth/components/AuthFooterLinks';
import { validateEmail } from '@/features/auth/lib/validation';

type Errors = { email?: string; server?: string };

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) { setErrors({ email: emailError }); return; }

    setSubmitting(true);
    setErrors({});
    // TODO: call password-reset API endpoint
    // On success: render a confirmation view with the submitted email
  }

  return (
    <>
      {errors.server && <div className="form-alert">{errors.server}</div>}

      <form noValidate onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="forgot-password-email">Email address</label>
          <input
            autoComplete="email"
            className={errors.email ? 'is-error' : ''}
            id="forgot-password-email"
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({});
            }}
            placeholder="you@somewhere.com"
            type="email"
            value={email}
          />
          <span className="hint">We'll send a one-time reset link to this address.</span>
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <button className="btn btn-primary submit-btn mt-1" disabled={submitting} type="submit">
          {submitting ? 'Sending…' : 'Send reset link →'}
        </button>
      </form>

      <div className="alt-row">
        Remembered it? <a className="link" href="/signin">Back to sign in</a>
      </div>

      <AuthFooterLinks label="Link expires after 30 min" />
    </>
  );
}
