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
  it("moves a 16px thumb from the left to the right when on", () => {
    expect(cascade.computed(thumb, "width")).toBe("calc(var(--spacing) * 4)");
    expect(cascade.computed(thumb, "left")).toBe("var(--spacing)");
    expect(cascade.computed(thumb, "--tw-translate-x")).toBeUndefined();
    expect(cascade.computed(thumb, "--tw-translate-x", peerChecked)).toBe(
      "calc(var(--spacing) * 5)",
    );
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
