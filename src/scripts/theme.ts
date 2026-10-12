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

/** Fired on `document` after every choice, so every theme control on the page shows it. */
const THEME_EVENT = "buril-theme-change";

/** Applies and stores a choice, then tells every theme control on the page. */
function choose(choice: ThemeChoice) {
  applyTheme(choice);
  storeTheme(choice);
  document.dispatchEvent(new CustomEvent<ThemeChoice>(THEME_EVENT, { detail: choice }));
}

/** Calls `update` with every choice made from any theme control on the page. */
function onThemeChange(update: (choice: ThemeChoice) => void) {
  document.addEventListener(THEME_EVENT, (event) => {
    const choice = (event as CustomEvent<unknown>).detail;
    if (isChoice(choice)) update(choice);
  });
}

/** The choice after `choice`, for a single button that cycles them all. */
export function nextTheme(choice: ThemeChoice): ThemeChoice {
  return themeChoices[(themeChoices.indexOf(choice) + 1) % themeChoices.length]!;
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
  onThemeChange(mark);
  for (const button of buttons) {
    button.addEventListener("click", () => {
      const choice = button.dataset.themeChoice;
      if (isChoice(choice)) choose(choice);
    });
  }
}

/**
 * Wires the compact theme control: one icon button that moves to the next choice on each press.
 * Its name carries the current choice ("Theme: Dark", from `data-labels`), so the state is read
 * whenever the button gets focus. Some screen readers do not read a focused button's new name,
 * so each press is also announced from `status`, a status region that is on the page from the
 * start. Only the icon of the current choice is shown; all of them are decorative.
 */
export function initThemeCycle(button: HTMLButtonElement, status: HTMLElement) {
  let labels: Partial<Record<ThemeChoice, string>> = {};
  try {
    labels = JSON.parse(button.dataset.labels ?? "{}") as typeof labels;
  } catch {
    // Without labels the button keeps the name it was rendered with.
  }
  const icons = [...button.querySelectorAll<HTMLElement>("[data-theme-icon]")];
  let current = readTheme();

  const show = (choice: ThemeChoice) => {
    current = choice;
    const label = labels[choice];
    if (label) button.setAttribute("aria-label", label);
    for (const icon of icons) icon.toggleAttribute("hidden", icon.dataset.themeIcon !== choice);
  };

  show(current);
  onThemeChange(show);
  button.addEventListener("click", () => {
    choose(nextTheme(current));
    status.textContent = labels[current] ?? "";
  });
}

/**
 * Inline <head> script that applies the choice stored under `key` before first paint, so a stored
 * "light" on a dark system does not flash dark. It must be self-contained: it runs before any
 * bundle. "system", or nothing stored, sets no class, and the theme's media query decides.
 */
export const noFlashScriptFor = (key: string) => `(function () {
  try {
    var choice = localStorage.getItem(${JSON.stringify(key)});
    var root = document.documentElement;
    root.classList.toggle("dark", choice === "dark");
    root.classList.toggle("light", choice === "light");
  } catch (error) {}
})();`;

/** This site's no-flash script, for the choice stored under `buril-theme`. */
export const noFlashScript = noFlashScriptFor(THEME_KEY);
