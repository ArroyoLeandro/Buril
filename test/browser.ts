/** Helpers for the real-browser tests (`*.browser.test.tsx`, run with `pnpm test:browser`). */

export const themes = ["light", "dark"] as const;
export type Theme = (typeof themes)[number];

/** Switch the Buril theme the way the docs do: `.dark` on `<html>`. */
export function setTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}
