import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  THEME_KEY,
  applyTheme,
  initThemeCycle,
  initThemeToggle,
  nextTheme,
  noFlashScript,
  noFlashScriptFor,
  readTheme,
} from "./theme";

const root = document.documentElement;

function renderToggle() {
  document.body.innerHTML = `
    <div role="group" aria-label="Theme" data-theme-toggle>
      <button type="button" data-theme-choice="light" aria-pressed="false">Light</button>
      <button type="button" data-theme-choice="dark" aria-pressed="false">Dark</button>
      <button type="button" data-theme-choice="system" aria-pressed="true">System</button>
    </div>`;
  const group = document.querySelector<HTMLElement>("[data-theme-toggle]")!;
  const button = (name: string) =>
    group.querySelector<HTMLButtonElement>(`[data-theme-choice="${name}"]`)!;
  return { group, button };
}

const pressed = (group: HTMLElement) =>
  [...group.querySelectorAll("button")]
    .filter((button) => button.getAttribute("aria-pressed") === "true")
    .map((button) => button.dataset.themeChoice);

beforeEach(() => {
  localStorage.clear();
  root.className = "";
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("applyTheme", () => {
  it("sets .dark for dark and .light for light, never both", () => {
    applyTheme("dark");
    expect([...root.classList]).toEqual(["dark"]);
    applyTheme("light");
    expect([...root.classList]).toEqual(["light"]);
  });

  it("removes both classes for system, so the CSS media query decides", () => {
    root.classList.add("dark");
    applyTheme("system");
    expect(root.classList.contains("dark")).toBe(false);
    expect(root.classList.contains("light")).toBe(false);
  });
});

describe("readTheme", () => {
  it("returns the stored choice", () => {
    localStorage.setItem(THEME_KEY, "dark");
    expect(readTheme()).toBe("dark");
  });

  it("falls back to system for missing or unknown values", () => {
    expect(readTheme()).toBe("system");
    localStorage.setItem(THEME_KEY, "sepia");
    expect(readTheme()).toBe("system");
  });

  it("falls back to system when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readTheme()).toBe("system");
  });
});

describe("initThemeToggle", () => {
  it("marks the stored choice as pressed on load", () => {
    localStorage.setItem(THEME_KEY, "light");
    const { group } = renderToggle();
    initThemeToggle(group);
    expect(pressed(group)).toEqual(["light"]);
  });

  it("applies, stores and marks a choice when a button is pressed", () => {
    const { group, button } = renderToggle();
    initThemeToggle(group);

    button("dark").click();
    expect(root.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(pressed(group)).toEqual(["dark"]);

    button("system").click();
    expect(root.className).toBe("");
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
    expect(pressed(group)).toEqual(["system"]);
  });

  it("still switches the theme when storage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const { group, button } = renderToggle();
    initThemeToggle(group);
    button("light").click();
    expect(root.classList.contains("light")).toBe(true);
    expect(pressed(group)).toEqual(["light"]);
  });
});

describe("nextTheme", () => {
  it("cycles light, dark, system and back to light", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("system");
    expect(nextTheme("system")).toBe("light");
  });
});

describe("initThemeCycle", () => {
  const labels = { light: "Theme: Light", dark: "Theme: Dark", system: "Theme: System" };

  function renderCycle() {
    document.body.innerHTML = `
      <div role="group" aria-label="Theme" data-theme-toggle>
        <button type="button" data-theme-choice="light" aria-pressed="false">Light</button>
        <button type="button" data-theme-choice="dark" aria-pressed="false">Dark</button>
        <button type="button" data-theme-choice="system" aria-pressed="true">System</button>
      </div>
      <button type="button" data-theme-cycle hidden aria-label="${labels.system}"
        data-labels='${JSON.stringify(labels)}'>
        <span data-theme-icon="light" hidden></span>
        <span data-theme-icon="dark" hidden></span>
        <span data-theme-icon="system"></span>
      </button>
      <span role="status" data-theme-status></span>`;
    const cycle = document.querySelector<HTMLButtonElement>("[data-theme-cycle]")!;
    const status = document.querySelector<HTMLElement>("[data-theme-status]")!;
    const group = document.querySelector<HTMLElement>("[data-theme-toggle]")!;
    const shownIcons = () =>
      [...cycle.querySelectorAll<HTMLElement>("[data-theme-icon]")]
        .filter((icon) => !icon.hasAttribute("hidden"))
        .map((icon) => icon.dataset.themeIcon);
    return { cycle, status, group, shownIcons };
  }

  it("names the button with the stored choice and shows its icon", () => {
    localStorage.setItem(THEME_KEY, "dark");
    const { cycle, status, shownIcons } = renderCycle();
    initThemeCycle(cycle, status);
    expect(cycle.getAttribute("aria-label")).toBe("Theme: Dark");
    expect(shownIcons()).toEqual(["dark"]);
    // Nothing is announced on load: the name already carries the state.
    expect(status.textContent).toBe("");
  });

  it("moves to the next choice on each press, applies and stores it and announces it", () => {
    const { cycle, status, shownIcons } = renderCycle();
    initThemeCycle(cycle, status);

    cycle.click();
    expect(root.classList.contains("light")).toBe(true);
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
    expect(cycle.getAttribute("aria-label")).toBe("Theme: Light");
    expect(shownIcons()).toEqual(["light"]);
    expect(status.textContent).toBe("Theme: Light");

    cycle.click();
    expect(root.classList.contains("dark")).toBe(true);
    expect(status.textContent).toBe("Theme: Dark");

    cycle.click();
    expect(root.className).toBe("");
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
    expect(cycle.getAttribute("aria-label")).toBe("Theme: System");
  });

  it("keeps the button group and the cycle button in step", () => {
    const { cycle, status, group } = renderCycle();
    initThemeToggle(group);
    initThemeCycle(cycle, status);

    cycle.click();
    expect(pressed(group)).toEqual(["light"]);

    group.querySelector<HTMLButtonElement>('[data-theme-choice="dark"]')!.click();
    expect(cycle.getAttribute("aria-label")).toBe("Theme: Dark");
  });
});

describe("noFlashScript", () => {
  const run = () => new Function(noFlashScript)();

  it("applies the stored choice before the page renders", () => {
    localStorage.setItem(THEME_KEY, "dark");
    run();
    expect([...root.classList]).toEqual(["dark"]);
  });

  it("can read another storage key, such as next-themes' `theme`", () => {
    localStorage.setItem("theme", "light");
    new Function(noFlashScriptFor("theme"))();
    expect([...root.classList]).toEqual(["light"]);
    expect(noFlashScriptFor(THEME_KEY)).toBe(noFlashScript);
  });

  it("does nothing for system and never throws when storage is blocked", () => {
    run();
    expect(root.className).toBe("");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(run).not.toThrow();
  });
});
