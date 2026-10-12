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
import { Switch } from "./switch";

let cascade: Awaited<ReturnType<typeof createCascade>>;

beforeAll(async () => {
  cascade = await createCascade();
});

const html = renderToStaticMarkup(<Switch stateLabels={{ on: "On", off: "Off" }} />);
const classesOf = (tag: RegExp) => classList(/class="([^"]*)"/.exec(tag.exec(html)![0])![1]!);

const wrapper = classesOf(/<span[^>]*>/);
const track = classesOf(/<input[^>]*>/);
const thumb = classesOf(/<span[^>]*data-thumb[^>]*>/);
// The dot's carrier, inside the thumb; the dot is its ::before.
const carrier = classList(/data-thumb[^>]*><span class="([^"]*)"/.exec(html)![1]!);
const offText = classesOf(/<span[^>]*>Off</);
const onText = classesOf(/<span[^>]*>On</);

// How Tailwind writes `peer-*` variants: the thumb and the text follow the input.
const peerChecked = { states: [":is(:where(.peer):checked ~ *)"] };
// The dot is the carrier's ::before.
const dot = { states: ["::before"] };

describe("Switch compiled with Tailwind", () => {
  it("draws a 44 by 24px pill track instead of the native checkbox", () => {
    expect(cascade.computed(track, "appearance")).toBe("none");
    expect(cascade.computed(track, "width")).toBe("calc(var(--spacing) * 11)");
    expect(cascade.computed(track, "height")).toBe("calc(var(--spacing) * 6)");
    expect(cascade.computed(track, "border-radius")).toBe("calc(infinity * 1px)");
  });

  it("has an input-colored border on the background when off and fills with primary when on", () => {
    expect(cascade.computed(track, "border-color")).toBe("var(--input)");
    expect(cascade.computed(track, "background-color")).toBe("var(--background)");
    const on = { states: [":checked"] };
    expect(cascade.computed(track, "border-color", on)).toBe("var(--primary)");
    expect(cascade.computed(track, "background-color", on)).toBe("var(--primary)");
  });

  // The thumb's position, not only its color, tells off from on. The thumb element is the rail
  // the dot travels along; when on, it sets how far the carrier moves, and the carrier moves with
  // translate, never with left.
  it("moves the dot's carrier by its own width with translate when on", () => {
    expect(cascade.computed(thumb, "inset")).toBe("var(--spacing)");
    expect(cascade.computed(thumb, "--buril-switch-travel")).toBeUndefined();
    expect(cascade.computed(thumb, "--buril-switch-travel", peerChecked)).toBe("100%");
    expect(cascade.computed(carrier, "--tw-translate-x")).toBe("var(--buril-switch-travel,0%)");
    for (const element of [thumb, carrier]) {
      expect(cascade.computed(element, "left")).toBeUndefined();
      expect(cascade.computed(element, "left", peerChecked)).toBeUndefined();
    }
  });

  // Container query units on the dot did not resolve against the rail it was meant to measure,
  // so the layout is plain flexbox: the rail's ::after is an empty square at its end, as tall as
  // the rail, and the carrier takes the rest of the width, which is how far the dot travels.
  // Real-browser positions for several track sizes are in switch.browser.test.tsx.
  it("sizes the dot's travel with flexbox, without container query units", () => {
    expect(cascade.computed(thumb, "display")).toBe("flex");
    expect(cascade.computed(thumb, "container-type")).toBeUndefined();
    expect(html).not.toMatch(/cq[whib]|cqmin|cqmax/);
    const spacer = { states: ["::after"] };
    expect(cascade.computed(thumb, "aspect-ratio", spacer)).toBe("1 / 1");
    expect(cascade.computed(thumb, "height", spacer)).toBe("100%");
    expect(cascade.computed(thumb, "flex-shrink", spacer)).toBe("0");
    expect(cascade.computed(carrier, "flex")).toBe("1");
    expect(cascade.computed(carrier, "min-width")).toBe("0px");
    expect(cascade.computed(carrier, "aspect-ratio", dot)).toBe("1 / 1");
    expect(cascade.computed(carrier, "height", dot)).toBe("100%");
    expect(cascade.computed(carrier, "border-radius", dot)).toBe("calc(infinity * 1px)");
  });

  // The thumb sits in the track's grid cell, so its inset resolves against the track box. It
  // names the end lines too: with an auto end line, an absolute grid child reaches the far edge
  // of the container, and the rail would run under the state text.
  it("places the thumb in the same grid cell as the track", () => {
    expect(cascade.computed(wrapper, "display")).toBe("inline-grid");
    expect(cascade.computed(wrapper, "position")).toBe("relative");
    for (const element of [track, thumb]) {
      expect(cascade.computed(element, "grid-column-start")).toBe("1");
      expect(cascade.computed(element, "grid-row-start")).toBe("1");
    }
    expect(cascade.computed(thumb, "grid-column-end")).toBe("2");
    expect(cascade.computed(thumb, "grid-row-end")).toBe("2");
    expect(cascade.computed(thumb, "position")).toBe("absolute");
  });

  // The dot is painted in the rail's text color, so one color transition on the rail fades it.
  it("contrasts the thumb with the track in both states", () => {
    expect(cascade.computed(carrier, "background-color", dot)).toBe("currentcolor");
    expect(cascade.computed(thumb, "color")).toBe("var(--muted-foreground)");
    expect(cascade.computed(thumb, "color", peerChecked)).toBe("var(--primary-foreground)");
  });

  it("fades the track colors in every motion mode, never the focus ring", () => {
    for (const options of [{}, { states: [":focus", ":focus-visible"] }, motionReduced]) {
      const transition = transitionOf(cascade.computed, track, options);
      expectInstantFocusRing(transition.properties);
      expect(transition.properties).toEqual(["background-color", "border-color"]);
      expect(transition.durations).toEqual([durations.base]);
      expect(transition.easings).toEqual([easings.inOut]);
    }
  });

  // Under reduced motion the dot jumps to its side while its color still fades.
  it("slides the thumb only when the user allows motion", () => {
    for (const options of [{}, motionReduced, motionAllowed]) {
      const color = transitionOf(cascade.computed, thumb, options);
      expect(color.properties).toEqual(["color"]);
      expect(color.durations).toEqual([durations.base]);
      expect(color.easings).toEqual([easings.inOut]);
    }
    for (const options of [{}, motionReduced]) {
      expect(transitionOf(cascade.computed, carrier, options).properties).toBeUndefined();
    }
    const slide = transitionOf(cascade.computed, carrier, motionAllowed);
    expect(slide.properties).toEqual(["translate"]);
    expect(slide.durations).toEqual([durations.base]);
    expect(slide.easings).toEqual([easings.inOut]);
  });

  it("turns the track border destructive when invalid, even while on", () => {
    const invalid = '[aria-invalid="true"]';
    expect(cascade.computed(track, "border-color", { states: [invalid] })).toBe(
      "var(--destructive)",
    );
    expect(cascade.computed(track, "border-color", { states: [":checked", invalid] })).toBe(
      "var(--destructive)",
    );
  });

  it("shows the ring outline on keyboard focus", () => {
    const focus = { states: [":focus", ":focus-visible"] };
    expect(cascade.computed(track, "outline-color", focus)).toBe("var(--ring)");
    expect(cascade.computed(track, "outline-width", focus)).toBe("2px");
  });

  it("shows only the text for the current state", () => {
    expect(cascade.computed(offText, "display")).toBeUndefined();
    expect(cascade.computed(offText, "display", peerChecked)).toBe("none");
    expect(cascade.computed(onText, "display")).toBe("none");
    expect(cascade.computed(onText, "display", peerChecked)).toBe("inline");
  });

  // Forced colors replace backgrounds, which would hide the thumb. It keeps a system color.
  it("keeps the thumb visible in forced-colors mode", () => {
    const forced = { forcedColors: true };
    expect(cascade.computed(thumb, "forced-color-adjust", forced)).toBe("none");
    expect(cascade.computed(thumb, "color", forced)).toBe("CanvasText");
    expect(cascade.computed(carrier, "background-color", { ...forced, ...dot })).toBe(
      "currentcolor",
    );
    expect(cascade.computed(track, "border-width")).toBe("1px");
  });
});
