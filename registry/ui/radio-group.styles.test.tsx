// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
import {
  durations,
  easings,
  expectInstantFocusRing,
  motionAllowed,
  motionReduced,
  transitionOf,
} from "../../test/motion-assertions";
import { RadioGroup, RadioGroupItem } from "./radio-group";

let cascade: Awaited<ReturnType<typeof createCascade>>;

beforeAll(async () => {
  cascade = await createCascade();
});

const html = renderToStaticMarkup(
  <RadioGroup legend="Delivery">
    <RadioGroupItem value="standard">Standard</RadioGroupItem>
  </RadioGroup>,
);
const classesOf = (tag: RegExp) => classList(/class="([^"]*)"/.exec(tag.exec(html)![0])![1]!);

const legend = classesOf(/<legend[^>]*>/);
const row = classesOf(/<label[^>]*>/);
const dot = classesOf(/<input[^>]*>/);
const checked = { states: [":checked"] };

describe("RadioGroup compiled with Tailwind", () => {
  it("uses the body font for the legend, never the display font", () => {
    expect(cascade.computed(legend, "font-family")).toBeUndefined();
    expect(cascade.computed(legend, "font-weight")).toBe("var(--font-weight-semibold)");
  });

  it("makes each label row at least 24px tall, so the row is the click target", () => {
    expect(cascade.computed(row, "min-height")).toBe("calc(var(--spacing) * 6)");
  });

  it("draws a 20px circle with an input-colored border instead of the native radio", () => {
    expect(cascade.computed(dot, "appearance")).toBe("none");
    expect(cascade.computed(dot, "width")).toBe("calc(var(--spacing) * 5)");
    expect(cascade.computed(dot, "height")).toBe("calc(var(--spacing) * 5)");
    expect(cascade.computed(dot, "border-radius")).toBe("calc(infinity * 1px)");
    expect(cascade.computed(dot, "border-color")).toBe("var(--input)");
    expect(cascade.computed(dot, "background-color")).toBe("var(--background)");
  });

  // An inset ring in the background color over a primary fill leaves a primary dot in the middle.
  it("shows a primary dot inside a primary border when checked", () => {
    expect(cascade.computed(dot, "background-color", checked)).toBe("var(--primary)");
    expect(cascade.computed(dot, "border-color", checked)).toBe("var(--primary)");
    expect(cascade.computed(dot, "--tw-inset-ring-shadow", checked)).toMatch(
      /^inset 0 0 0 4px var\(--tw-inset-ring-color/,
    );
    expect(cascade.computed(dot, "--tw-inset-ring-color", checked)).toBe("var(--background)");
    expect(cascade.computed(dot, "--tw-inset-ring-shadow")).toBeUndefined();
  });

  it("shows a 2px ring outline with an offset on keyboard focus", () => {
    const focus = { states: [":focus", ":focus-visible"] };
    expect(cascade.computed(dot, "outline-color", focus)).toBe("var(--ring)");
    expect(cascade.computed(dot, "outline-width", focus)).toBe("2px");
    expect(cascade.computed(dot, "outline-offset", focus)).toBe("2px");
  });

  it("turns the border destructive when invalid, even while checked", () => {
    const invalid = '[aria-invalid="true"]';
    expect(cascade.computed(dot, "border-color", { states: [invalid] })).toBe("var(--destructive)");
    expect(cascade.computed(dot, "border-color", { states: [":checked", invalid] })).toBe(
      "var(--destructive)",
    );
  });

  it("dims the whole row once when its radio is disabled", () => {
    expect(cascade.computed(row, "opacity", { states: [":has(:disabled)"] })).toBe("50%");
    expect(cascade.computed(dot, "opacity", { states: [":disabled"] })).toBeUndefined();
  });

  // Forced colors drop backgrounds and box shadows, so the dot would vanish.
  it("falls back to the native radio in forced-colors mode", () => {
    expect(cascade.computed(dot, "appearance", { forcedColors: true })).toBe("auto");
  });
});

// The ink drop: while unchecked and motion is allowed, a background-colored inset ring fills the
// whole 18px inside of the circle. Checking shrinks it to 4px, so the primary dot spreads out
// from the center. Under reduced motion the ring jumps and only the colors fade.
describe("RadioGroup ink drop", () => {
  const focus = { states: [":focus", ":focus-visible"] };

  it("fills the inside with a background ring while unchecked, only when motion is allowed", () => {
    const unchecked = { states: [":not(:checked)"] };
    expect(
      cascade.computed(dot, "--tw-inset-ring-shadow", { ...unchecked, ...motionAllowed }),
    ).toMatch(/^inset 0 0 0 9px var\(--tw-inset-ring-color/);
    expect(cascade.computed(dot, "--tw-inset-ring-color")).toBe("var(--background)");
    expect(
      cascade.computed(dot, "--tw-inset-ring-shadow", { ...unchecked, ...motionReduced }),
    ).toBeUndefined();
  });

  it("shrinks the ring to 4px when checked, in every motion mode", () => {
    for (const options of [
      checked,
      { ...checked, ...motionAllowed },
      { ...checked, ...motionReduced },
    ]) {
      expect(cascade.computed(dot, "--tw-inset-ring-shadow", options)).toMatch(
        /^inset 0 0 0 4px var\(--tw-inset-ring-color/,
      );
    }
  });

  it("fades the colors in every mode and the ring only when motion is allowed", () => {
    for (const options of [{}, focus, motionReduced]) {
      const transition = transitionOf(cascade.computed, dot, options);
      expectInstantFocusRing(transition.properties);
      expect(transition.properties).toEqual(["background-color", "border-color"]);
      expect(transition.durations).toEqual([durations.base]);
      expect(transition.easings).toEqual([easings.out]);
    }
    const allowed = transitionOf(cascade.computed, dot, motionAllowed);
    expectInstantFocusRing(allowed.properties);
    expect(allowed.properties).toEqual(["background-color", "border-color", "box-shadow"]);
    expect(allowed.durations).toEqual([durations.base]);
    expect(allowed.easings).toEqual([easings.out]);
  });
});
