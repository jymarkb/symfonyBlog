import GithubIcon from "@/assets/image/github.svg?react";
import GoogleIcon from "@/assets/image/google.svg?react";
import type { AuthProviderButtonsProps } from "@/features/auth/authTypes";

export function AuthProviderButtons({
  compact = false,
  disabled = false,
  lastUsedProvider = null,
  loadingProvider = null,
  onProviderSelect,
}: AuthProviderButtonsProps) {
  function providerLabel(provider: "github" | "google") {
    if (loadingProvider === provider) {
      return `Opening ${provider === "github" ? "GitHub" : "Google"}...`;
    }

    if (compact) {
      return provider === "github" ? "GitHub" : "Google";
    }

    return `Continue with ${provider === "github" ? "GitHub" : "Google"}`;
  }

  return (
    <div className={compact ? "oauth-btns oauth-btns-compact" : "oauth-btns"}>
      <div className="oauth-option">
        <button
          className="oauth-btn"
          disabled={disabled}
          onClick={() => onProviderSelect?.("github")}
          type="button"
        >
          <GithubIcon aria-hidden className="oauth-icon" />
          {providerLabel("github")}
        </button>
        {lastUsedProvider === "github" ? (
          <div aria-label="Last used: GitHub" className="oauth-last-used">Last used</div>
        ) : null}
      </div>

      <div className="oauth-option">
        <button
          className="oauth-btn"
          disabled={disabled}
          onClick={() => onProviderSelect?.("google")}
          type="button"
        >
          <GoogleIcon aria-hidden className="oauth-icon" />
          {providerLabel("google")}
        </button>
        {lastUsedProvider === "google" ? (
          <div aria-label="Last used: Google" className="oauth-last-used">Last used</div>
        ) : null}
      </div>
    </div>
  );
}
