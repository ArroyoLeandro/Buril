import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { contrast, setTheme, settle, themes } from "../../test/browser";
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
