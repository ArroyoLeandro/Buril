import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { Button } from "../registry/ui/button";
import { setTheme, themes } from "./browser";

// Ink on paper in light mode, bone on night in dark mode (`registry/styles/buril.css`).
const primary = { light: "rgb(26, 23, 20)", dark: "rgb(237, 230, 218)" };

describe("browser test setup", () => {
  it("runs in a real browser that lays elements out", async () => {
    const screen = await render(<Button>Save</Button>);
    const box = screen.getByRole("button").element().getBoundingClientRect();
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  });

  it.each(themes)("applies the compiled Tailwind classes and the %s theme", async (theme) => {
    setTheme(theme);
    const screen = await render(<Button>Save</Button>);
    const button = screen.getByRole("button").element();
    expect(getComputedStyle(button).backgroundColor).toBe(primary[theme]);
  });
});
