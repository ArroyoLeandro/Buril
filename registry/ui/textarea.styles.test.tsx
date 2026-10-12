// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
import {
  durations,
  easings,
  expectInstantFocusRing,
  transitionOf,
} from "../../test/motion-assertions";
import { Input } from "./input";
import { Textarea } from "./textarea";

let cascade: Awaited<ReturnType<typeof createCascade>>;

beforeAll(async () => {
  cascade = await createCascade();
});

const classesOf = (html: string) => classList(/class="([^"]*)"/.exec(html)![1]!);
const textarea = classesOf(renderToStaticMarkup(<Textarea />));
const input = classesOf(renderToStaticMarkup(<Input />));

describe("Textarea compiled with Tailwind", () => {
  // Input and Textarea are separate items, so each file carries the shared field look. This keeps
  // the copies in step: only the height and resize classes may differ.
  it("matches the Input apart from its height and resizing", () => {
    const own = (name: string) => /^(min-h-|resize|field-sizing)/.test(name);
    expect(textarea.filter((name) => !own(name)).sort()).toEqual(
      input.filter((name) => !own(name)).sort(),
    );
  });

  it("has the input border, the ring focus outline and the destructive invalid border", () => {
    expect(cascade.computed(textarea, "border-color")).toBe("var(--input)");
    expect(
      cascade.computed(textarea, "outline-color", { states: [":focus", ":focus-visible"] }),
    ).toBe("var(--ring)");
    expect(cascade.computed(textarea, "border-color", { states: ['[aria-invalid="true"]'] })).toBe(
      "var(--destructive)",
    );
  });

  it("starts at about three lines tall and only resizes vertically", () => {
    expect(cascade.computed(textarea, "min-height")).toBe("calc(var(--spacing) * 20)");
    expect(cascade.computed(textarea, "resize")).toBe("vertical");
  });
});

describe("Textarea motion", () => {
  it("fades its border and colors with the fast token, never the focus ring", () => {
    for (const states of [[], [":focus", ":focus-visible"], ['[aria-invalid="true"]']]) {
      const transition = transitionOf(cascade.computed, textarea, { states });
      expectInstantFocusRing(transition.properties);
      expect(transition.properties).toEqual(["color", "background-color", "border-color"]);
      expect(transition.durations).toEqual([durations.fast]);
      expect(transition.easings).toEqual([easings.out]);
    }
  });
});
