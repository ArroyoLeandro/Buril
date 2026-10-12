// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
import { SkipLink } from "./skip-link";

let cascade: Awaited<ReturnType<typeof createCascade>>;

beforeAll(async () => {
  cascade = await createCascade();
});

const classes = classList(/class="([^"]*)"/.exec(renderToStaticMarkup(<SkipLink />))![1]!);
// A keyboard-focused link matches both pseudo-classes.
const focused = { states: [":focus", ":focus-visible"] };

describe("SkipLink compiled with Tailwind", () => {
  it("is visually hidden but still in the accessibility tree by default", () => {
    expect(cascade.computed(classes, "position")).toBe("absolute");
    expect(cascade.computed(classes, "width")).toBe("1px");
    expect(cascade.computed(classes, "clip-path")).toBe("inset(50%)");
    // Hidden with clipping, never with display or visibility, so screen readers still reach it.
    expect(cascade.computed(classes, "display")).toBeUndefined();
    expect(cascade.computed(classes, "visibility")).toBeUndefined();
  });

  it("stays hidden on mouse focus without :focus-visible", () => {
    expect(cascade.computed(classes, "clip-path", { states: [":focus"] })).toBe("inset(50%)");
  });

  it("shows fixed at the top left, above sticky UI, on keyboard focus", () => {
    expect(cascade.computed(classes, "clip-path", focused)).toBe("none");
    expect(cascade.computed(classes, "width", focused)).toBe("auto");
    expect(cascade.computed(classes, "position", focused)).toBe("fixed");
    expect(cascade.computed(classes, "top", focused)).toBe("calc(var(--spacing) * 4)");
    expect(cascade.computed(classes, "left", focused)).toBe("calc(var(--spacing) * 4)");
    expect(Number(cascade.computed(classes, "z-index", focused))).toBeGreaterThanOrEqual(100);
  });

  it("has a solid background, readable text, a border and the ring outline when shown", () => {
    expect(cascade.computed(classes, "background-color", focused)).toBe("var(--background)");
    expect(cascade.computed(classes, "color", focused)).toBe("var(--foreground)");
    expect(cascade.computed(classes, "border-color", focused)).toBe("var(--border)");
    expect(cascade.computed(classes, "border-width", focused)).toBe("1px");
    expect(cascade.computed(classes, "outline-color", focused)).toBe("var(--ring)");
    expect(cascade.computed(classes, "outline-width", focused)).toBe("2px");
  });

  // not-sr-only resets `padding: 0`, so padding must come after it in the generated CSS.
  it("keeps its padding when shown", () => {
    expect(cascade.lastOf(classes, ["padding", "padding-inline"], focused)).toEqual({
      property: "padding-inline",
      value: "calc(var(--spacing) * 4)",
    });
    expect(cascade.lastOf(classes, ["padding", "padding-block"], focused)).toEqual({
      property: "padding-block",
      value: "calc(var(--spacing) * 2)",
    });
  });
});
