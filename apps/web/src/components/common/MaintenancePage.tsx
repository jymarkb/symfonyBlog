import { Moon, Sun } from "lucide-react";

import { Brand } from "@/components/ui/Brand";
import { useThemeMode } from "@/lib/theme/useThemeMode";

export function MaintenancePage() {
  const { themeMode, toggleThemeMode } = useThemeMode();

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-paper text-ink">
      <div className="border-b border-rule px-8 py-6">
        <div className="shell">
          <Brand href="/" />
        </div>
      </div>

      <div className="grid place-items-center px-8 py-20 text-center">
        <div className="max-w-[520px]">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium tracking-widest uppercase text-accent-ink bg-accent-soft border border-rule rounded-full px-3 py-1.5 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Under maintenance
          </span>

          <h1 className="font-sans text-4xl font-semibold tracking-tight leading-tight text-ink mb-4">
            Back soon.
          </h1>

          <p className="font-serif text-[17px] text-ink-3 leading-relaxed mb-9">
            I'm rebuilding this site and should be back shortly.
            Thanks for your patience — good things take a little time.
          </p>

          <div className="w-10 h-px bg-rule mx-auto mb-9" />

          <div className="flex justify-center items-center gap-6 flex-wrap font-mono text-xs text-ink-4">
            <span>In the meantime —</span>
            <a href="mailto:dev.jymarkb@gmail.com" className="text-ink-3 no-underline hover:text-accent-ink transition-colors">
              dev.jymarkb@gmail.com
            </a>
            <a href="https://github.com/jymarkb" className="text-ink-3 no-underline hover:text-accent-ink transition-colors">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/jaymark-borja/" className="text-ink-3 no-underline hover:text-accent-ink transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      <footer className="border-t border-rule px-8 py-5">
        <div className="shell flex justify-between items-center font-mono text-[11px] text-ink-4">
          <span>© 2021–2026 jymb</span>
          <button
            onClick={toggleThemeMode}
            aria-label={`Switch to ${themeMode === "dark" ? "light" : "dark"} mode`}
            className="btn btn-ghost size-8 p-0"
            type="button"
          >
            {themeMode === "dark" ? (
              <Sun aria-hidden="true" className="size-4" />
            ) : (
              <Moon aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
