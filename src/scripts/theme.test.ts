import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { THEME_KEY, applyTheme, initThemeToggle, noFlashScript, readTheme } from "./theme";

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

describe("noFlashScript", () => {
  const run = () => new Function(noFlashScript)();

  it("applies the stored choice before the page renders", () => {
    localStorage.setItem(THEME_KEY, "dark");
    run();
    expect([...root.classList]).toEqual(["dark"]);
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
