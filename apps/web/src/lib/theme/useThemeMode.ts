import { useEffect, useState } from "react";

import type { ThemeMode } from "@/lib/theme/themeTypes";

const themeModeStorageKey = "theme-mode";

export function useThemeMode() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(themeModeStorageKey);
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
    window.localStorage.setItem(themeModeStorageKey, nextTheme);
  }

  return {
    themeMode,
    toggleThemeMode,
  };
}
