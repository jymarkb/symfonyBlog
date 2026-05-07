import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import type { ThemeMode } from "@/lib/theme/themeTypes";

const storageKey = "theme-mode";

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(storageKey);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.mode = mode;
}

type ThemeModeContextValue = {
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const initial = readStoredTheme();
    setThemeMode(initial);
    applyTheme(initial);
  }, []);

  function toggleThemeMode() {
    const next: ThemeMode = themeMode === "dark" ? "light" : "dark";
    setThemeMode(next);
    applyTheme(next);
    window.localStorage.setItem(storageKey, next);
  }

  return (
    <ThemeModeContext.Provider value={{ themeMode, toggleThemeMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeModeContext(): ThemeModeContextValue {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeModeContext must be used inside ThemeModeProvider");
  return ctx;
}
