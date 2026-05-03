import { footerLinkGroups } from "@/components/layout/Footer/footerNavItems";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-grid">
          <div>
            <a
              className="mb-3 flex items-center gap-2 font-mono text-sm font-semibold"
              href="/"
            >
              <span className="grid size-[22px] place-items-center rounded-brand-sm bg-ink text-xs font-bold text-paper">
                J
              </span>
              <span>
                jymb<span className="text-accent-ink">.</span>blog
              </span>
            </a>
            <p className="m-0 max-w-[36ch] font-serif text-sm leading-6">
              A small, slow blog about building software thoughtfully.
              Hand-coded. No trackers. No popups.
            </p>
          </div>

          {footerLinkGroups.map((group) => (
            <div key={group.title}>
              <h4>{group.title}</h4>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© 2021-2026 jymb · CC BY-NC 4.0</span>
          <span>built by hand · last deploy 2d ago</span>
        </div>
      </div>
    </footer>
  );
}
