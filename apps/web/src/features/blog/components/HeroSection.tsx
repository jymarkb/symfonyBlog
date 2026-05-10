export function HeroSection() {
  return (
    <section className="hero">
      <div className="shell">
        <div className="hero-grid">
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>
              jymb.blog · est. 2021 · issue №47
            </div>
            <h1>
              Notes on systems, AI, and the <em>craft</em> of building software.
            </h1>
            <p>
              I'm Jymb — a software engineer writing in public about distributed
              systems, agentic AI, and the slow, deliberate work of shipping good
              software. Updated weekly-ish, when something feels true enough to
              write down.
            </p>
            <div className="hero-meta">
              <span className="pill">
                <span className="pulse"></span> Currently writing
              </span>
              <span>47 essays</span>
              <span>·</span>
              <span>2,841 subscribers</span>
            </div>
          </div>

          <aside className="hero-aside">
            <div className="hero-aside-row">
              <span>Latest</span>
              <span>2 days ago</span>
            </div>
            <div className="hero-aside-row">
              <span>Cadence</span>
              <span>Weekly</span>
            </div>
            <div className="hero-aside-row">
              <span>Reading time</span>
              <span>~8 min avg</span>
            </div>
            <div className="hero-aside-row">
              <span>License</span>
              <span>CC BY-NC 4.0</span>
            </div>
            <div className="hero-aside-row">
              <span>Build</span>
              <span>v3.2.1</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
