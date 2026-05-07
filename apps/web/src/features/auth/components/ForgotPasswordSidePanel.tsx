export function ForgotPasswordSidePanel() {
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
          It happens to <em>everyone</em>.
        </h2>
        <p>
          We'll email you a secure link. Click it, set a new password, and
          you're back in — no support ticket, no wait.
        </p>
        <div className="side-steps">
          <div className="side-step">
            <span className="num">01</span>
            <span>Enter the email you signed up with and hit send.</span>
          </div>
          <div className="side-step">
            <span className="num">02</span>
            <span>
              Open the email and click the reset link. It's valid for 30
              minutes.
            </span>
          </div>
          <div className="side-step">
            <span className="num">03</span>
            <span>Pick a new password. You'll be signed out and redirected to sign in.</span>
          </div>
        </div>
      </div>

      <div className="side-meta">
        <span>Secure · one-time link</span>
        <span>est. 2021</span>
      </div>
    </>
  );
}
