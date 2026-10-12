// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
import { Spinner } from "./spinner";

let cascade: Awaited<ReturnType<typeof createCascade>>;

beforeAll(async () => {
  cascade = await createCascade();
});

const html = renderToStaticMarkup(<Spinner />);
const classesOf = (pattern: RegExp) =>
  classList(/class="([^"]*)"/.exec(pattern.exec(html)![0])![1]!);

const svg = classesOf(/<svg[^>]*>/);
const ring = classesOf(/<g[^>]*data-ring[^>]*>/);
const dots = classesOf(/<g[^>]*data-dots[^>]*>/);
const label = classesOf(/<span[^>]*>Loading</);

const allowsMotion = { media: ["(prefers-reduced-motion: no-preference)"] };
const reducesMotion = { media: ["(prefers-reduced-motion: reduce)"] };

describe("Spinner compiled with Tailwind", () => {
  it("spins only when the user allows motion", () => {
    expect(cascade.computed(svg, "animation")).toBeUndefined();
    expect(cascade.computed(svg, "animation", allowsMotion)).toMatch(/spin/);
    expect(cascade.computed(svg, "animation", reducesMotion)).toBeUndefined();
  });

  // A frozen arc looks like a broken spinner; three dots read as "in progress" without motion.
  it("swaps the arc for three static dots under reduced motion", () => {
    expect(cascade.computed(ring, "display")).toBeUndefined();
    expect(cascade.computed(dots, "display")).toBe("none");
    expect(cascade.computed(ring, "display", reducesMotion)).toBe("none");
    expect(cascade.computed(dots, "display", reducesMotion)).toBe("inline");
  });

  it("keeps the label in the accessibility tree but off screen", () => {
    expect(cascade.computed(label, "position")).toBe("absolute");
    expect(cascade.computed(label, "width")).toBe("1px");
  });
});
