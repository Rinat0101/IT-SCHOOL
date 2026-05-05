"use client";

import { useState } from "react";

type Theme = "light" | "dark";

const COOKIE_NAME = "theme";
const ONE_YEAR = 60 * 60 * 24 * 365;

function readCookie(): Theme | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|;\\s*)" + COOKIE_NAME + "=([^;]+)")
  );
  const value = match ? decodeURIComponent(match[1]) : null;
  return value === "dark" || value === "light" ? value : null;
}

function writeCookie(theme: Theme) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function useTheme() {
  // Source of truth on first render is the `dark` class on <html>, which the
  // server already set from the cookie. So state and DOM agree from the start.
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
      return "dark";
    }
    const cookieTheme = readCookie();
    return cookieTheme ?? "light";
  });

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    writeCookie(next);
  }

  return { theme, toggle };
}
