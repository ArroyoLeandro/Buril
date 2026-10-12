// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
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

  // The thumb's position, not only its color, tells off from on.
  it("moves the thumb from the left to the right when on", () => {
    expect(cascade.computed(thumb, "left")).toBe("var(--spacing)");
    expect(cascade.computed(thumb, "--tw-translate-x")).toBeUndefined();
    expect(cascade.computed(thumb, "left", peerChecked)).toBeDefined();
    expect(cascade.computed(thumb, "--tw-translate-x", peerChecked)).toBeDefined();
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
   * Resolve the thumb geometry for a track of a given size: lengths in px, with `100%` of the
   * track's width for `left`, of its height for `height`, and of the thumb's own width for
   * `translate`, the way a browser resolves them.
   */
  function thumbBox(width: number, height: number, state = {}) {
    const resolve = (value: string | undefined, percent: number) => {
      if (value === undefined) return 0;
      const expression = value
        .replaceAll("var(--spacing)", "4")
        .replaceAll("calc(", "(")
        .replace(/(-?[\d.]+)%/g, (_, amount: string) => `(${(Number(amount) / 100) * percent})`)
        .replace(/(-?[\d.]+)px/g, "$1")
        .replace(/(-?[\d.]+)rem/g, (_, amount: string) => `${Number(amount) * 16}`);
      if (!/^[\d\s.+\-*/()]+$/.test(expression)) throw new Error(`Cannot resolve ${value}`);
      return Number(new Function(`return ${expression}`)());
    };
    const size = resolve(cascade.computed(thumb, "height", state), height);
    const ratio = cascade.computed(thumb, "aspect-ratio", state);
    const left = resolve(cascade.computed(thumb, "left", state), width);
    const shift = resolve(cascade.computed(thumb, "--tw-translate-x", state), size);
    return { size, ratio, start: left + shift };
  }

  // A consumer can size the track with className; the thumb must still fit and travel fully.
  it.each([
    [44, 24],
    [36, 24],
    [56, 32],
    [64, 40],
  ])("keeps the thumb inside a %ix%ipx track with equal gaps, off and on", (width, height) => {
    const off = thumbBox(width, height);
    const on = thumbBox(width, height, peerChecked);
    expect(off.ratio).toBe("1 / 1");
    expect(off.size).toBe(height - 8);
    expect(off.start).toBe(4);
    expect(on.size).toBe(height - 8);
    expect(width - (on.start + on.size)).toBe(4);
  });

  it("contrasts the thumb with the track in both states", () => {
    expect(cascade.computed(thumb, "background-color")).toBe("var(--muted-foreground)");
    expect(cascade.computed(thumb, "background-color", peerChecked)).toBe(
      "var(--primary-foreground)",
    );
  });

  it("animates the thumb only when the user allows motion", () => {
    expect(cascade.computed(thumb, "transition-property")).toBeUndefined();
    expect(
      cascade.computed(thumb, "transition-property", {
        media: ["(prefers-reduced-motion: no-preference)"],
      }),
    ).toMatch(/translate/);
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
    expect(cascade.computed(thumb, "background-color", forced)).toBe("CanvasText");
    expect(cascade.computed(track, "border-width")).toBe("1px");
  });
});
