interface BrandProps {
  href?: string;
  className?: string;
}

export function Brand({ href, className }: BrandProps) {
  const content = (
    <>
      <span className="brand-mark">J</span>
      <span>
        jymb<span className="brand-dot">.</span>blog
      </span>
    </>
  );

  if (href) {
    return (
      <a className={`brand${className ? ` ${className}` : ""}`} href={href}>
        {content}
      </a>
    );
  }
  return (
    <div className={`brand${className ? ` ${className}` : ""}`}>{content}</div>
  );
}
