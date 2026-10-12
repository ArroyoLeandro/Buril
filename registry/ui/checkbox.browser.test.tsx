import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import {
  isSoftSpring,
  paintOf,
  setReducedMotion,
  setTheme,
  settle,
  themes,
  transitionTiming,
} from "../../test/browser";
import { Checkbox } from "./checkbox";

describe("Checkbox in a real browser", () => {
  // The check is drawn by its dash offset: 1.1 leaves the whole path in the gap, 0.1 covers it.
  it.each(themes)("draws the whole check when checked in %s mode", async (theme) => {
    setTheme(theme);
    const screen = await render(
      <label>
        <Checkbox /> Accept the terms
      </label>,
    );
    const box = screen.getByRole("checkbox").element();
    const check = box.parentElement!.querySelector("svg")!;
    const path = check.querySelector("path")!;
    const ink = getComputedStyle(check).color;
    expect(getComputedStyle(check).visibility).toBe("hidden");
    expect(getComputedStyle(path).strokeDashoffset).toBe("1.1px");

    await screen.getByRole("checkbox").click();
    await settle();
    expect(getComputedStyle(check).visibility).toBe("visible");
    expect(getComputedStyle(path).strokeDashoffset).toBe("0.1px");
    // Checked, the box is filled with primary, so pixels in the check color can only be the
    // stroke. The drawn check paints as many of them as the same path without any dash.
    const drawn = (await paintOf(box)).count(ink);
    check.style.strokeDasharray = "none";
    const solid = (await paintOf(box)).count(ink);
    expect(solid).toBeGreaterThan(8);
    expect(Math.abs(drawn - solid)).toBeLessThanOrEqual(2);
  });
});

describe("Checkbox motion in a real browser", () => {
  async function renderCheckbox() {
    const screen = await render(
      <label>
        <Checkbox /> Accept the terms
      </label>,
    );
    const box = screen.getByRole("checkbox").element();
    const [check, dash] = box.parentElement!.querySelectorAll("svg");
    return { screen, box, check: check!, dash: dash! };
  }

  it("draws the check over 420ms with the soft spring and fades the fill with it", async () => {
    await setReducedMotion(false);
    const { box, check, dash } = await renderCheckbox();
    for (const [element, property] of [
      [check, "stroke-dashoffset"],
      [dash, "scale"],
      [box, "background-color"],
      [box, "border-color"],
    ] as const) {
      const timing = transitionTiming(element, property);
      expect(timing?.duration, property).toBe(420);
      expect(isSoftSpring(timing!.easing), timing!.easing).toBe(true);
    }
  });

  // The spring passes its target by about 3%. Past the end of the draw the dash must still cover
  // the whole path, or the start of the check would flicker out at the peak.
  it("keeps the whole check drawn while the spring passes its target", async () => {
    await setReducedMotion(false);
    const { screen, check } = await renderCheckbox();
    await screen.getByRole("checkbox").click();
    const draw = check.getAnimations()[0]!;
    draw.pause();
    // The spring peaks at 14/24 of its stops.
    draw.currentTime = (420 * 14) / 24;
    const path = check.querySelector("path")!;
    const offset = parseFloat(getComputedStyle(path).strokeDashoffset);
    const [dashLength = 0] = getComputedStyle(path)
      .strokeDasharray.split(/[,\s]+/)
      .map((value) => parseFloat(value));
    // The path is 1 long: it is fully drawn while [offset, offset + 1] stays inside the dash.
    expect(offset).toBeLessThan(0.1);
    expect(offset).toBeGreaterThanOrEqual(0);
    expect(offset + 1).toBeLessThanOrEqual(dashLength);
    draw.finish();
  });

  it("shows the check and the dash at once under reduced motion; the fill still fades", async () => {
    await setReducedMotion(true);
    const { box, check, dash } = await renderCheckbox();
    expect(transitionTiming(check, "stroke-dashoffset")).toBeUndefined();
    expect(transitionTiming(dash, "scale")).toBeUndefined();
    expect(transitionTiming(box, "background-color")?.duration).toBe(420);
  });
});
