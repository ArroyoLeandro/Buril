// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
import { Avatar } from "./avatar";

let cascade: Awaited<ReturnType<typeof createCascade>>;

beforeAll(async () => {
  cascade = await createCascade();
});

const rootOf = (html: string) => classList(/class="([^"]*)"/.exec(html)![1]!);
const fallback = rootOf(renderToStaticMarkup(<Avatar alt="Ada Lovelace" />));
const imageHtml = renderToStaticMarkup(<Avatar src="/ada.png" alt="Ada Lovelace" />);
const image = classList(/<img[^>]*class="([^"]*)"/.exec(imageHtml)![1]!);

describe("Avatar compiled with Tailwind", () => {
  it("is a 40px circle that clips its image", () => {
    expect(cascade.computed(fallback, "width")).toBe("calc(var(--spacing) * 10)");
    expect(cascade.computed(fallback, "border-radius")).toBe("calc(infinity * 1px)");
    expect(cascade.computed(fallback, "overflow")).toBe("hidden");
    expect(cascade.computed(image, "object-fit")).toBe("cover");
  });

  it("draws the initials in muted colors (6.45:1 light, 6.93:1 dark)", () => {
    expect(cascade.computed(fallback, "background-color")).toBe("var(--muted)");
    expect(cascade.computed(fallback, "color")).toBe("var(--muted-foreground)");
  });

  // Forced colors drop the fill; a border keeps the circle's edge.
  it("keeps the circle's edge in forced-colors mode", () => {
    expect(cascade.computed(fallback, "border-width")).toBeUndefined();
    expect(cascade.computed(fallback, "border-width", { forcedColors: true })).toBe("1px");
  });
});
