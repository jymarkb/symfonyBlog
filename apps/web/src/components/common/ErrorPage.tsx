type ErrorPageProps = {
  code: 404 | 500;
};

const content = {
  404: {
    heading: "Page not found.",
    description:
      "The URL you followed doesn't exist — it may have been moved, deleted, or never published. Here are some places to go instead.",
  },
  500: {
    heading: "Something went wrong.",
    description:
      "An unexpected error occurred on our end. Try refreshing the page, or come back in a moment.",
  },
};

const helpfulLinks = [
  { label: "Latest writing", hint: "index →", href: "/" },
  { label: "Full post archive", hint: "archive →", href: "/archive" },
  { label: "Browse by tag", hint: "tags →", href: "/tags" },
  { label: "What I'm doing now", hint: "now →", href: "/now" },
  { label: "About this blog", hint: "about →", href: "/about" },
  { label: "Report a broken link", hint: "contact →", href: "/contact" },
];

export function ErrorPage({ code }: ErrorPageProps) {
  const { heading, description } = content[code];

  return (
    <div className="notfound-shell">
      <div className="notfound-body">
        <div className="notfound-inner">
          <span className="notfound-code">{code}</span>
          <h1>{heading}</h1>
          <p>{description}</p>

          <div className="notfound-actions">
            <a href="/" className="btn btn-primary">← Back to home</a>
            <a href="/archive" className="btn">Browse archive</a>
          </div>

          {code === 404 && (
            <div className="notfound-links">
              {helpfulLinks.map((link) => (
                <a key={link.href} href={link.href} className="notfound-link-row">
                  <span>{link.label}</span>
                  <span className="hint">{link.hint}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
