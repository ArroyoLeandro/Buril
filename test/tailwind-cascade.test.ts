// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";

import { createCascade } from "./tailwind-cascade";

/**
 * Self-tests for the cascade helper. Motion utilities compile into `@starting-style`, `@supports`
 * and at-rules nested inside `@media`, so the helper must resolve all of them the way a browser
 * would, and must ignore them when they do not apply.
 */
let cascade: Awaited<ReturnType<typeof createCascade>>;

beforeAll(async () => {
  cascade = await createCascade();
});

const noPreference = "(prefers-reduced-motion: no-preference)";

describe("cascade helper", () => {
  describe("@starting-style", () => {
    const classes = ["opacity-100", "starting:opacity-0"];

    it("ignores starting styles by default, as for an element already on screen", () => {
      expect(cascade.computed(classes, "opacity")).toBe("100%");
    });

    it("applies starting styles over the plain rules when asked", () => {
      expect(cascade.computed(classes, "opacity", { startingStyle: true })).toBe("0%");
    });

    it("applies starting styles with a state", () => {
      const open = ["opacity-100", "starting:open:opacity-0"];
      expect(cascade.computed(open, "opacity", { startingStyle: true })).toBe("100%");
      expect(
        cascade.computed(open, "opacity", {
          startingStyle: true,
          states: [":is([open], :popover-open, :open)"],
        }),
      ).toBe("0%");
    });
  });

  describe("nested at-rules", () => {
    const classes = ["motion-safe:starting:-translate-y-0.5"];

    it("resolves @starting-style inside @media only when both apply", () => {
      expect(
        cascade.computed(classes, "--tw-translate-y", { startingStyle: true }),
      ).toBeUndefined();
      expect(cascade.computed(classes, "--tw-translate-y", { media: [noPreference] })).toBe(
        undefined,
      );
      expect(
        cascade.computed(classes, "--tw-translate-y", {
          startingStyle: true,
          media: [noPreference],
        }),
      ).toBe("calc(var(--spacing) * -0.5)");
    });

    it("resolves @media inside @media", () => {
      const hover = ["motion-safe:hover:bg-accent"];
      expect(cascade.computed(hover, "background-color", { states: [":hover"] })).toBeUndefined();
      expect(
        cascade.computed(hover, "background-color", { states: [":hover"], media: [noPreference] }),
      ).toBe("var(--accent)");
    });

    it("resolves @supports and @starting-style inside @media", () => {
      const classes = ["motion-safe:supports-[overlay:auto]:starting:opacity-0"];
      const options = { startingStyle: true, media: [noPreference] };
      expect(cascade.computed(classes, "opacity", options)).toBeUndefined();
      expect(
        cascade.computed(classes, "opacity", { ...options, supports: ["(overlay: auto)"] }),
      ).toBe("0%");
    });

    it("resolves forced colors inside a motion query", () => {
      const classes = ["motion-safe:forced-colors:hidden"];
      expect(cascade.computed(classes, "display", { forcedColors: true })).toBeUndefined();
      expect(
        cascade.computed(classes, "display", { forcedColors: true, media: [noPreference] }),
      ).toBe("none");
    });
  });

  describe("@supports", () => {
    it("ignores a supports rule unless its condition is listed, whatever the spacing", () => {
      const classes = ["opacity-100", "supports-[overlay:auto]:opacity-0"];
      expect(cascade.computed(classes, "opacity")).toBe("100%");
      expect(cascade.computed(classes, "opacity", { supports: ["(overlay:auto)"] })).toBe("0%");
      expect(cascade.computed(classes, "opacity", { supports: ["(overlay: auto)"] })).toBe("0%");
    });

    it("matches a negated condition only when it is listed", () => {
      const classes = ["not-supports-[width:1cqw]:left-full"];
      expect(cascade.computed(classes, "left")).toBeUndefined();
      expect(cascade.computed(classes, "left", { supports: ["not (width: 1cqw)"] })).toBe("100%");
    });
  });

  describe("reduced motion queries", () => {
    it.each([
      ["motion-safe:translate-y-px", "(prefers-reduced-motion: no-preference)"],
      ["[@media_not_(prefers-reduced-motion:reduce)]:translate-y-px", "the no-preference query"],
    ])("treats %s as allowed motion (%s)", (name) => {
      for (const query of [noPreference, "not (prefers-reduced-motion: reduce)"]) {
        expect(cascade.computed([name], "--tw-translate-y", { media: [query] })).toBe("1px");
      }
      expect(cascade.computed([name], "--tw-translate-y")).toBeUndefined();
      expect(
        cascade.computed([name], "--tw-translate-y", {
          media: ["(prefers-reduced-motion: reduce)"],
        }),
      ).toBeUndefined();
    });

    it("applies motion-reduce rules only under reduced motion", () => {
      const classes = ["motion-reduce:hidden"];
      expect(cascade.computed(classes, "display", { media: [noPreference] })).toBeUndefined();
      expect(
        cascade.computed(classes, "display", { media: ["(prefers-reduced-motion: reduce)"] }),
      ).toBe("none");
    });
  });
});
