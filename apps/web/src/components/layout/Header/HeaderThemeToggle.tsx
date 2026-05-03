import { Moon, Sun } from "lucide-react";

import type { HeaderThemeToggleProps } from "@/components/layout/Header/headerTypes";

export function HeaderThemeToggle({
  themeMode,
  onToggleThemeMode,
}: HeaderThemeToggleProps) {
  return (
    <button
      aria-label={`Switch to ${themeMode === "dark" ? "light" : "dark"} theme`}
      className="btn btn-ghost size-10 p-0"
      onClick={onToggleThemeMode}
      type="button"
    >
      {themeMode === "dark" ? (
        <Sun aria-hidden="true" className="size-4" />
      ) : (
        <Moon aria-hidden="true" className="size-4" />
      )}
    </button>
  );
}
