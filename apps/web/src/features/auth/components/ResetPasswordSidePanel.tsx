export function ResetPasswordSidePanel() {
  return (
    <>
      <div className="brand">
        <span className="brand-mark">j</span>
        <span>
          jymb<span className="brand-dot">.</span>blog
        </span>
      </div>

      <div className="side-reset">
        <h2>
          Fresh key, <em>same account</em>.
        </h2>
        <p>
          We verified the recovery link. Set a new password, then sign in again
          with the updated credentials.
        </p>
        <div className="side-steps">
          <div className="side-step">
            <span className="num">01</span>
            <span>Use a password you have not used here before.</span>
          </div>
          <div className="side-step">
            <span className="num">02</span>
            <span>Confirm it so we can catch typing mistakes.</span>
          </div>
          <div className="side-step">
            <span className="num">03</span>
            <span>Return to sign in and open your account.</span>
          </div>
        </div>
      </div>

      <div className="side-meta">
        <span>Password recovery</span>
        <span>Secure authentication</span>
      </div>
    </>
  );
}
