import GithubIcon from "@/assets/image/github.svg?react";
import GoogleIcon from "@/assets/image/google.svg?react";

interface AuthProviderButtonsProps {
  compact?: boolean;
}

export function AuthProviderButtons({ compact = false }: AuthProviderButtonsProps) {
  return (
    <div className={compact ? "oauth-btns oauth-btns-compact" : "oauth-btns"}>
      <button className="oauth-btn" type="button">
        <GithubIcon aria-hidden className="oauth-icon" />
        {compact ? "GitHub" : "Continue with GitHub"}
      </button>
      <button className="oauth-btn" type="button">
        <GoogleIcon aria-hidden className="oauth-icon" />
        {compact ? "Google" : "Continue with Google"}
      </button>
    </div>
  );
}
