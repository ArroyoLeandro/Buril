// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import astroConfig from "../../astro.config.mjs";
import IndexPage from "../../src/pages/index.astro";
import ButtonPage from "../../src/pages/docs/components/button.astro";
import LanguageSwitcher from "../../src/components/LanguageSwitcher.astro";
import { docsNav } from "../../src/data/docs-nav";
import { localizePath, pageRoutes, unlocalizePath } from "../../src/i18n/paths";
import { ui, type Locale } from "../../src/i18n/ui";

/**
 * The localized site shell: language, alternates, header, sidebar, TOC and footer. The shell reads
 * the locale from the URL, so rendering a page at its /es/ address shows the Spanish shell.
 */
let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const render = (page: AstroComponentFactory, path: string) =>
  container.renderToString(page, { request: new Request(`http://localhost${path}`) });

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** A link for a `locale` reader: the page in that language, or English until it is translated. */
const expectedHref = (page: string, locale: Locale) => {
  const translated = localizePath(page, locale);
  return pageRoutes.includes(translated) ? translated : page;
};
const header = (html: string) => /<header[\s\S]*?<\/header>/.exec(html)![0];
const footer = (html: string) => /<footer[\s\S]*?<\/footer>/.exec(html)![0];

describe("i18n config", () => {
  it("uses Astro's built-in routing with unprefixed English and Spanish under /es/", () => {
    expect(astroConfig.i18n).toMatchObject({
      locales: ["en", "es"],
      defaultLocale: "en",
      routing: { prefixDefaultLocale: false },
    });
  });
});

describe.each([
  ["en", "/docs/components/button"],
  ["es", "/es/docs/components/button"],
] as const)("%s shell", (locale, path) => {
  const t = ui[locale];

  it("sets the document language", async () => {
    expect(await render(ButtonPage, path)).toMatch(new RegExp(`<html lang="${locale}"`));
  });

  it("opens with a skip link in the page language", async () => {
    const html = await render(ButtonPage, path);
    const body = html.slice(html.indexOf("<body"));
    const first = /<a\b[^>]*>[\s\S]*?<\/a>/.exec(body)![0];
    expect(first).toMatch(/href="#main"/);
    expect(text(first)).toBe(t["skipLink"]);
  });

  it("links the wordmark and the main nav to pages in the same language", async () => {
    const html = header(await render(ButtonPage, path));
    const home = locale === "es" ? "/es/" : "/";
    const docs = expectedHref("/docs", locale);
    const components = expectedHref("/docs/components", locale);
    expect(html).toMatch(new RegExp(`<a[^>]+href="${home}"[^>]*>[\\s\\S]*?Buril UI`));
    const nav = new RegExp(`<nav[^>]*aria-label="${t["nav.main"]}"[\\s\\S]*?</nav>`).exec(html);
    expect(nav).not.toBeNull();
    expect(nav![0]).toMatch(
      new RegExp(`<a[^>]+href="${docs}"[^>]*>\\s*${escape(t["nav.docs"])}\\s*</a>`),
    );
    expect(nav![0]).toMatch(
      new RegExp(`<a[^>]+href="${components}"[^>]*>\\s*${escape(t["nav.components"])}\\s*</a>`),
    );
  });

  it("labels the theme toggle in the page language", async () => {
    const html = await render(ButtonPage, path);
    const group = new RegExp(
      `<div[^>]*role="group"[^>]*aria-label="${t["theme.label"]}"[\\s\\S]*?</div>`,
    ).exec(html);
    expect(group).not.toBeNull();
    const labels = [...group![0].matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)].map(
      ([, label]) => text(label!),
    );
    expect(labels).toEqual([t["theme.light"], t["theme.dark"], t["theme.system"]]);
  });

  it("labels the sidebar, its groups and the menu button, and links the same language", async () => {
    const html = await render(ButtonPage, path);
    const nav = new RegExp(`<nav[^>]*aria-label="${t["docsNav.label"]}"[\\s\\S]*?</nav>`).exec(
      html,
    )![0];
    for (const group of docsNav(locale)) {
      expect(nav).toMatch(new RegExp(`>\\s*${escape(group.title)}\\s*<`));
      for (const item of group.items) {
        expect(item.href).toBe(expectedHref(unlocalizePath(item.href), locale));
        expect(nav).toContain(`href="${item.href}"`);
      }
    }
    // Rendered at its /es/ address before the Spanish page exists, the page has no link of its own.
    const current = [...nav.matchAll(/<a[^>]+aria-current="page"[^>]*>/g)];
    expect(current).toHaveLength(pageRoutes.includes(path) ? 1 : 0);
    if (current.length > 0) expect(current[0]![0]).toContain(`href="${path}"`);
    const button = /<button[^>]*data-docs-nav-toggle[^>]*>[\s\S]*?<\/button>/.exec(html)![0];
    expect(text(button)).toBe(t["docsNav.menu"]);
  });

  it("titles the On this page list in the page language", async () => {
    const html = await render(ButtonPage, path);
    const toc = new RegExp(`<nav[^>]*aria-label="${t["toc.title"]}"[\\s\\S]*?</nav>`).exec(html);
    expect(toc).not.toBeNull();
    expect(text(toc![0])).toContain(t["toc.title"]);
  });

  it("writes the footer in the page language", async () => {
    const html = text(footer(await render(ButtonPage, path)));
    expect(html).toContain(t["footer.licenseLink"]);
    expect(html).toContain(t["footer.source"]);
  });
});

describe("Spanish docs sidebar", () => {
  it("translates the group titles", () => {
    expect(docsNav("es").map(({ title }) => title)).toEqual([
      "Primeros pasos",
      "Acciones",
      "Formularios",
      "Contenido",
      "Avisos y estados",
      "Navegación",
    ]);
    expect(docsNav("es")[0]!.items.map(({ name, href }) => [name, href])).toEqual([
      ["Introducción", expectedHref("/docs", "es")],
      ["Instalación", expectedHref("/docs/installation", "es")],
      ["Temas", expectedHref("/docs/theming", "es")],
    ]);
  });
});

describe("language switcher", () => {
  const renderSwitcher = (locale: "en" | "es") =>
    container.renderToString(LanguageSwitcher, {
      props: {
        locale,
        versions: [
          { locale: "en", href: "/docs/components/button" },
          { locale: "es", href: "/es/docs/components/button" },
        ],
      },
    });

  it("links to the same page in the other language, marked with its language", async () => {
    const english = await renderSwitcher("es");
    expect(english).toMatch(/<a[^>]+href="\/docs\/components\/button"/);
    expect(english).toMatch(/hreflang="en"/);
    expect(english).toMatch(/lang="en"/);
    // The name is the target language's own name, which readers of that language recognise.
    expect(text(english)).toBe("English");

    const spanish = await renderSwitcher("en");
    expect(spanish).toMatch(/<a[^>]+href="\/es\/docs\/components\/button"/);
    expect(spanish).toMatch(/hreflang="es"/);
    expect(spanish).toMatch(/lang="es"/);
    expect(text(spanish)).toBe("Español");
  });

  it("keeps the switcher a visible, comfortable target on small screens", async () => {
    const link = /<a[^>]*>/.exec(await renderSwitcher("en"))![0];
    const classes = /class="([^"]*)"/.exec(link)![1]!.split(/\s+/);
    // 32px tall, like the theme buttons beside it, and above the 24px target size minimum.
    expect(classes).toContain("min-h-8");
    expect(classes.filter((name) => /^(hidden|sr-only)$|^max-\w+:hidden$/.test(name))).toEqual([]);
    // The icon is decoration: the language name is the whole accessible name.
    expect(await renderSwitcher("en")).toMatch(/<svg[^>]*aria-hidden="true"/);
  });

  it("renders nothing when the page has no other language", async () => {
    const html = await container.renderToString(LanguageSwitcher, {
      props: { locale: "en", versions: [] },
    });
    expect(html.trim()).toBe("");
  });

  it("is left out, with the alternates, while a page has no translation", async () => {
    const html = await render(ButtonPage, "/docs/components/button");
    expect(html).not.toMatch(/hreflang=/);
    expect(header(html)).not.toMatch(/data-language-switcher/);
  });

  it("uses the localized default description", async () => {
    const html = await render(IndexPage, "/es/");
    expect(html).toContain(`<meta name="description" content="${ui.es["site.description"]}"`);
  });
});
