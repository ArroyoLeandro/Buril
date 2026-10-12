// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
import {
  durations,
  easings,
  motionAllowed,
  motionReduced,
  transitionOf,
} from "../../test/motion-assertions";
import { Alert, AlertDescription, AlertTitle } from "./alert";

let cascade: Awaited<ReturnType<typeof createCascade>>;

beforeAll(async () => {
  cascade = await createCascade();
});

const partsOf = (variant: "default" | "destructive") => {
  const html = renderToStaticMarkup(
    <Alert variant={variant}>
      <AlertTitle>Title</AlertTitle>
      <AlertDescription>Description</AlertDescription>
    </Alert>,
  );
  const slot = (name: string) =>
    classList(new RegExp(`data-slot="${name}"[^>]*class="([^"]*)"`).exec(html)![1]!);
  return {
    root: slot("alert"),
    icon: slot("alert-icon"),
    title: slot("alert-title"),
    description: slot("alert-description"),
  };
};

const plain = partsOf("default");
const destructive = partsOf("destructive");

describe("Alert compiled with Tailwind", () => {
  it("has a 1px border in the border color on the card colors", () => {
    expect(cascade.computed(plain.root, "border-width")).toBe("1px");
    expect(cascade.computed(plain.root, "border-color")).toBe("var(--border)");
    expect(cascade.computed(plain.root, "background-color")).toBe("var(--card)");
    expect(cascade.computed(plain.root, "color")).toBe("var(--card-foreground)");
  });

  // Destructive on the background is measured at 5.14:1 (light) and 6.02:1 (dark).
  it("colors the border, icon and title destructive in the destructive variant", () => {
    expect(cascade.computed(destructive.root, "border-color")).toBe("var(--destructive)");
    expect(cascade.computed(destructive.root, "color")).toBe("var(--destructive)");
    expect(cascade.computed(destructive.root, "background-color")).toBe("var(--card)");
  });

  it("keeps the description in the muted foreground for both variants", () => {
    for (const { description } of [plain, destructive]) {
      expect(cascade.computed(description, "color")).toBe("var(--muted-foreground)");
    }
  });

  it("puts the icon in its own column, next to the title and description", () => {
    expect(cascade.computed(plain.root, "display")).toBe("grid");
    expect(cascade.computed(plain.icon, "grid-column-start")).toBe("1");
    expect(cascade.computed(plain.title, "grid-column-start")).toBe("2");
    expect(cascade.computed(plain.description, "grid-column-start")).toBe("2");
  });

  // The space comes from the icon itself, so an alert without an icon has no empty gap.
  it("spaces the text from the icon with the icon's margin, not a column gap", () => {
    expect(cascade.computed(plain.root, "column-gap")).toBeUndefined();
    expect(cascade.computed(plain.icon, "margin-right")).toBe("calc(var(--spacing) * 3)");
  });

  it("uses the body font for the title, never the display font", () => {
    expect(cascade.computed(plain.title, "font-family")).toBeUndefined();
    expect(cascade.computed(plain.title, "font-weight")).toBe("var(--font-weight-semibold)");
  });
});

// An alert fades in when it is inserted. Opacity is not movement, so it fades in every mode, and
// nothing around it moves.
describe("Alert motion", () => {
  it.each([
    ["default", plain],
    ["destructive", destructive],
  ] as const)("the %s variant fades in when it appears", (_, parts) => {
    expect(cascade.computed(parts.root, "opacity")).toBeUndefined();
    for (const options of [{}, motionAllowed, motionReduced]) {
      expect(cascade.computed(parts.root, "opacity", { ...options, startingStyle: true })).toBe(
        "0%",
      );
    }
    expect(
      cascade.computed(parts.root, "translate", { ...motionAllowed, startingStyle: true }),
    ).toBeUndefined();
    const transition = transitionOf(cascade.computed, parts.root);
    expect(transition.properties).toEqual(["opacity"]);
    expect(transition.durations).toEqual([durations.fast]);
    expect(transition.easings).toEqual([easings.out]);
  });
});
