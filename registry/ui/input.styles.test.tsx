// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
import { Input } from "./input";

let cascade: Awaited<ReturnType<typeof createCascade>>;

beforeAll(async () => {
  cascade = await createCascade();
});

const classes = classList(/class="([^"]*)"/.exec(renderToStaticMarkup(<Input />))![1]!);

describe("Input compiled with Tailwind", () => {
  it("has a 1px border in the input token on the page background", () => {
    expect(cascade.computed(classes, "border-color")).toBe("var(--input)");
    expect(cascade.computed(classes, "border-width")).toBe("1px");
    expect(cascade.computed(classes, "background-color")).toBe("var(--background)");
    expect(cascade.computed(classes, "color")).toBe("var(--foreground)");
  });

  it("is at least 40px tall, like the default Button", () => {
    expect(cascade.computed(classes, "min-height")).toBe("calc(var(--spacing) * 10)");
  });

  it("uses a 16px font, so mobile browsers do not zoom in on focus", () => {
    expect(cascade.computed(classes, "font-size")).toBe("var(--text-base)");
  });

  it("shows placeholders in the muted text color", () => {
    expect(cascade.computed(classes, "color", { states: ["::placeholder"] })).toBe(
      "var(--muted-foreground)",
    );
  });

  it("shows a 2px ring outline with an offset on keyboard focus only", () => {
    const focus = { states: [":focus", ":focus-visible"] };
    expect(cascade.computed(classes, "outline-color", focus)).toBe("var(--ring)");
    expect(cascade.computed(classes, "outline-width", focus)).toBe("2px");
    expect(cascade.computed(classes, "outline-offset", focus)).toBe("2px");
    expect(cascade.computed(classes, "outline-color")).toBeUndefined();
  });

  it('turns the border destructive when aria-invalid="true"', () => {
    const invalid = { states: ['[aria-invalid="true"]'] };
    expect(cascade.computed(classes, "border-color", invalid)).toBe("var(--destructive)");
    // The focus ring still wins the outline, so focus stays visible on an invalid field.
    expect(
      cascade.computed(classes, "outline-color", {
        states: ['[aria-invalid="true"]', ":focus-visible"],
      }),
    ).toBe("var(--ring)");
  });

  it("dims and shows a not-allowed cursor when disabled", () => {
    const disabled = { states: [":disabled"] };
    expect(cascade.computed(classes, "opacity", disabled)).toBe("50%");
    expect(cascade.computed(classes, "cursor", disabled)).toBe("not-allowed");
    expect(cascade.computed(classes, "opacity")).toBeUndefined();
  });
});
