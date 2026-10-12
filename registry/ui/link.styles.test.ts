// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
import {
  durations,
  easings,
  expectInstantFocusRing,
  transitionOf,
} from "../../test/motion-assertions";
import { linkVariants } from "./link";

let computed: Awaited<ReturnType<typeof createCascade>>["computed"];

beforeAll(async () => {
  ({ computed } = await createCascade());
});

const classesOf = (variant: "default" | "muted") => classList(linkVariants({ variant }));

describe("linkVariants compiled with Tailwind", () => {
  it.each([
    ["default", "var(--foreground)"],
    ["muted", "var(--muted-foreground)"],
  ] as const)("the %s variant uses its text token", (variant, color) => {
    expect(computed(classesOf(variant), "color")).toBe(color);
  });

  // Color alone never marks a link (WCAG 1.4.1), so the underline stays in every state.
  it.each(["default", "muted"] as const)("the %s variant is always underlined", (variant) => {
    const classes = classesOf(variant);
    expect(computed(classes, "text-decoration-line")).toBe("underline");
    expect(computed(classes, "text-decoration-line", { states: [":hover"] })).toBe("underline");
  });

  // Hover thickens the underline instead of removing it, so the hover state is never color alone.
  it.each(["default", "muted"] as const)(
    "the %s variant thickens its underline only on hover",
    (variant) => {
      const classes = classesOf(variant);
      expect(computed(classes, "text-decoration-thickness")).toBeUndefined();
      expect(computed(classes, "text-decoration-thickness", { states: [":hover"] })).toBe("2px");
    },
  );

  it("the muted variant darkens to the foreground color on hover", () => {
    const classes = classesOf("muted");
    expect(computed(classes, "color")).toBe("var(--muted-foreground)");
    expect(computed(classes, "color", { states: [":hover"] })).toBe("var(--foreground)");
  });

  it.each(["default", "muted"] as const)(
    "the %s variant shows a 2px ring outline with an offset on keyboard focus",
    (variant) => {
      const classes = classesOf(variant);
      const focus = { states: [":focus", ":focus-visible"] };
      expect(computed(classes, "outline-color", focus)).toBe("var(--ring)");
      expect(computed(classes, "outline-width", focus)).toBe("2px");
      expect(computed(classes, "outline-offset", focus)).toBe("2px");
      expect(computed(classes, "outline-color")).toBeUndefined();
    },
  );
});

describe("linkVariants motion", () => {
  it.each(["default", "muted"] as const)(
    "the %s variant fades its color and underline, never the focus ring",
    (variant) => {
      for (const states of [[], [":focus", ":focus-visible"], [":hover"]]) {
        const transition = transitionOf(computed, classesOf(variant), { states });
        expectInstantFocusRing(transition.properties);
        expect(transition.properties).toEqual([
          "color",
          "text-decoration-color",
          "text-decoration-thickness",
        ]);
        expect(transition.durations).toEqual([durations.fast]);
        expect(transition.easings).toEqual([easings.out]);
      }
    },
  );
});
