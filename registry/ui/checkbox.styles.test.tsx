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
import { Checkbox } from "./checkbox";

let cascade: Awaited<ReturnType<typeof createCascade>>;

beforeAll(async () => {
  cascade = await createCascade();
});

const html = renderToStaticMarkup(<Checkbox />);
const classesOf = (tag: string, index = 0) =>
  classList([...html.matchAll(new RegExp(`<${tag}[^>]*class="([^"]*)"`, "g"))][index]![1]!);

const box = classesOf("input");
// The check comes first, then the dash.
const check = classesOf("svg", 0);
const dash = classesOf("svg", 1);

// How Tailwind writes `peer-*` variants: the icon follows the input in the same wrapper.
const peer = (state: string) => `:is(:where(.peer)${state} ~ *)`;
const checked = { states: [":checked"] };
const indeterminate = { states: [":indeterminate"] };

describe("Checkbox compiled with Tailwind", () => {
  it("is a 20px box drawn by CSS instead of the native control", () => {
    expect(cascade.computed(box, "appearance")).toBe("none");
    expect(cascade.computed(box, "width")).toBe("calc(var(--spacing) * 5)");
    expect(cascade.computed(box, "height")).toBe("calc(var(--spacing) * 5)");
  });

  it("has an input-colored border on the background while unchecked", () => {
    expect(cascade.computed(box, "border-color")).toBe("var(--input)");
    expect(cascade.computed(box, "border-width")).toBe("1px");
    expect(cascade.computed(box, "background-color")).toBe("var(--background)");
  });

  it.each([
    ["checked", checked],
    ["indeterminate", indeterminate],
  ] as const)("fills with the primary color when %s", (_, state) => {
    expect(cascade.computed(box, "background-color", state)).toBe("var(--primary)");
    expect(cascade.computed(box, "border-color", state)).toBe("var(--primary)");
  });

  it("shows the check only when checked and not indeterminate", () => {
    expect(cascade.computed(check, "visibility")).toBe("hidden");
    expect(cascade.computed(check, "visibility", { states: [peer(":checked")] })).toBe("visible");
    // A checkbox can be checked and indeterminate at once; browsers then show the dash.
    expect(
      cascade.computed(check, "visibility", {
        states: [peer(":checked"), peer(":indeterminate")],
      }),
    ).toBe("hidden");
    expect(cascade.computed(check, "color")).toBe("var(--primary-foreground)");
  });

  it("shows the dash only when indeterminate", () => {
    expect(cascade.computed(dash, "visibility")).toBe("hidden");
    expect(cascade.computed(dash, "visibility", { states: [peer(":indeterminate")] })).toBe(
      "visible",
    );
    expect(cascade.computed(dash, "color")).toBe("var(--primary-foreground)");
  });

  it("shows a 2px ring outline with an offset on keyboard focus", () => {
    const focus = { states: [":focus", ":focus-visible"] };
    expect(cascade.computed(box, "outline-color", focus)).toBe("var(--ring)");
    expect(cascade.computed(box, "outline-width", focus)).toBe("2px");
    expect(cascade.computed(box, "outline-offset", focus)).toBe("2px");
  });

  it("keeps the destructive border when invalid, even while checked", () => {
    const invalid = '[aria-invalid="true"]';
    expect(cascade.computed(box, "border-color", { states: [invalid] })).toBe("var(--destructive)");
    expect(cascade.computed(box, "border-color", { states: [":checked", invalid] })).toBe(
      "var(--destructive)",
    );
  });

  it("keeps the destructive border when invalid and indeterminate", () => {
    const invalid = '[aria-invalid="true"]';
    expect(cascade.computed(box, "border-color", { states: [":indeterminate", invalid] })).toBe(
      "var(--destructive)",
    );
    // The fill stays primary, so the dash keeps its contrast.
    expect(cascade.computed(box, "background-color", { states: [":indeterminate", invalid] })).toBe(
      "var(--primary)",
    );
  });

  it("dims the box and its icons when disabled", () => {
    expect(cascade.computed(box, "opacity", { states: [":disabled"] })).toBe("50%");
    expect(cascade.computed(check, "opacity", { states: [peer(":disabled")] })).toBe("50%");
    expect(cascade.computed(dash, "opacity", { states: [peer(":disabled")] })).toBe("50%");
  });

  // Forced colors replace backgrounds, so the custom fill and icons would vanish. The native
  // checkbox comes back instead; the system draws its checked and mixed states.
  it("falls back to the native checkbox in forced-colors mode", () => {
    expect(cascade.computed(box, "appearance", { forcedColors: true })).toBe("auto");
    expect(cascade.computed(check, "display", { forcedColors: true })).toBe("none");
    expect(cascade.computed(dash, "display", { forcedColors: true })).toBe("none");
  });
});

describe("Checkbox motion", () => {
  const focus = { states: [":focus", ":focus-visible"] };

  it("fades the fill and border in every motion mode, never the focus ring", () => {
    for (const options of [{}, focus, motionAllowed, motionReduced]) {
      const transition = transitionOf(cascade.computed, box, options);
      expectInstantFocusRing(transition.properties);
      expect(transition.properties).toEqual(["background-color", "border-color"]);
      expect(transition.durations).toEqual([durations.base]);
      expect(transition.easings).toEqual([easings.out]);
    }
  });

  // The check is drawn like a burin stroke: one dash as long as the path (pathLength="1") is
  // offset by its whole length while unchecked and slides into place when checked. The dash
  // properties are inherited, so the svg sets them for its path.
  it("measures the check path as one unit long", () => {
    expect(html).toMatch(/<path[^>]*pathLength="1"[^>]*d="M5 12.5/);
    expect(cascade.computed(check, "stroke-dasharray")).toBe("1");
  });

  it("offsets the stroke by its whole length until checked", () => {
    expect(cascade.computed(check, "stroke-dashoffset")).toBe("1");
    expect(cascade.computed(check, "stroke-dashoffset", { states: [peer(":checked")] })).toBe("0");
  });

  it("draws the check only when motion is allowed; otherwise it appears at once", () => {
    const allowed = transitionOf(cascade.computed, check, motionAllowed);
    expect(allowed.properties).toEqual(["stroke-dashoffset"]);
    expect(allowed.durations).toEqual([durations.base]);
    expect(allowed.easings).toEqual([easings.out]);
    expect(transitionOf(cascade.computed, check, motionReduced).properties).toBeUndefined();
  });

  it("grows the dash across when indeterminate, only when motion is allowed", () => {
    const indeterminate = { states: [peer(":indeterminate")] };
    expect(cascade.computed(dash, "--tw-scale-x", motionAllowed)).toBe("0%");
    expect(cascade.computed(dash, "--tw-scale-x", { ...indeterminate, ...motionAllowed })).toBe(
      "100%",
    );
    // Under reduced motion the dash is never scaled down, so it appears at full width.
    expect(cascade.computed(dash, "--tw-scale-x", motionReduced)).toBeUndefined();
    const allowed = transitionOf(cascade.computed, dash, motionAllowed);
    expect(allowed.properties).toEqual(["scale"]);
    expect(allowed.durations).toEqual([durations.base]);
    expect(transitionOf(cascade.computed, dash, motionReduced).properties).toBeUndefined();
  });
});
