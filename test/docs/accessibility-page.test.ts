// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import AccessibilityPage from "../../src/pages/docs/accessibility.astro";
import AccessibilityPageEs from "../../src/pages/es/docs/accessibility.astro";
import { accessibilityChecks, accessibilityRules, knownLimits } from "../../src/data/accessibility";
import { localizedComponentDocs } from "../../src/data/component-docs";
import { componentHref, documentedComponents } from "../../src/data/components";
import { docsNav } from "../../src/data/docs-nav";
import { localizedHref } from "../../src/i18n/paths";
import { locales, ui } from "../../src/i18n/ui";

/**
 * The Accessibility page: Buril's 11 rules in plain words and how each is checked, a summary of
 * every component's keyboard and ARIA behavior, and the known limits. Rules, checks and limits
 * come from `src/data/accessibility.ts`; the component summary from the component docs data.
 */
let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
const plain = (value: string) => value.replace(/`/g, "");
const main = (html: string) => /<main[\s\S]*<\/main>/.exec(html)![0];
/** The h2 sections of a page, by title. */
const sections = (html: string) =>
  Object.fromEntries(
    main(html)
      .split(/(?=<h2[\s>])/)
      .slice(1)
      .map((section) => [text(/<h2[^>]*>([\s\S]*?)<\/h2>/.exec(section)![1]!), section]),
  );
const rows = (table: string) =>
  [...table.matchAll(/<tr[\s\S]*?<\/tr>/g)].slice(1).map(([row]) => row);

describe("accessibility data", () => {
  it("has the 11 rules of COMPONENTS.md, in order, with the same titles", () => {
    const catalog = readFileSync(resolve(__dirname, "../../COMPONENTS.md"), "utf8");
    const titles = [...catalog.matchAll(/^(\d+)\. \*\*(.+?)\*\*/gm)].map(([, number, title]) => [
      Number(number),
      title!.replace(/\.$/, ""),
    ]);
    expect(titles).toHaveLength(11);
    expect(accessibilityRules.map(({ number, title }) => [number, title.en])).toEqual(titles);
  });

  it("explains every rule in both languages and names at least one check", () => {
    for (const rule of accessibilityRules) {
      for (const locale of locales) {
        expect(rule.title[locale].trim(), `rule ${rule.number} ${locale}`).not.toBe("");
        expect(rule.summary[locale].trim(), `rule ${rule.number} ${locale}`).not.toBe("");
        expect(rule.how[locale].trim(), `rule ${rule.number} ${locale}`).not.toBe("");
      }
      expect(rule.checks.length, `rule ${rule.number}`).toBeGreaterThan(0);
      for (const check of rule.checks) expect(Object.keys(accessibilityChecks)).toContain(check);
    }
  });

  it("marks the manual screen reader pass as pending", () => {
    expect(accessibilityChecks.manual.status).toBe("pending");
  });

  it("gives every component an ARIA role summary in both languages", () => {
    for (const { slug } of documentedComponents) {
      for (const locale of locales) {
        const docs = localizedComponentDocs(slug, locale)!;
        expect(docs.aria.role.trim(), `${slug} ${locale}`).not.toBe("");
        expect(docs.aria.note.trim(), `${slug} ${locale}`).not.toBe("");
      }
    }
  });
});

describe.each([
  ["en", AccessibilityPage, "/docs/accessibility", "Accessibility"],
  ["es", AccessibilityPageEs, "/es/docs/accessibility", "Accesibilidad"],
] as const)("%s Accessibility page", (locale, page, path, title) => {
  const render = () =>
    container.renderToString(page, { request: new Request(`http://localhost${path}`) });

  it("is one document with its title, in its language", async () => {
    const html = await render();
    expect(html).toMatch(new RegExp(`<html lang="${locale}"`));
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(text(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)![1]!)).toBe(title);
    expect(html).toContain(`<title>${title} | Buril UI</title>`);
  });

  it("lists the 11 rules with their summary and how each is checked", async () => {
    const table = /<table[\s\S]*?<\/table>/.exec(main(await render()))![0];
    const body = rows(table);
    expect(body).toHaveLength(11);
    for (const [index, rule] of accessibilityRules.entries()) {
      const row = text(body[index]!);
      expect(row).toContain(plain(rule.title[locale]));
      expect(row).toContain(plain(rule.summary[locale]));
      for (const check of rule.checks)
        expect(row).toContain(accessibilityChecks[check].name[locale]);
    }
  });

  it("describes every kind of check, and says the screen reader pass is pending", async () => {
    const html = text(main(await render()));
    for (const check of Object.values(accessibilityChecks)) {
      expect(html).toContain(check.name[locale]);
      expect(html).toContain(plain(check.description[locale]));
    }
    expect(html).toContain(locale === "es" ? "Pendiente" : "Pending");
  });

  it("summarizes every component's keyboard and ARIA behavior, linking to its page", async () => {
    const section = Object.entries(sections(await render())).find(([heading]) =>
      heading.startsWith(locale === "es" ? "Componentes" : "Components"),
    )![1];
    const body = rows(/<table[\s\S]*?<\/table>/.exec(section)![0]);
    expect(body).toHaveLength(documentedComponents.length);
    for (const [index, { slug, name }] of documentedComponents.entries()) {
      const row = body[index]!;
      expect(row).toContain(`href="${localizedHref(componentHref(slug), locale)}"`);
      expect(text(row)).toContain(name);
      const docs = localizedComponentDocs(slug, locale)!;
      expect(text(row)).toContain(plain(docs.aria.role));
      const keys = docs.keyboard ?? [];
      if (keys.length === 0) expect(text(row)).toContain(ui[locale]["component.noKeyboard"]);
      for (const { key } of keys) expect(text(row)).toContain(key);
    }
  });

  it("lists the known limits", async () => {
    const html = text(main(await render()));
    expect(knownLimits.length).toBeGreaterThan(2);
    for (const limit of knownLimits) expect(html).toContain(plain(limit[locale]));
  });
});

describe("Accessibility in the sidebar", () => {
  it.each(locales)("is a Getting Started page in %s", (locale) => {
    const [gettingStarted] = docsNav(locale);
    expect(gettingStarted!.items.map(({ href }) => href)).toContain(
      localizedHref("/docs/accessibility", locale),
    );
  });
});
