// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

let cascade: Awaited<ReturnType<typeof createCascade>>;

beforeAll(async () => {
  cascade = await createCascade();
});

const html = renderToStaticMarkup(
  <Card decor>
    <CardHeader>
      <CardTitle>Title</CardTitle>
      <CardDescription>Description</CardDescription>
    </CardHeader>
    <CardContent>Content</CardContent>
    <CardFooter>Footer</CardFooter>
  </Card>,
);
const classesOf = (slot: string) =>
  classList(new RegExp(`<[^>]*data-slot="${slot}"[^>]*class="([^"]*)"`).exec(html)![1]!);
const decorClasses = classList(/<div[^>]*data-decor[^>]*class="([^"]*)"/.exec(html)![1]!);

const card = classesOf("card");
const title = classesOf("card-title");
const description = classesOf("card-description");
const content = classesOf("card-content");

describe("Card compiled with Tailwind", () => {
  it("has a 1px border in the border color on the card colors", () => {
    expect(cascade.computed(card, "border-width")).toBe("1px");
    expect(cascade.computed(card, "border-color")).toBe("var(--border)");
    expect(cascade.computed(card, "background-color")).toBe("var(--card)");
    expect(cascade.computed(card, "color")).toBe("var(--card-foreground)");
  });

  // A stretched link inside a heading uses the card as its containing block.
  it("is the positioning context for a stretched link", () => {
    expect(cascade.computed(card, "position")).toBe("relative");
  });

  it("uses the body font for the title, never the display font", () => {
    expect(cascade.computed(title, "font-family")).toBeUndefined();
    expect(cascade.computed(title, "font-weight")).toBe("var(--font-weight-semibold)");
  });

  it("uses the muted foreground for the description", () => {
    expect(cascade.computed(description, "color")).toBe("var(--muted-foreground)");
  });

  it("pads the content inline", () => {
    expect(cascade.computed(content, "padding-inline")).toBe("calc(var(--spacing) * 6)");
  });

  describe("decor band", () => {
    const image = () => cascade.computed(decorClasses, "background-image") ?? "";

    it("draws a hatch in the decor color, with primary as the fallback", () => {
      expect(image()).toMatch(/^repeating-linear-gradient\(/);
      expect(image()).toMatch(/var\(--decor,\s*var\(--primary\)\)/);
    });

    // Forced colors replace the palette; a decorative band would only add noise there.
    it("is removed in forced-colors mode", () => {
      expect(cascade.computed(decorClasses, "display", { forcedColors: true })).toBe("none");
    });
  });

  it("keeps the border in forced-colors mode", () => {
    expect(cascade.computed(card, "border-width", { forcedColors: true })).toBe("1px");
    expect(cascade.computed(card, "border-style", { forcedColors: true })).not.toBe("none");
  });
});
