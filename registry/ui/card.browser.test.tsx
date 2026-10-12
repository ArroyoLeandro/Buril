import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import {
  isSoftSpring,
  setReducedMotion,
  settle,
  themes,
  setTheme,
  transitionTiming,
} from "../../test/browser";
import { Card, CardDescription, CardHeader, CardTitle } from "./card";

function Article({ interactive = true }: { interactive?: boolean }) {
  return (
    <Card interactive={interactive} data-testid="card">
      <CardHeader>
        <CardTitle>
          <a href="#forms" className="after:absolute after:inset-0">
            Accessible forms
          </a>
        </CardTitle>
        <CardDescription>Labels, errors and live regions.</CardDescription>
      </CardHeader>
    </Card>
  );
}

/** The card's rest and active look: how far it is lifted and how visible its shadow is. */
function look(card: Element) {
  const overlay = getComputedStyle(card, "::after");
  return {
    translate: getComputedStyle(card).translate,
    shadow: overlay.content === "none" ? undefined : Number(overlay.opacity),
  };
}

describe("Card hover in a real browser", () => {
  it.each(themes)(
    "lifts an interactive card and shows its shadow on hover in %s mode",
    async (theme) => {
      setTheme(theme);
      await setReducedMotion(false);
      const screen = await render(<Article />);
      const card = screen.getByTestId("card").element();
      expect(look(card)).toEqual({ translate: "none", shadow: 0 });
      const lift = transitionTiming(card, "translate");
      expect(lift?.duration).toBe(420);
      expect(isSoftSpring(lift!.easing), lift!.easing).toBe(true);
      expect(transitionTiming(card, "opacity", "::after")?.duration).toBe(200);
      expect(transitionTiming(card, "box-shadow", "::after")).toBeUndefined();

      await userEvent.hover(screen.getByRole("link"));
      await settle();
      expect(look(card)).toEqual({ translate: "0px -4.5px", shadow: 1 });
      expect(getComputedStyle(card, "::after").boxShadow).not.toBe("none");
    },
  );

  it("gives keyboard focus the same lift and shadow as hover", async () => {
    await setReducedMotion(false);
    const screen = await render(<Article />);
    const card = screen.getByTestId("card").element();
    await userEvent.tab();
    expect(screen.getByRole("link").element().matches(":focus-visible")).toBe(true);
    await settle();
    expect(look(card)).toEqual({ translate: "0px -4.5px", shadow: 1 });
  });

  it("keeps only the shadow under reduced motion", async () => {
    await setReducedMotion(true);
    const screen = await render(<Article />);
    const card = screen.getByTestId("card").element();
    expect(transitionTiming(card, "translate")).toBeUndefined();
    await userEvent.hover(screen.getByRole("link"));
    await settle();
    expect(look(card)).toEqual({ translate: "none", shadow: 1 });
  });

  it("never moves a static card", async () => {
    await setReducedMotion(false);
    const screen = await render(<Article interactive={false} />);
    const card = screen.getByTestId("card").element();
    await userEvent.hover(screen.getByRole("link"));
    await settle();
    expect(look(card)).toEqual({ translate: "none", shadow: undefined });
    expect(card.getAnimations()).toEqual([]);
  });

  // The stretched link still covers the card: the overlay never takes the click.
  it("keeps the whole interactive card clickable through its link", async () => {
    const screen = await render(<Article />);
    const card = screen.getByTestId("card").element();
    const box = card.getBoundingClientRect();
    const hit = document.elementFromPoint(box.right - 8, box.bottom - 8);
    expect(hit).toBe(screen.getByRole("link").element());
  });
});
