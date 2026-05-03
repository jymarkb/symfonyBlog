import { useState } from "react";

import type { ThemeMode } from "@/lib/theme/themeTypes";

const themeModeStorageKey = "theme-mode";

function getInitialTheme(): ThemeMode {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.mode === "dark" ? "dark" : "light";
}

export function useThemeMode() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);

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
