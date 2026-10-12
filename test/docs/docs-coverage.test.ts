// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import { componentHref, documentedComponents } from "../../src/data/components";
import { docsNav } from "../../src/data/docs-nav";
import { localizePath, pageRoutes, routeOf } from "../../src/i18n/paths";
import { getLocale, locales, ui, type Locale } from "../../src/i18n/ui";

/**
 * Coverage of the docs as a whole: every docs page can be reached from the sidebar or the header
 * in both languages, and every component page, in both languages, has the sections a reader
 * expects in the same order. Axe runs on every page in `axe-pages.test.ts`.
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

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

describe.each(locales)("docs pages in %s", (locale) => {
  const docsRoutes = pageRoutes.filter(
    (route) => getLocale(route) === locale && /^(\/es)?\/docs(\/|$)/.test(route),
  );

  it("are all linked from the sidebar, or from the header for the components index", () => {
    const sidebar = docsNav(locale).flatMap(({ items }) => items.map(({ href }) => href));
    const header = [localizePath("/docs/components", locale)];
    expect(docsRoutes.length).toBeGreaterThan(30);
    expect(docsRoutes.filter((route) => ![...sidebar, ...header].includes(route))).toEqual([]);
  });
});

/** The h2 titles of a page, each with the h3 titles under it. */
function outline(html: string) {
  const main = /<main[\s\S]*<\/main>/.exec(html)![0];
  return main
    .split(/(?=<h2[\s>])/)
    .slice(1)
    .map((section) => ({
      title: text(/<h2[^>]*>([\s\S]*?)<\/h2>/.exec(section)![1]!),
      subsections: [...section.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].map(([, inner]) =>
        text(inner!),
      ),
    }));
}

describe.each(
  locales.flatMap((locale) =>
    documentedComponents.map(({ slug }) => [locale, slug] as [Locale, string]),
  ),
)("the %s %s component page", (locale, slug) => {
  const t = ui[locale];

  it("has every required section, in order, with Keyboard and ARIA under Accessibility", async () => {
    const path = localizePath(componentHref(slug), locale);
    const html = await container.renderToString(pages[path]!, {
      request: new Request(`http://localhost${path}`),
    });
    const sections = outline(html);
    const required = [
      t["component.example"],
      t["component.installation"],
      t["component.usage"],
      t["component.examples"],
      t["component.api"],
      t["component.accessibility"],
    ];
    const titles = sections.map(({ title }) => title);
    expect(titles.slice(0, required.length)).toEqual(required);
    expect(
      sections.find(({ title }) => title === t["component.examples"])!.subsections.length,
    ).toBeGreaterThan(0);
    expect(
      sections.find(({ title }) => title === t["component.accessibility"])!.subsections,
    ).toEqual([t["component.keyboard"], t["component.aria"]]);
  });
});
