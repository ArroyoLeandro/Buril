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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

let cascade: Awaited<ReturnType<typeof createCascade>>;

beforeAll(async () => {
  cascade = await createCascade();
});

const html = renderToStaticMarkup(
  <Card decor>
    <CardHeader>
      <CardTitle>Title</CardTitle>
      <CardDescription>Description</CardDescription>
    </CardHeader>
    <CardContent>Content</CardContent>
    <CardFooter>Footer</CardFooter>
  </Card>,
);
const classesOf = (slot: string) =>
  classList(new RegExp(`<[^>]*data-slot="${slot}"[^>]*class="([^"]*)"`).exec(html)![1]!);
const decorClasses = classList(/<div[^>]*data-decor[^>]*class="([^"]*)"/.exec(html)![1]!);

const card = classesOf("card");
const title = classesOf("card-title");
const description = classesOf("card-description");
const content = classesOf("card-content");

describe("Card compiled with Tailwind", () => {
  it("has a 1px border in the border color on the card colors", () => {
    expect(cascade.computed(card, "border-width")).toBe("1px");
    expect(cascade.computed(card, "border-color")).toBe("var(--border)");
    expect(cascade.computed(card, "background-color")).toBe("var(--card)");
    expect(cascade.computed(card, "color")).toBe("var(--card-foreground)");
  });

  // A stretched link inside a heading uses the card as its containing block.
  it("is the positioning context for a stretched link", () => {
    expect(cascade.computed(card, "position")).toBe("relative");
  });

  it("uses the body font for the title, never the display font", () => {
    expect(cascade.computed(title, "font-family")).toBeUndefined();
    expect(cascade.computed(title, "font-weight")).toBe("var(--font-weight-semibold)");
  });

  it("uses the muted foreground for the description", () => {
    expect(cascade.computed(description, "color")).toBe("var(--muted-foreground)");
  });

  it("pads the content inline", () => {
    expect(cascade.computed(content, "padding-inline")).toBe("calc(var(--spacing) * 6)");
  });

  describe("decor band", () => {
    const image = () => cascade.computed(decorClasses, "background-image") ?? "";

    it("draws a hatch in the decor color, with primary as the fallback", () => {
      expect(image()).toMatch(/^repeating-linear-gradient\(/);
      expect(image()).toMatch(/var\(--decor,\s*var\(--primary\)\)/);
    });

    // Forced colors replace the palette; a decorative band would only add noise there.
    it("is removed in forced-colors mode", () => {
      expect(cascade.computed(decorClasses, "display", { forcedColors: true })).toBe("none");
    });
  });

  it("keeps the border in forced-colors mode", () => {
    expect(cascade.computed(card, "border-width", { forcedColors: true })).toBe("1px");
    expect(cascade.computed(card, "border-style", { forcedColors: true })).not.toBe("none");
  });
});

// An interactive card (one stretched link) lifts and casts a shadow on hover, and the same while
// its link has keyboard focus. The lift moves, so it needs motion; the shadow is an overlay whose
// opacity fades, so box-shadow itself never animates.
describe("interactive Card compiled with Tailwind", () => {
  const interactive = classList(
    /data-slot="card"[^>]*class="([^"]*)"/.exec(renderToStaticMarkup(<Card interactive />))![1]!,
  );
  const hover = { states: [":hover"] };
  const focused = { states: [":has(:focus-visible)"] };
  const overlay = (state?: string) => ({
    states: state ? [":hover", `${state}::after`] : ["::after"],
  });

  it("leaves a static card still: no lift, no overlay, no transition", () => {
    for (const options of [hover, focused, { ...hover, ...motionAllowed }]) {
      expect(cascade.computed(card, "--tw-translate-y", options)).toBeUndefined();
    }
    expect(cascade.computed(card, "content", overlay(":hover"))).toBeUndefined();
    expect(cascade.computed(card, "transition-property")).toBeUndefined();
  });

  it("lifts 4.5px on hover and keyboard focus, only when motion is allowed", () => {
    for (const state of [hover, focused]) {
      expect(
        cascade.computed(interactive, "--tw-translate-y", { ...state, ...motionAllowed }),
      ).toBe("calc(4.5px * -1)");
      expect(
        cascade.computed(interactive, "--tw-translate-y", { ...state, ...motionReduced }),
      ).toBeUndefined();
    }
    expect(cascade.computed(interactive, "--tw-translate-y", motionAllowed)).toBeUndefined();
    const lift = transitionOf(cascade.computed, interactive, motionAllowed);
    expect(lift.properties).toEqual(["translate"]);
    expect(lift.durations).toEqual([durations.base]);
    expect(lift.easings).toEqual([easings.out]);
    expect(transitionOf(cascade.computed, interactive, motionReduced).properties).toBeUndefined();
  });

  it("fades a shadow overlay in on hover and keyboard focus, in every motion mode", () => {
    expect(cascade.computed(interactive, "opacity", overlay())).toBe("0%");
    expect(cascade.computed(interactive, "--tw-shadow", overlay())).toMatch(/^0 14px 28px -14px/);
    expect(cascade.computed(interactive, "pointer-events", overlay())).toBe("none");
    expect(cascade.computed(interactive, "position", overlay())).toBe("absolute");
    for (const state of [":hover", ":has(:focus-visible)"]) {
      expect(cascade.computed(interactive, "opacity", overlay(state))).toBe("100%");
    }
    const fade = transitionOf(cascade.computed, interactive, overlay());
    expect(fade.properties).toEqual(["opacity"]);
    expect(fade.durations).toEqual([durations.fast]);
    expectInstantFocusRing(fade.properties);
  });
});
