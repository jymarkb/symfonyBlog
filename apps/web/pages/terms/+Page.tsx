import { AppShell } from '@/layouts/AppShell';

export default function Page() {
  return (
    <AppShell>
      <div className="shell page-doc">
        <header className="page-doc-header">
          <p className="eyebrow">Legal</p>
          <h1>Community guidelines</h1>
          <p className="lede">
            Be kind in the comments — that is the whole policy. Everything
            below is an elaboration of that single rule.
          </p>
          <p className="meta" style={{ marginTop: '12px' }}>
            Last updated <time dateTime="2026-05">May 2026</time>
          </p>
        </header>

        <hr />

        <div className="prose-content" style={{ marginTop: '8px' }}>
          <div className="prose-section">
            <h2>Be kind</h2>
            <p>
              Disagree with ideas, not with people. Criticism is welcome;
              personal attacks, condescension, and harassment are not. If a
              comment would embarrass you to say aloud to someone's face in a
              professional setting, do not post it.
            </p>
          </div>

          <div className="prose-section">
            <h2>Stay on topic</h2>
            <p>
              Comments should relate to the post they appear on. Spam,
              unsolicited self-promotion, and off-topic threads will be
              removed without notice.
            </p>
          </div>

          <div className="prose-section">
            <h2>No illegal content</h2>
            <p>
              Do not post anything that violates applicable law. This includes
              but is not limited to: copyright infringement, defamation,
              threats, and the sharing of private information without consent.
            </p>
          </div>

          <div className="prose-section">
            <h2>Enforcement</h2>
            <p>
              Comments that break these guidelines will be removed. Accounts
              that repeatedly break them will be suspended. Moderation
              decisions are final. There is no formal appeals process — if
              you have a genuine concern, use the{' '}
              <a className="link" href="/contact">
                contact page
              </a>
              .
            </p>
          </div>

          <div className="prose-section">
            <h2>Changes</h2>
            <p>
              These guidelines may be updated at any time. The date at the
              top of this page reflects when they were last revised.
              Continued use of the site after changes constitutes acceptance.
            </p>
          </div>

          <div className="prose-section">
            <h2>Privacy</h2>
            <p>
              By creating an account you also accept the{' '}
              <a className="link" href="/privacy">
                privacy notice
              </a>
              , which covers what personal data is stored and how it is
              handled.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
