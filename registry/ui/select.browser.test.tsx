import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import {
  contrast,
  isSoftSpring,
  setReducedMotion,
  setTheme,
  settle,
  themes,
  transitionTiming,
} from "../../test/browser";
import { Select } from "./select";

describe("Select in a real browser", () => {
  it.each(themes)(
    "shows the chevron upright, inside the field and centered, in %s mode",
    async (theme) => {
      setTheme(theme);
      const screen = await render(
        <label>
          Country
          <Select defaultValue="ar">
            <option value="ar">Argentina</option>
            <option value="uy">Uruguay</option>
          </Select>
        </label>,
      );
      const select = screen.getByRole("combobox").element();
      const chevron = select.parentElement!.querySelector("svg")!;
      const field = select.getBoundingClientRect();
      const box = chevron.getBoundingClientRect();
      expect(box.width).toBe(16);
      expect(box.right).toBeCloseTo(field.right - 12, 0);
      expect((box.top + box.bottom) / 2).toBeCloseTo((field.top + field.bottom) / 2, 0);
      expect(getComputedStyle(chevron).rotate).toBe("none");
      expect(
        contrast(getComputedStyle(chevron).color, getComputedStyle(select).backgroundColor),
      ).toBeGreaterThanOrEqual(3);
    },
  );

  // Chromium supports `:open` on a select, so the turn can be checked while the picker is open.
  it("turns the chevron over while the picker is open, and keeps it centered", async () => {
    const screen = await render(
      <label>
        Country
        <Select defaultValue="ar">
          <option value="ar">Argentina</option>
          <option value="uy">Uruguay</option>
        </Select>
      </label>,
    );
    const select = screen.getByRole("combobox");
    const chevron = select.element().parentElement!.querySelector("svg")!;
    await select.click();
    await settle();
    expect(select.element().matches(":open")).toBe(true);
    expect(getComputedStyle(chevron).rotate).toBe("180deg");
    const field = select.element().getBoundingClientRect();
    const box = chevron.getBoundingClientRect();
    expect((box.top + box.bottom) / 2).toBeCloseTo((field.top + field.bottom) / 2, 0);
    expect(box.right).toBeCloseTo(field.right - 12, 0);
  });
});

describe("Select chevron motion in a real browser", () => {
  async function renderChevron() {
    const screen = await render(
      <label>
        Country
        <Select defaultValue="ar">
          <option value="ar">Argentina</option>
        </Select>
      </label>,
    );
    return screen.getByRole("combobox").element().parentElement!.querySelector("svg")!;
  }

  it("turns over 420ms with the soft spring", async () => {
    await setReducedMotion(false);
    const timing = transitionTiming(await renderChevron(), "rotate");
    expect(timing?.duration).toBe(420);
    expect(isSoftSpring(timing!.easing), timing!.easing).toBe(true);
  });

  it("does not turn under reduced motion", async () => {
    await setReducedMotion(true);
    expect(transitionTiming(await renderChevron(), "rotate")).toBeUndefined();
  });
});
