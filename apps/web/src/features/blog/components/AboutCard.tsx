export function AboutCard() {
  return (
    <div className="side-block about-card">
      <h4>About</h4>

      <div className="about-id">
        <div
          className="avatar avatar-lg"
          style={{ width: 56, height: 56, fontSize: 18 }}
        >
          J
        </div>
        <div>
          <div className="name">Jymb</div>
          <div className="handle">@jymb · she/her</div>
        </div>
      </div>

      <p className="about-bio">
        Senior engineer. Building agent infrastructure by day, writing about it
        by night. Based in Lisbon, born in Manchester, formed somewhere on
        Hacker News circa 2014.
      </p>

      <div className="about-links">
        <a href="/about">Read more →</a>
        <a href="#">GitHub</a>
        <a href="#">X</a>
        <a href="#">RSS</a>
      </div>
    </div>
  );
}
