import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { paintOf, setTheme, settle, themes } from "../../test/browser";
import { Checkbox } from "./checkbox";

describe("Checkbox in a real browser", () => {
  // The check is drawn by its dash offset: 1 hides the whole path, 0 shows it.
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
    expect(getComputedStyle(path).strokeDashoffset).toBe("1px");

    await screen.getByRole("checkbox").click();
    await settle();
    expect(getComputedStyle(check).visibility).toBe("visible");
    expect(getComputedStyle(path).strokeDashoffset).toBe("0px");
    // Checked, the box is filled with primary, so pixels in the check color can only be the
    // stroke. The drawn check paints as many of them as the same path without any dash.
    const drawn = (await paintOf(box)).count(ink);
    check.style.strokeDasharray = "none";
    const solid = (await paintOf(box)).count(ink);
    expect(solid).toBeGreaterThan(8);
    expect(Math.abs(drawn - solid)).toBeLessThanOrEqual(2);
  });
});
