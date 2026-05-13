import { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

import type { AuthGateStatus, AuthGateTab } from "@/features/auth/authTypes";
import { ModalSignInForm } from "@/features/auth/components/ModalSignInForm";
import { ModalSignUpForm } from "@/features/auth/components/ModalSignUpForm";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultTab?: AuthGateTab;
};

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

export function AuthGateModal({ isOpen, onClose, onSuccess, defaultTab = "signin" }: Props) {
  const [tab, setTab] = useState<AuthGateTab>(defaultTab);
  const [slideDir, setSlideDir] = useState<"right" | "left">("right");
  const [status, setStatus] = useState<AuthGateStatus>("idle");
  const [formHeight, setFormHeight] = useState<number | undefined>();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const formOuterRef = useRef<HTMLDivElement>(null);

  function switchTab(next: AuthGateTab) {
    setSlideDir(next === "signup" ? "right" : "left");
    setTab(next);
  }

  // Animate height when switching between forms
  useEffect(() => {
    const outer = formOuterRef.current;
    if (!outer) return;
    const inner = outer.firstElementChild as HTMLElement | null;
    if (!inner) return;
    const ro = new ResizeObserver(() => {
      const h = (outer.firstElementChild as HTMLElement | null)?.offsetHeight;
      if (h) setFormHeight(h);
    });
    ro.observe(inner);
    return () => ro.disconnect();
  }, [tab, isMobile]);

  // Reset tab when defaultTab changes
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  // Store trigger element and focus trap on open
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      const timer = setTimeout(() => {
        const focusable = containerRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      if (triggerRef.current && "focus" in triggerRef.current) {
        (triggerRef.current as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleSuccess = useCallback(() => {
    setStatus("success");
    setTimeout(() => {
      setStatus("idle");
      onSuccess();
      onClose();
    }, 1200);
  }, [onSuccess, onClose]);

  if (!isOpen) return null;

  const successPanel = (
    <div className="auth-gate-success">
      <div className="auth-gate-check" aria-hidden="true">✓</div>
      <p className="auth-gate-success-title">You're all set.</p>
      <p className="auth-gate-success-sub">You can now follow, star, and comment.</p>
    </div>
  );

  const formSlot = (
    <div
      ref={formOuterRef}
      className="auth-gate-form-outer"
      style={formHeight !== undefined ? { height: formHeight } : undefined}
    >
      <div key={tab} className={`auth-gate-form auth-gate-form--${slideDir}`}>
        {tab === "signin" ? (
          <ModalSignInForm
            onSuccess={handleSuccess}
            onSwitchToSignUp={() => switchTab("signup")}
          />
        ) : (
          <ModalSignUpForm
            onSuccess={handleSuccess}
            onSwitchToSignIn={() => switchTab("signin")}
          />
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return ReactDOM.createPortal(
      <>
        <div
          className="auth-gate-backdrop"
          aria-hidden="true"
          onClick={onClose}
        />
        <div
          className="auth-gate-sheet"
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label={tab === "signin" ? "Sign in to continue" : "Create a free account"}
        >
          <div className="auth-gate-drag-handle-wrap" aria-hidden="true">
            <div className="auth-gate-drag-handle" />
          </div>

          {status === "success" ? (
            successPanel
          ) : (
            <>
              <div className="auth-gate-sheet-header">
                <span className="auth-gate-sheet-title">
                  {tab === "signin" ? "Sign in to continue" : "Create a free account"}
                </span>
                <button
                  className="auth-gate-close"
                  onClick={onClose}
                  type="button"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="auth-gate-tabs" role="tablist">
                <button
                  className={`auth-gate-tab${tab === "signin" ? " is-active" : ""}`}
                  role="tab"
                  aria-selected={tab === "signin"}
                  onClick={() => switchTab("signin")}
                  type="button"
                >
                  Sign in
                </button>
                <button
                  className={`auth-gate-tab${tab === "signup" ? " is-active" : ""}`}
                  role="tab"
                  aria-selected={tab === "signup"}
                  onClick={() => switchTab("signup")}
                  type="button"
                >
                  Sign up
                </button>
              </div>

              {formSlot}
            </>
          )}
        </div>
      </>,
      document.body
    );
  }

  // Desktop centered modal
  return ReactDOM.createPortal(
    <>
      <div
        className="auth-gate-backdrop"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className="auth-gate-modal"
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={tab === "signin" ? "Sign in to continue" : "Create a free account"}
      >
        {status === "success" ? (
          <>
            <div className="auth-gate-modal-header" style={{ justifyContent: "flex-end" }}>
              <button
                className="auth-gate-close"
                onClick={onClose}
                type="button"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {successPanel}
          </>
        ) : (
          <>
            <div className="auth-gate-modal-header">
              <span className="auth-gate-modal-title">
                {tab === "signin" ? "Sign in to continue" : "Create a free account"}
              </span>
              <button
                className="auth-gate-close"
                onClick={onClose}
                type="button"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="auth-gate-subtext">
              {tab === "signin"
                ? "Join to follow authors, star posts, and join the discussion."
                : "Follow authors, star posts, and join the discussion."}
            </p>

            <div className="auth-gate-tabs" role="tablist">
              <button
                className={`auth-gate-tab${tab === "signin" ? " is-active" : ""}`}
                role="tab"
                aria-selected={tab === "signin"}
                onClick={() => switchTab("signin")}
                type="button"
              >
                Sign in
              </button>
              <button
                className={`auth-gate-tab${tab === "signup" ? " is-active" : ""}`}
                role="tab"
                aria-selected={tab === "signup"}
                onClick={() => switchTab("signup")}
                type="button"
              >
                Sign up
              </button>
            </div>

            {formSlot}
          </>
        )}
      </div>
    </>,
    document.body
  );
}
