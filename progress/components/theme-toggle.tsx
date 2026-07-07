"use client";

import * as React from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-10 h-10 border-4 border-black bg-white" />; // Placeholder
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="fixed top-4 right-4 z-50 p-2 border-4 border-black dark:border-white bg-[#ffd93d] dark:bg-[#14110d] shadow-[4px_4px_0_0_#14110d] dark:shadow-[4px_4px_0_0_#ffffff] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#14110d] dark:hover:shadow-[6px_6px_0_0_#ffffff] active:translate-y-1 active:shadow-none transition-all"
      aria-label="Toggle theme"
    >
      <span className="text-xl font-black">{isDark ? "☀️" : "🌙"}</span>
    </button>
  );
}
