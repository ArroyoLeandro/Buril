// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
import { Separator } from "./separator";

let cascade: Awaited<ReturnType<typeof createCascade>>;

beforeAll(async () => {
  cascade = await createCascade();
});

const classesOf = (html: string) => classList(/class="([^"]*)"/.exec(html)![1]!);
const horizontal = classesOf(renderToStaticMarkup(<Separator />));
const vertical = classesOf(renderToStaticMarkup(<Separator orientation="vertical" />));

describe("Separator compiled with Tailwind", () => {
  // A border, not a background: forced colors keep borders and drop backgrounds.
  it("draws a 1px top border in the border color when horizontal", () => {
    expect(cascade.computed(horizontal, "border-top-width")).toBe("1px");
    expect(cascade.computed(horizontal, "border-color")).toBe("var(--border)");
    expect(cascade.computed(horizontal, "background-color")).toBeUndefined();
    expect(cascade.computed(horizontal, "width")).toBe("100%");
  });

  it("draws a 1px left border that stretches with its row when vertical", () => {
    expect(cascade.computed(vertical, "border-left-width")).toBe("1px");
    expect(cascade.computed(vertical, "border-color")).toBe("var(--border)");
    expect(cascade.computed(vertical, "background-color")).toBeUndefined();
    expect(cascade.computed(vertical, "align-self")).toBe("stretch");
  });

  // The hr's own default borders must not add a second line.
  it("zeroes the other borders of the hr, so only the top border shows", () => {
    expect(cascade.lastOf(horizontal, ["border-width", "border-top-width"])?.property).toBe(
      "border-top-width",
    );
  });
});
