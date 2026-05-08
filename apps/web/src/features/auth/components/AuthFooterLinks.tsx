interface AuthFooterLinksProps {
  label: string;
}

export function AuthFooterLinks({ label }: AuthFooterLinksProps) {
  return (
    <div className="auth-foot">
      <span>{label}</span>
      <span>
        <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a>
      </span>
    </div>
  );
}
