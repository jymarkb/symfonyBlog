import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import type { ThemeMode } from "@/components/layout/Header/headerTypes";

export function HeaderThemeToggle() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme-mode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = storedTheme === "dark" || (!storedTheme && prefersDark)
      ? "dark"
      : "light";

    setThemeMode(initialTheme);
    document.documentElement.dataset.mode = initialTheme;
  }, []);

  function toggleThemeMode() {
    const nextTheme = themeMode === "dark" ? "light" : "dark";

    setThemeMode(nextTheme);
    document.documentElement.dataset.mode = nextTheme;
    window.localStorage.setItem("theme-mode", nextTheme);
  }

  return (
    <button
      aria-label={`Switch to ${themeMode === "dark" ? "light" : "dark"} theme`}
      className="btn btn-ghost size-10 p-0"
      onClick={toggleThemeMode}
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
