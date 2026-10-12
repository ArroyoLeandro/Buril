// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
import { Skeleton } from "./skeleton";

let cascade: Awaited<ReturnType<typeof createCascade>>;

beforeAll(async () => {
  cascade = await createCascade();
});

const skeleton = classList(/class="([^"]*)"/.exec(renderToStaticMarkup(<Skeleton />))![1]!);

describe("Skeleton compiled with Tailwind", () => {
  it("is a muted, rounded block", () => {
    expect(cascade.computed(skeleton, "background-color")).toBe("var(--muted)");
    expect(cascade.computed(skeleton, "border-radius")).toBe("var(--radius-md)");
  });

  it("pulses only when the user allows motion", () => {
    expect(cascade.computed(skeleton, "animation")).toBeUndefined();
    expect(
      cascade.computed(skeleton, "animation", {
        media: ["(prefers-reduced-motion: no-preference)"],
      }),
    ).toMatch(/pulse/);
  });

  // Forced colors drop the fill, which would make the placeholder vanish; a border keeps it.
  it("keeps an outline of the placeholder in forced-colors mode", () => {
    expect(cascade.computed(skeleton, "border-width")).toBeUndefined();
    expect(cascade.computed(skeleton, "border-width", { forcedColors: true })).toBe("1px");
  });
});
