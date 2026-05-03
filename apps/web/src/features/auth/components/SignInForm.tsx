import { useState } from 'react';

import { AuthFooterLinks } from '@/features/auth/components/AuthFooterLinks';
import { AuthProviderButtons } from '@/features/auth/components/AuthProviderButtons';
import { validateEmail, validatePassword } from '@/features/auth/lib/validation';

type Fields = { email: string; password: string };
type Errors = Partial<Fields & { server: string }>;

export function SignInForm() {
  const [fields, setFields] = useState<Fields>({ email: '', password: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function set(field: keyof Fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setFields((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function validate(): Errors {
    return {
      email: validateEmail(fields.email) ?? undefined,
      password: validatePassword(fields.password) ?? undefined,
    };
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (errs.email || errs.password) { setErrors(errs); return; }

    setSubmitting(true);
    setErrors({});
    // TODO: call sign-in API endpoint
  }

  return (
    <>
      <AuthProviderButtons />

      <div className="divider">or with email</div>

      {errors.server && <div className="form-alert">{errors.server}</div>}

      <form noValidate onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="signin-email">Email</label>
          <input
            autoComplete="email"
            className={errors.email ? 'is-error' : ''}
            id="signin-email"
            onChange={set('email')}
            placeholder="you@somewhere.com"
            type="email"
            value={fields.email}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="field">
          <label htmlFor="signin-password">
            Password <a href="/forgot-password">forgot?</a>
          </label>
          <input
            autoComplete="current-password"
            className={errors.password ? 'is-error' : ''}
            id="signin-password"
            onChange={set('password')}
            placeholder="••••••••••••"
            type="password"
            value={fields.password}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <label className="check-row">
          <input defaultChecked type="checkbox" />
          <span>Keep me signed in on this device</span>
        </label>

        <button className="btn btn-primary submit-btn" disabled={submitting} type="submit">
          {submitting ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>

      <div className="alt-row">
        New here? <a className="link" href="/signup">Create an account</a> · or{' '}
        <a className="link" href="/">read without signing in</a>
      </div>

      <AuthFooterLinks label="jymb.blog · auth v3.2" />
    </>
  );
}
