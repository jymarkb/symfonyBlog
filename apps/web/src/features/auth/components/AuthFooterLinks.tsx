interface AuthFooterLinksProps {
  label: string;
}

export function AuthFooterLinks({ label }: AuthFooterLinksProps) {
  return (
    <div className="auth-foot">
      <span>{label}</span>
      <span>
        <a href="#">Privacy</a> · <a href="#">Terms</a>
      </span>
    </div>
  );
}
