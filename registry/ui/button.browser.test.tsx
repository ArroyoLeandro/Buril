import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import { contrast, setTheme, settle, themes, tokenColor } from "../../test/browser";
import { Button } from "./button";

const ringParts = ["outline-color", "outline-width", "outline-style", "outline-offset", "outline"];

describe("Button in a real browser", () => {
  it.each(themes)(
    "shows the focus outline at once and at full contrast on Tab in %s mode",
    async (theme) => {
      setTheme(theme);
      const screen = await render(<Button>Save</Button>);
      const button = screen.getByRole("button").element();
      await userEvent.tab();
      expect(document.activeElement).toBe(button);
      expect(button.matches(":focus-visible")).toBe(true);

      // Nothing transitions the outline, and its first frame is already the final one.
      const transitions = button
        .getAnimations()
        .filter((animation) => animation instanceof CSSTransition)
        .map((animation) => (animation as CSSTransition).transitionProperty);
      expect(transitions.filter((property) => ringParts.includes(property))).toEqual([]);
      const first = getComputedStyle(button);
      const [color, width, style] = [first.outlineColor, first.outlineWidth, first.outlineStyle];
      expect(width).toBe("2px");
      expect(style).toBe("solid");
      await settle();
      expect(getComputedStyle(button).outlineColor).toBe(color);

      expect(contrast(color, tokenColor("--background"))).toBeGreaterThanOrEqual(3);
    },
  );
});
