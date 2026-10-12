// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
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
