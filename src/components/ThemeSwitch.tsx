"use client";

import { useTheme } from "@/hooks/useTheme";

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function ThemeSwitch() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#B923AE]/40"
    >
      {/* Sun glyph (left of the track, faded when dark) */}
      <span
        className={`absolute left-1.5 top-1/2 -translate-y-1/2 transition-opacity ${
          isDark ? "opacity-40 text-gray-400" : "opacity-0"
        }`}
        aria-hidden
      >
        <SunIcon />
      </span>
      {/* Moon glyph (right of the track, faded when light) */}
      <span
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 transition-opacity ${
          isDark ? "opacity-0" : "opacity-40 text-gray-500"
        }`}
        aria-hidden
      >
        <MoonIcon />
      </span>
      {/* Sliding thumb with the active icon */}
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white dark:bg-[#1a1f29] shadow flex items-center justify-center transition-transform ${
          isDark ? "translate-x-6 text-yellow-200" : "translate-x-0 text-amber-500"
        }`}
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}
