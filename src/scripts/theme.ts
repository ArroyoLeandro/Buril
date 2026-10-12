/**
 * Docs-site theme switching. Buril's CSS reads `.dark` and `.light` on <html>; with neither
 * class, a `prefers-color-scheme` media query follows the system. "system" therefore means
 * "remove both classes", not "detect and copy the system value".
 */
export const THEME_KEY = "buril-theme";

export const themeChoices = ["light", "dark", "system"] as const;
export type ThemeChoice = (typeof themeChoices)[number];

const isChoice = (value: unknown): value is ThemeChoice =>
  themeChoices.includes(value as ThemeChoice);

/** localStorage can be missing or throw (private modes, blocked site data). */
function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function applyTheme(choice: ThemeChoice, root = document.documentElement) {
  root.classList.toggle("dark", choice === "dark");
  root.classList.toggle("light", choice === "light");
}

export function readTheme(): ThemeChoice {
  try {
    const stored = storage()?.getItem(THEME_KEY);
    return isChoice(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function storeTheme(choice: ThemeChoice) {
  try {
    if (choice === "system") storage()?.removeItem(THEME_KEY);
    else storage()?.setItem(THEME_KEY, choice);
  } catch {
    // The choice still applies for this page view.
  }
}

/** Wires a group of `[data-theme-choice]` buttons. Pressed state uses `aria-pressed`. */
export function initThemeToggle(group: HTMLElement) {
  const buttons = [...group.querySelectorAll<HTMLButtonElement>("[data-theme-choice]")];
  const mark = (choice: ThemeChoice) => {
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === choice));
    }
  };

  mark(readTheme());
  for (const button of buttons) {
    button.addEventListener("click", () => {
      const choice = button.dataset.themeChoice;
      if (!isChoice(choice)) return;
      applyTheme(choice);
      storeTheme(choice);
      mark(choice);
    });
  }
}

/**
 * Inline <head> script that applies the stored choice before first paint, so a stored "light"
 * on a dark system does not flash dark. It must be self-contained: it runs before any bundle.
 */
export const noFlashScript = `(function () {
  try {
    var choice = localStorage.getItem(${JSON.stringify(THEME_KEY)});
    var root = document.documentElement;
    root.classList.toggle("dark", choice === "dark");
    root.classList.toggle("light", choice === "light");
  } catch (error) {}
})();`;
