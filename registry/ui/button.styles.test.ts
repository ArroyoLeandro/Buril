// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
import { buttonVariants } from "./button";

// Compiled with Tailwind so the cascade is checked, including a raw <a> styled with
// `buttonVariants()`, where no `cn()` removes conflicting classes.
let build: (candidates: string[]) => string;
let computed: Awaited<ReturnType<typeof createCascade>>["computed"];

beforeAll(async () => {
  ({ build, computed } = await createCascade());
});

const classesOf = (options: Parameters<typeof buttonVariants>[0]) =>
  classList(buttonVariants(options));

/** Unprefixed utilities that set a border color, such as `border-border`. */
const borderColorClasses = (classes: string[]) =>
  classes.filter((name) => /^border-(?!\d|[xytrblse]-|[xytrblse]$)/.test(name));

const variants = ["default", "secondary", "outline", "ghost", "link", "destructive"] as const;
const borderless = ["default", "secondary", "ghost", "link", "destructive"] as const;

describe("buttonVariants compiled with Tailwind", () => {
  it.each(variants)("the %s variant sets exactly one border color", (variant) => {
    expect(borderColorClasses(classesOf({ variant }))).toHaveLength(1);
  });

  it("outline on a raw anchor keeps a visible border", () => {
    const classes = classesOf({ variant: "outline" });
    expect(computed(classes, "border-color")).toBe("var(--border)");
    expect(computed(classes, "border-width")).toBe("1px");
  });

  it.each(borderless)(
    "the %s variant keeps a transparent 1px border so every variant has the same box",
    (variant) => {
      const classes = classesOf({ variant });
      expect(computed(classes, "border-color")).toBe("transparent");
      expect(computed(classes, "border-width")).toBe("1px");
    },
  );

  it.each(["default", "secondary", "outline", "ghost", "destructive"] as const)(
    "the %s variant shows its border as currentcolor in forced-colors mode",
    (variant) => {
      const classes = classesOf({ variant });
      expect(computed(classes, "border-color", { forcedColors: true })).toBe("currentcolor");
    },
  );

  it("the link variant stays borderless in forced-colors mode", () => {
    const classes = classesOf({ variant: "link" });
    expect(computed(classes, "border-color", { forcedColors: true })).toBe("transparent");
  });

  it.each(["sm", "default", "lg"] as const)(
    "the %s size grows with its label instead of overflowing",
    (size) => {
      const classes = classesOf({ size });
      expect(classes.some((name) => /^h-\d+$/.test(name))).toBe(false);
      expect(classes).not.toContain("whitespace-nowrap");
      expect(classes).not.toContain("shrink-0");
      expect(classes).toContain("text-center");
    },
  );

  it.each([
    ["sm", 8],
    ["default", 10],
    ["lg", 12],
  ] as const)("the %s size keeps a minimum height of %s spacing units", (size, units) => {
    const classes = classesOf({ size });
    expect(computed(classes, "min-height")).toBe(`calc(var(--spacing) * ${units})`);
    // The default spacing unit is 0.25rem, so the smallest size is 32px: above the 24px target.
    expect(units * 4).toBeGreaterThanOrEqual(24);
  });

  it.each([
    ["icon-sm", 8],
    ["icon", 10],
    ["icon-lg", 12],
  ] as const)("the %s size is a fully rounded square of %s spacing units", (size, units) => {
    const classes = classesOf({ size });
    const side = `calc(var(--spacing) * ${units})`;
    expect(computed(classes, "width")).toBe(side);
    expect(computed(classes, "height")).toBe(side);
    expect(computed(classes, "border-radius")).toBe("calc(infinity * 1px)");
    // A square must not stretch with a label or shrink in a flex row.
    expect(computed(classes, "min-height")).toBeUndefined();
    expect(computed(classes, "flex-shrink")).toBe("0");
    // 32px is the smallest square: above the 24px target size (rule 8).
    expect(units * 4).toBeGreaterThanOrEqual(24);
  });

  it.each([
    ["icon-sm", 4],
    ["icon", 5],
    ["icon-lg", 6],
  ] as const)("the %s size scales an unsized icon to %s spacing units", (size, units) => {
    const css = build(classesOf({ size }));
    // Tailwind keeps the nested `& svg:not(...)` rule, so match it in the generated text.
    const rule = new RegExp(
      String.raw`svg:not\(\[class\*=['"]?size-['"]?\]\)\s*\{[^}]*width: calc\(var\(--spacing\) \* ${units}\)`,
    );
    expect(css).toMatch(rule);
  });
});
