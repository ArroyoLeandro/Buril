// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
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

  it("dims the whole row once when its radio is disabled", () => {
    expect(cascade.computed(row, "opacity", { states: [":has(:disabled)"] })).toBe("50%");
    expect(cascade.computed(dot, "opacity", { states: [":disabled"] })).toBeUndefined();
  });

  // Forced colors drop backgrounds and box shadows, so the dot would vanish.
  it("falls back to the native radio in forced-colors mode", () => {
    expect(cascade.computed(dot, "appearance", { forcedColors: true })).toBe("auto");
  });
});
