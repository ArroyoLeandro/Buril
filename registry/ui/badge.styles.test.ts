// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
import { badgeVariants } from "./badge";

let cascade: Awaited<ReturnType<typeof createCascade>>;

beforeAll(async () => {
  cascade = await createCascade();
});

const classesOf = (variant: "default" | "secondary" | "outline" | "destructive") =>
  classList(badgeVariants({ variant }));

describe("badgeVariants compiled with Tailwind", () => {
  it.each([
    ["default", "var(--primary)", "var(--primary-foreground)"],
    ["secondary", "var(--secondary)", "var(--secondary-foreground)"],
    ["outline", undefined, "var(--foreground)"],
    // The one non-token color, the Button's measured exception: white on the light red is 5.89:1;
    // in dark mode the text switches to the background color (6.02:1).
    ["destructive", "var(--destructive)", "var(--color-white)"],
  ] as const)("the %s variant uses token colors", (variant, background, color) => {
    const classes = classesOf(variant);
    expect(cascade.computed(classes, "background-color")).toBe(background);
    expect(cascade.computed(classes, "color")).toBe(color);
  });

  it("the outline variant has a visible border in the border color", () => {
    expect(cascade.computed(classesOf("outline"), "border-color")).toBe("var(--border)");
    expect(cascade.computed(classesOf("outline"), "border-width")).toBe("1px");
  });

  it.each(["default", "secondary", "destructive"] as const)(
    "the %s variant keeps a transparent 1px border so every variant has the same box",
    (variant) => {
      expect(cascade.computed(classesOf(variant), "border-color")).toBe("transparent");
      expect(cascade.computed(classesOf(variant), "border-width")).toBe("1px");
    },
  );

  // Forced colors drop the fill, so the border keeps the badge's shape visible.
  it.each(["default", "secondary", "outline", "destructive"] as const)(
    "the %s variant shows its border as currentcolor in forced-colors mode",
    (variant) => {
      expect(cascade.computed(classesOf(variant), "border-color", { forcedColors: true })).toBe(
        "currentcolor",
      );
    },
  );

  it("is small text in a pill that can wrap at narrow widths", () => {
    const classes = classesOf("default");
    expect(cascade.computed(classes, "border-radius")).toBe("calc(infinity * 1px)");
    expect(cascade.computed(classes, "font-size")).toBe("var(--text-xs)");
    expect(cascade.computed(classes, "white-space")).toBeUndefined();
  });
});
