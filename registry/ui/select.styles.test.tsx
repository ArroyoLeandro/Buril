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
import { Input } from "./input";
import { Select } from "./select";

let cascade: Awaited<ReturnType<typeof createCascade>>;

beforeAll(async () => {
  cascade = await createCascade();
});

const html = renderToStaticMarkup(
  <Select>
    <option>One</option>
  </Select>,
);
const classesOf = (tag: RegExp, source = html) =>
  classList(/class="([^"]*)"/.exec(tag.exec(source)![0])![1]!);

const select = classesOf(/<select[^>]*>/);
const chevron = classesOf(/<svg[^>]*>/);
const input = classesOf(/<input[^>]*>/, renderToStaticMarkup(<Input />));

describe("Select compiled with Tailwind", () => {
  it("replaces the native arrow and leaves room for its own chevron", () => {
    expect(cascade.computed(select, "appearance")).toBe("none");
    // pr-10 must come after the px-3 shorthand in the generated CSS, or the text runs under it.
    expect(cascade.lastOf(select, ["padding-inline", "padding-right"])).toEqual({
      property: "padding-right",
      value: "calc(var(--spacing) * 10)",
    });
  });

  it.each(["border-color", "background-color", "min-height", "font-size", "border-radius"])(
    "matches the Input's %s",
    (property) => {
      expect(cascade.computed(select, property)).toBe(cascade.computed(input, property));
    },
  );

  it("shows the ring outline on keyboard focus and a destructive border when invalid", () => {
    expect(
      cascade.computed(select, "outline-color", { states: [":focus", ":focus-visible"] }),
    ).toBe("var(--ring)");
    expect(cascade.computed(select, "border-color", { states: ['[aria-invalid="true"]'] })).toBe(
      "var(--destructive)",
    );
  });

  it("places the chevron inside the right edge, where it never takes a click", () => {
    expect(cascade.computed(chevron, "position")).toBe("absolute");
    expect(cascade.computed(chevron, "right")).toBe("calc(var(--spacing) * 3)");
    expect(cascade.computed(chevron, "pointer-events")).toBe("none");
    expect(cascade.computed(chevron, "color")).toBe("var(--foreground)");
  });

  it("dims the select and its chevron when disabled", () => {
    expect(cascade.computed(select, "opacity", { states: [":disabled"] })).toBe("50%");
    expect(
      cascade.computed(chevron, "opacity", { states: [":is(:where(.peer):disabled ~ *)"] }),
    ).toBe("50%");
  });

  it("falls back to the native arrow in forced-colors mode", () => {
    expect(cascade.computed(select, "appearance", { forcedColors: true })).toBe("auto");
    expect(cascade.computed(chevron, "display", { forcedColors: true })).toBe("none");
  });
});

describe("Select motion", () => {
  it("fades its border and colors with the fast token, never the focus ring", () => {
    for (const states of [[], [":focus", ":focus-visible"], ['[aria-invalid="true"]']]) {
      const transition = transitionOf(cascade.computed, select, { states });
      expectInstantFocusRing(transition.properties);
      expect(transition.properties).toEqual(["color", "background-color", "border-color"]);
      expect(transition.durations).toEqual([durations.fast]);
      expect(transition.easings).toEqual([easings.out]);
    }
  });
});

// While the picker is open the chevron turns over. Rotation is movement, so it only runs when the
// user allows motion; browsers without `:open` simply never turn it.
describe("Select chevron motion", () => {
  const open = { states: [":is(:where(.peer):is([open], :popover-open, :open) ~ *)"] };

  it("turns over while the picker is open, only when motion is allowed", () => {
    expect(cascade.computed(chevron, "rotate")).toBeUndefined();
    expect(cascade.computed(chevron, "rotate", open)).toBeUndefined();
    expect(cascade.computed(chevron, "rotate", { ...open, ...motionReduced })).toBeUndefined();
    expect(cascade.computed(chevron, "rotate", { ...open, ...motionAllowed })).toBe("180deg");
  });

  it("keeps its vertical centering while it turns", () => {
    expect(cascade.computed(chevron, "--tw-translate-y", { ...open, ...motionAllowed })).toBe(
      "calc(calc(1 / 2 * 100%) * -1)",
    );
  });

  it("turns with the base token, and has no transition under reduced motion", () => {
    const transition = transitionOf(cascade.computed, chevron, motionAllowed);
    expect(transition.properties).toEqual(["rotate"]);
    expect(transition.durations).toEqual([durations.base]);
    expect(transition.easings).toEqual([easings.out]);
    expect(transitionOf(cascade.computed, chevron, motionReduced).properties).toBeUndefined();
  });
});
