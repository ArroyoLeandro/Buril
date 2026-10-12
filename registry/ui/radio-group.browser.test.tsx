import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { paintOf, sameColor, setTheme, settle, themes, tokenColor } from "../../test/browser";
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
