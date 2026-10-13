import { commands } from "vitest/browser";
import { describe, expect, inject, it } from "vitest";

/**
 * The site shell in a real browser: the site icons, read from whole pages served by Astro's dev
 * server (`test/docs-site.ts`) and probed with `test/site-probe.ts`.
 */
const origin = inject("docsOrigin");
const pages = ["/", "/es/", "/docs/components/button", "/es/docs/components/button"];

interface IconBox {
  name: string;
  width: number;
  height: number;
  stroke: string;
  color: string;
}

const visibleHeaderIcons = `(() => {
  const icons = [...document.querySelectorAll("header svg[data-icon]")].filter(
    (icon) => icon.getBoundingClientRect().width > 0,
  );
  return {
    icons: icons.map((icon) => {
      const box = icon.getBoundingClientRect();
      const style = getComputedStyle(icon);
      return { name: icon.dataset.icon, width: box.width, height: box.height, stroke: style.stroke, color: style.color };
    }),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  };
})()`;

describe.each([320, 1440])("site icons at %ipx", (width) => {
  it.each(pages)("%s draws the header icons at 16px in the text color", async (path) => {
    const { status, result } = await commands.probePage<{
      icons: IconBox[];
      scrollWidth: number;
      clientWidth: number;
    }>(origin, path, {
      width,
      steps: [{ until: `!document.querySelector("[data-theme-toggle]")?.hidden` }],
      evaluate: visibleHeaderIcons,
    });
    expect(status).toBe(200);
    // Phones show the theme cycle and the menu; the globe is dropped below sm. Desktops show the
    // globe; the theme is the button group and the menu button is hidden.
    const names = result.icons.map(({ name }) => name);
    expect(names).toEqual(width === 320 ? ["monitor", "menu"] : ["globe"]);
    for (const icon of result.icons) {
      expect(icon.width, icon.name).toBe(16);
      expect(icon.height, icon.name).toBe(16);
      expect(icon.stroke, icon.name).toBe(icon.color);
    }
    expect(result.scrollWidth).toBeLessThanOrEqual(result.clientWidth);
  });
});

describe("Copy button icon", () => {
  it.each(["/", "/es/"])("%s swaps the copy icon for a check while copied", async (path) => {
    const { result } = await commands.probePage<{ before: string[]; after: string[] }>(
      origin,
      path,
      {
        width: 1440,
        evaluate: `(() => {
          const button = document.querySelector("main [role=tabpanel]:not([hidden]) [data-copy]");
          const shown = () =>
            [...button.querySelectorAll("svg[data-icon]")]
              .filter((icon) => getComputedStyle(icon).display !== "none")
              .map((icon) => icon.dataset.icon);
          const before = shown();
          button.setAttribute("data-copy-done", "");
          return { before, after: shown() };
        })()`,
      },
    );
    expect(result).toEqual({ before: ["copy"], after: ["check"] });
  });
});

describe("install tab logos", () => {
  it.each(["light", "dark"] as const)(
    "draw in the tab's text color in the %s theme",
    async (colorScheme) => {
      const { result } = await commands.probePage<
        { name: string; width: number; fill: string; color: string }[]
      >(origin, "/", {
        width: 1440,
        colorScheme,
        evaluate: `[...document.querySelectorAll("main [role=tab] svg[data-logo]")].map((logo) => ({
          name: logo.dataset.logo,
          width: logo.getBoundingClientRect().width,
          fill: getComputedStyle(logo).fill,
          color: getComputedStyle(logo.closest("[role=tab]")).color,
        }))`,
      });
      expect(result.map(({ name }) => name)).toEqual(["npm", "pnpm", "yarn", "bun"]);
      for (const logo of result) {
        expect(logo.width, logo.name).toBe(14);
        expect(logo.fill, logo.name).toBe(logo.color);
      }
    },
  );
});

describe("Buril mark", () => {
  it.each([
    ["/", "light"],
    ["/", "dark"],
    ["/es/docs/components/button", "dark"],
  ] as const)(
    "%s draws the mark in ink with the cut in the decoration red (%s)",
    async (path, colorScheme) => {
      const { result } = await commands.probePage<{
        size: number[];
        rings: string;
        cut: string;
        decor: string;
        color: string;
        maskRendered: boolean;
      }>(origin, path, {
        width: 1440,
        colorScheme,
        evaluate: `(() => {
        const mark = document.querySelector("header svg[data-logo=buril]");
        const box = mark.getBoundingClientRect();
        const probe = document.createElement("span");
        probe.style.color = "var(--decor)";
        document.body.append(probe);
        const decor = getComputedStyle(probe).color;
        probe.remove();
        return {
          size: [box.width, box.height],
          rings: getComputedStyle(mark.querySelector("circle")).stroke,
          cut: getComputedStyle(mark.querySelector("path.text-decor")).stroke,
          decor,
          color: getComputedStyle(mark.closest("a")).color,
          maskRendered: !!document.getElementById(mark.querySelector("mask").id),
        };
      })()`,
      });
      expect(result.size).toEqual([22, 22]);
      expect(result.rings).toBe(result.color);
      expect(result.cut).toBe(result.decor);
      expect(result.cut).not.toBe(result.color);
      expect(result.maskRendered).toBe(true);
    },
  );

  it("serves the SVG favicon the head links to", async () => {
    const { result } = await commands.probePage<{ href: string; status: number; type: string }>(
      origin,
      "/es/",
      {
        width: 1440,
        evaluate: `(async () => {
          const link = document.querySelector('link[rel="icon"]');
          const response = await fetch(link.href);
          return { href: link.getAttribute("href"), status: response.status, type: response.headers.get("content-type") };
        })()`,
      },
    );
    expect(result.href).toBe("/favicon.svg");
    expect(result.status).toBe(200);
    expect(result.type).toMatch(/^image\/svg\+xml/);
  });
});
