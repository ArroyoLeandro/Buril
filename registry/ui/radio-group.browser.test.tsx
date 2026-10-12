import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import {
  isSoftSpring,
  paintOf,
  sameColor,
  setReducedMotion,
  setTheme,
  settle,
  themes,
  tokenColor,
  transitionTiming,
} from "../../test/browser";
import { RadioGroup, RadioGroupItem } from "./radio-group";

describe("RadioGroup in a real browser", () => {
  // The dot is the primary fill left inside an inset ring in the background color.
  it.each(themes)("shows the dot in the center of a checked radio in %s mode", async (theme) => {
    setTheme(theme);
    const screen = await render(
      <RadioGroup legend="Plan">
        <RadioGroupItem value="free">Free</RadioGroupItem>
        <RadioGroupItem value="pro">Pro</RadioGroupItem>
      </RadioGroup>,
    );
    const radio = screen.getByRole("radio", { name: "Pro" });
    const element = radio.element();
    const background = tokenColor("--background");
    const primary = tokenColor("--primary");
    const center = async () => {
      const paint = await paintOf(element);
      return paint.at(paint.width / 2, paint.height / 2);
    };
    expect(sameColor(await center(), background)).toBe(true);

    await radio.click();
    await settle();
    const paint = await paintOf(element);
    expect(sameColor(paint.at(paint.width / 2, paint.height / 2), primary)).toBe(true);
    // 3px in from the edge is the ring, in the background color, so the dot stands apart.
    expect(sameColor(paint.at(3, paint.height / 2), background)).toBe(true);
  });
});

describe("RadioGroup motion in a real browser", () => {
  async function renderRadio() {
    const screen = await render(
      <RadioGroup legend="Plan">
        <RadioGroupItem value="free">Free</RadioGroupItem>
      </RadioGroup>,
    );
    return screen.getByRole("radio", { name: "Free" }).element();
  }

  // The ink drop is the inset ring shrinking, so the dot spreads from the center.
  it("spreads the ink drop over 420ms with the soft spring", async () => {
    await setReducedMotion(false);
    const radio = await renderRadio();
    for (const property of ["box-shadow", "background-color", "border-color"]) {
      const timing = transitionTiming(radio, property);
      expect(timing?.duration, property).toBe(420);
      expect(isSoftSpring(timing!.easing), timing!.easing).toBe(true);
    }
  });

  it("drops the ink at once under reduced motion, while the colors still fade", async () => {
    await setReducedMotion(true);
    const radio = await renderRadio();
    expect(transitionTiming(radio, "box-shadow")).toBeUndefined();
    expect(transitionTiming(radio, "background-color")?.duration).toBe(420);
  });
});
