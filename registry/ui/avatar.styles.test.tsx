// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import { classList, createCascade } from "../../test/tailwind-cascade";
import { durations, easings, motionReduced, transitionOf } from "../../test/motion-assertions";
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

// While the image loads, the initials show; once it loads, it fades in over them and they fade
// out, so a transparent picture does not show letters through it.
describe("Avatar image fade", () => {
  const initials = classList(/<img[^>]*>\s*<span[^>]*class="([^"]*)"/.exec(imageHtml)![1]!);
  const loading = { states: ["[data-loading]"] };
  const imageLoading = { states: [":is(:where(.peer)[data-loading] ~ *)"] };

  it("lays the image over the initials", () => {
    expect(cascade.computed(image, "position")).toBe("absolute");
    expect(cascade.computed(image, "inset")).toBe("0px");
  });

  it("shows the image without JavaScript: only a script marks it as loading", () => {
    expect(/<img[^>]*>/.exec(imageHtml)![0]).not.toMatch(/\sdata-loading(=|\s|\/?>)/);
    expect(cascade.computed(image, "opacity")).toBeUndefined();
  });

  it("hides the image while it loads and shows the initials under it", () => {
    expect(cascade.computed(image, "opacity", loading)).toBe("0%");
    expect(cascade.computed(initials, "opacity")).toBe("0%");
    expect(cascade.computed(initials, "opacity", imageLoading)).toBe("100%");
  });

  it("cross-fades with the fast token in every motion mode", () => {
    for (const element of [image, initials]) {
      for (const options of [{}, motionReduced]) {
        const transition = transitionOf(cascade.computed, element, options);
        expect(transition.properties).toEqual(["opacity"]);
        expect(transition.durations).toEqual([durations.fast]);
        expect(transition.easings).toEqual([easings.out]);
      }
    }
  });

  it("does not hide the initials of an avatar without an image", () => {
    const html = renderToStaticMarkup(<Avatar alt="Ada Lovelace" />);
    const letters = classList(/<span[^>]*><span[^>]*class="([^"]*)"/.exec(html)?.[1] ?? "");
    expect(cascade.computed(letters, "opacity")).toBeUndefined();
  });
});
