import { useEffect, useState } from "react";

import type { ThemeMode } from "@/lib/theme/themeTypes";

const themeModeStorageKey = "theme-mode";

function getInitialTheme(): ThemeMode {
  return "light";
}

export function useThemeMode() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    setThemeMode(
      document.documentElement.dataset.mode === "dark" ? "dark" : "light",
    );
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
