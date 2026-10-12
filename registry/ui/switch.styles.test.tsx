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
const offText = classesOf(/<span[^>]*>Off</);
const onText = classesOf(/<span[^>]*>On</);

// How Tailwind writes `peer-*` variants: the thumb and the text follow the input.
const peerChecked = { states: [":is(:where(.peer):checked ~ *)"] };
// The dot is the thumb's ::before, off and on.
const dot = ["::before"];
const onDot = ["::before", ":is(:where(.peer):checked ~ *)::before"];

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
  // the dot travels along; its ::before is the dot, moved with translate, never with left.
  it("moves the dot from the left to the right with translate when on", () => {
    expect(cascade.computed(thumb, "inset")).toBe("var(--spacing)");
    for (const states of [dot, onDot]) {
      expect(cascade.computed(thumb, "left", { states })).toBeUndefined();
    }
    expect(cascade.computed(thumb, "--tw-translate-x", { states: dot })).toBeUndefined();
    expect(cascade.computed(thumb, "--tw-translate-x", { states: onDot })).toBe(
      "calc(100cqw - 100%)",
    );
    // The rail is a size container, so 100cqw is the rail's width.
    expect(cascade.computed(thumb, "container-type")).toBe("size");
  });

  // Browsers without container query units cannot resolve the translate; the dot jumps to the
  // right edge with an auto margin instead, so the position still tells off from on.
  it("still moves the dot where container query units are not supported", () => {
    const unsupported = { supports: ["not (width: 1cqw)"] };
    expect(cascade.computed(thumb, "display")).toBe("flex");
    expect(cascade.computed(thumb, "margin-left", { states: onDot, ...unsupported })).toBe("auto");
    expect(cascade.computed(thumb, "margin-left", { states: onDot })).toBeUndefined();
  });

  // The thumb sits in the track's grid cell, so percentages resolve against the track box.
  it("places the thumb in the same grid cell as the track", () => {
    expect(cascade.computed(wrapper, "display")).toBe("inline-grid");
    expect(cascade.computed(wrapper, "position")).toBe("relative");
    for (const element of [track, thumb]) {
      expect(cascade.computed(element, "grid-column-start")).toBe("1");
      expect(cascade.computed(element, "grid-row-start")).toBe("1");
    }
    expect(cascade.computed(thumb, "position")).toBe("absolute");
  });

  /**
   * Resolve the dot geometry for a track of a given size, in px, the way a browser does: the rail
   * is inset from the track, the dot's `100%` height is the rail's height, and in its translate
   * `100cqw` is the rail's width and `100%` the dot's own width.
   */
  function dotBox(width: number, height: number, states: string[]) {
    const resolve = (value: string | undefined, percent: number, cqw = 0) => {
      if (value === undefined) return 0;
      const expression = value
        .replaceAll("var(--spacing)", "4")
        .replaceAll("calc(", "(")
        .replace(/(-?[\d.]+)cqw/g, (_, amount: string) => `(${(Number(amount) / 100) * cqw})`)
        .replace(/(-?[\d.]+)%/g, (_, amount: string) => `(${(Number(amount) / 100) * percent})`)
        .replace(/(-?[\d.]+)px/g, "$1");
      if (!/^[\d\s.+\-*/()]+$/.test(expression)) throw new Error(`Cannot resolve ${value}`);
      return Number(new Function(`return ${expression}`)());
    };
    const inset = resolve(cascade.computed(thumb, "inset"), 0);
    const rail = { width: width - 2 * inset, height: height - 2 * inset };
    const size = resolve(cascade.computed(thumb, "height", { states }), rail.height);
    const ratio = cascade.computed(thumb, "aspect-ratio", { states });
    const shift = resolve(
      cascade.computed(thumb, "--tw-translate-x", { states }),
      size,
      rail.width,
    );
    return { size, ratio, start: inset + shift };
  }

  // A consumer can size the track with className; the thumb must still fit and travel fully.
  it.each([
    [44, 24],
    [36, 24],
    [56, 32],
    [64, 40],
  ])("keeps the thumb inside a %ix%ipx track with equal gaps, off and on", (width, height) => {
    const off = dotBox(width, height, dot);
    const on = dotBox(width, height, onDot);
    expect(off.ratio).toBe("1 / 1");
    expect(off.size).toBe(height - 8);
    expect(off.start).toBe(4);
    expect(on.size).toBe(height - 8);
    expect(width - (on.start + on.size)).toBe(4);
  });

  it("contrasts the thumb with the track in both states", () => {
    expect(cascade.computed(thumb, "background-color", { states: dot })).toBe(
      "var(--muted-foreground)",
    );
    expect(cascade.computed(thumb, "background-color", { states: onDot })).toBe(
      "var(--primary-foreground)",
    );
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
    for (const options of [{ states: dot }, { states: dot, ...motionReduced }]) {
      const transition = transitionOf(cascade.computed, thumb, options);
      expect(transition.properties).toEqual(["background-color"]);
      expect(transition.durations).toEqual([durations.base]);
      expect(transition.easings).toEqual([easings.inOut]);
    }
    const allowed = transitionOf(cascade.computed, thumb, { states: dot, ...motionAllowed });
    expect(allowed.properties).toEqual(["background-color", "translate"]);
    expect(allowed.durations).toEqual([durations.base]);
    expect(allowed.easings).toEqual([easings.inOut]);
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
    expect(cascade.computed(thumb, "background-color", { ...forced, states: dot })).toBe(
      "CanvasText",
    );
    expect(cascade.computed(track, "border-width")).toBe("1px");
  });
});
