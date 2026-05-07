import { AppShell } from '@/layouts/AppShell';

export default function Page() {
  return (
    <AppShell>
      <div className="shell page-doc">
        <header className="page-doc-header">
          <p className="eyebrow">Legal</p>
          <h1>Privacy notice</h1>
          <p className="lede">
            jymb.blog is a personal blog. This notice covers what data is
            collected, why, and how it is handled.
          </p>
          <p className="meta" style={{ marginTop: '12px' }}>
            Last updated <time dateTime="2026-05">May 2026</time>
          </p>
        </header>

        <hr />

        <div className="prose-content" style={{ marginTop: '8px' }}>
          <div className="prose-section">
            <h2>What we collect</h2>
            <ul>
              <li>
                <strong>Email address</strong> — used only for account
                sign-in and reply notifications. Never sold, shared, or used
                for marketing.
              </li>
              <li>
                <strong>Display name and handle</strong> — shown publicly on
                any comments you post.
              </li>
              <li>
                <strong>Avatar URL</strong> — an image URL you supply,
                shown alongside your comments.
              </li>
              <li>
                <strong>Reading history</strong> — posts you have opened,
                stored on your account so we can show what you have already
                read. Never used for tracking or advertising.
              </li>
            </ul>
          </div>

          <div className="prose-section">
            <h2>What we do not collect</h2>
            <ul>
              <li>No tracking pixels or beacon requests.</li>
              <li>No third-party analytics scripts.</li>
              <li>No advertising identifiers or fingerprints.</li>
              <li>No device or browser information beyond what a standard web server log contains.</li>
            </ul>
          </div>

          <div className="prose-section">
            <h2>Authentication</h2>
            <p>
              Accounts are authenticated via{' '}
              <a
                className="link"
                href="https://supabase.com"
                rel="noopener noreferrer"
                target="_blank"
              >
                Supabase
              </a>
              . Passwords are hashed and never stored in plaintext on this
              server. If you sign in with GitHub or Google, we receive only
              a verified email address and the public profile data you have
              permitted that provider to share.
            </p>
          </div>

          <div className="prose-section">
            <h2>Cookies and storage</h2>
            <p>
              Authentication sessions are stored in your browser's local
              storage by the Supabase client library. No third-party cookies
              are set. No advertising cookies are used.
            </p>
          </div>

          <div className="prose-section">
            <h2>Data retention and deletion</h2>
            <p>
              You can delete your account at any time from your{' '}
              <a className="link" href="/profile">
                profile settings
              </a>
              . All personal data associated with the account is removed
              within 30 days of deletion. Comments are anonymised rather
              than deleted to preserve discussion context.
            </p>
          </div>

          <div className="prose-section">
            <h2>Contact</h2>
            <p>
              Questions or requests about your data can be sent via the{' '}
              <a className="link" href="/contact">
                contact page
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
