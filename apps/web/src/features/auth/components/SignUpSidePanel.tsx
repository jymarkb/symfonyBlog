export function SignUpSidePanel() {
  return (
    <>
      <div className="brand">
        <span className="brand-mark">j</span>
        <span>
          jymb<span className="brand-dot">.</span>blog
        </span>
      </div>

      <div className="side-pitch">
        <h2>
          An account is <em>optional</em>.
        </h2>
        <p>
          You can read everything on this site without one. Accounts only exist
          for the few small things that need state — and they take 20 seconds to
          make.
        </p>
        <ul className="side-features">
          <li>
            <span className="num">01</span>
            <span>
              <strong>Comment under your own name.</strong>
              Threaded discussion, edits, the works.
            </span>
          </li>
          <li>
            <span className="num">02</span>
            <span>
              <strong>Follow threads.</strong>
              Get notified when someone replies — only when, never otherwise.
            </span>
          </li>
          <li>
            <span className="num">03</span>
            <span>
              <strong>Save reading positions.</strong>
              Long posts remember where you left off, across devices.
            </span>
          </li>
          <li>
            <span className="num">04</span>
            <span>
              <strong>One profile, your data.</strong>
              Export everything as JSON. Delete the account in one click. No
              dark patterns.
            </span>
          </li>
        </ul>
      </div>

      <div className="side-meta">
        <span>2,841 subscribers · 38 commenters this week</span>
        <span>v3.2.1</span>
      </div>
    </>
  );
}
