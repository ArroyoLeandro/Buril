// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import { docsNav } from "../../src/data/docs-nav";
import { getLocale } from "../../src/i18n/ui";
import { localizePath, pageRoutes, routeOf, unlocalizePath } from "../../src/i18n/paths";

/**
 * Every page exists in English and in Spanish: each English page has a Spanish twin under /es/
 * and each Spanish page an English one, each language version announces the other as an
 * alternate, and the header's language switcher leads to the twin. A page added in one language
 * only fails here.
 */
let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const pages = Object.fromEntries(
  Object.entries(
    import.meta.glob<AstroComponentFactory>("../../src/pages/**/*.astro", {
      eager: true,
      import: "default",
    }),
  ).map(([file, page]) => [routeOf(file), page]),
);

const render = (route: string) =>
  container.renderToString(pages[route]!, { request: new Request(`http://localhost${route}`) });

const english = pageRoutes.filter((route) => getLocale(route) === "en");
const spanish = pageRoutes.filter((route) => getLocale(route) === "es");
const twin = (route: string) =>
  localizePath(unlocalizePath(route), getLocale(route) === "en" ? "es" : "en");

const switcher = (html: string) => {
  const header = /<header[\s\S]*?<\/header>/.exec(html)![0];
  return /<a\b[^>]*data-language-switcher[^>]*>/.exec(header)?.[0];
};
const head = (html: string) => html.slice(0, html.indexOf("</head>"));

describe("English and Spanish page parity", () => {
  it("builds the pages it expects: the landing page, Getting Started and every component", () => {
    expect(english).toEqual(expect.arrayContaining(["/", "/docs", "/docs/components/button"]));
    expect(english.length).toBeGreaterThan(20);
  });

  it("gives every English page a Spanish twin", () => {
    expect(english.filter((route) => !pageRoutes.includes(twin(route)))).toEqual([]);
  });

  it("gives every Spanish page an English twin", () => {
    expect(spanish.filter((route) => !pageRoutes.includes(twin(route)))).toEqual([]);
  });

  it("has as many pages in each language", () => {
    expect(spanish).toHaveLength(english.length);
  });
});

describe.each(pageRoutes.map((route) => [route, twin(route)] as const))(
  "%s",
  (route, counterpart) => {
    const locale = getLocale(route);

    it("switches to its twin in the other language", async () => {
      const link = switcher(await render(route));
      expect(link, "language switcher").toBeDefined();
      expect(link).toContain(`href="${counterpart}"`);
      expect(link).toContain(`hreflang="${getLocale(counterpart)}"`);
      expect(link).toContain(`lang="${getLocale(counterpart)}"`);
    });

    it("lists both language versions and the English default as alternates", async () => {
      const html = head(await render(route));
      const [en, es] = locale === "en" ? [route, counterpart] : [counterpart, route];
      expect(html).toContain(`<link rel="alternate" hreflang="en" href="${en}">`);
      expect(html).toContain(`<link rel="alternate" hreflang="es" href="${es}">`);
      expect(html).toContain(`<link rel="alternate" hreflang="x-default" href="${en}">`);
      expect(html).toMatch(new RegExp(`<html lang="${locale}"`));
    });
  },
);

describe("Spanish navigation", () => {
  it("links every sidebar entry to a Spanish page", () => {
    const hrefs = docsNav("es").flatMap(({ items }) => items.map(({ href }) => href));
    expect(hrefs.filter((href) => !spanish.includes(href))).toEqual([]);
  });

  it("links every card on the Spanish components index to a Spanish page", async () => {
    const html = await render("/es/docs/components");
    const main = /<main[\s\S]*<\/main>/.exec(html)![0];
    const hrefs = [...main.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)].map(([, href]) => href!);
    expect(hrefs.length).toBeGreaterThan(17);
    expect(hrefs.filter((href) => !spanish.includes(href))).toEqual([]);
  });

  it("keeps the header's wordmark and main navigation in Spanish on every Spanish page", async () => {
    for (const route of spanish) {
      const header = /<header[\s\S]*?<\/header>/.exec(await render(route))![0];
      const hrefs = [...header.matchAll(/<a\b([^>]*)\shref="(\/[^"]*)"([^>]*)>/g)]
        .filter(([, before, , after]) => !`${before}${after}`.includes("data-language-switcher"))
        .map(([, , href]) => href!);
      expect(hrefs, route).toEqual(["/es/", "/es/docs", "/es/docs/components"]);
    }
  });
});
