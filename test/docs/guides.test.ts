// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import { documentedComponents, componentHref } from "../../src/data/components";
import { docsNav } from "../../src/data/docs-nav";
import { guideHref, guides, migrationNotes } from "../../src/data/guides";
import { neutralPresetExample } from "../../src/data/snippets";
import { localizedHref, localizePath } from "../../src/i18n/paths";
import { locales, type Locale } from "../../src/i18n/ui";
import { noFlashScriptFor } from "../../src/scripts/theme";

/**
 * The guides under /docs/guides: one page per guide in each language, a Guides group in the
 * sidebar, and the facts each guide must state, so a rewrite cannot quietly drop them.
 */
let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const pages = import.meta.glob<AstroComponentFactory>(
  ["../../src/pages/docs/guides/*.astro", "../../src/pages/es/docs/guides/*.astro"],
  { eager: true, import: "default" },
);
const pageFile = (slug: string, locale: Locale) =>
  `../../src/pages/${locale === "es" ? "es/" : ""}docs/guides/${slug}.astro`;

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
const main = (html: string) => /<main[\s\S]*<\/main>/.exec(html)![0];
const render = (slug: string, locale: Locale) =>
  container.renderToString(pages[pageFile(slug, locale)]!, {
    request: new Request(`http://localhost${localizePath(guideHref(slug), locale)}`),
  });

describe("guides data", () => {
  it("lists the five guides with titles and descriptions in both languages", () => {
    expect(guides.map(({ slug }) => slug)).toEqual([
      "forms",
      "dark-mode",
      "theme",
      "shadcn",
      "migrating-from-shadcn",
    ]);
    for (const guide of guides)
      for (const locale of locales) {
        expect(guide.title[locale].trim()).not.toBe("");
        expect(guide.description[locale].trim()).not.toBe("");
      }
  });

  it("has a migration note for every documented component, in both languages", () => {
    expect(Object.keys(migrationNotes).sort()).toEqual(
      documentedComponents.map(({ slug }) => slug).sort(),
    );
    for (const note of Object.values(migrationNotes))
      for (const locale of locales) expect(note[locale].trim()).not.toBe("");
  });
});

describe.each(locales)("guides in %s", (locale) => {
  it("lists every guide in a Guides group, right after Getting Started", () => {
    const [, group] = docsNav(locale);
    expect(group!.title).toBe(locale === "es" ? "Guías" : "Guides");
    expect(group!.items.map(({ name, href }) => [name, href])).toEqual(
      guides.map(({ slug, title }) => [title[locale], localizedHref(guideHref(slug), locale)]),
    );
  });

  it.each(guides)("$slug is one document titled after the guide", async ({ slug, title }) => {
    expect(pages[pageFile(slug, locale)], `${slug} ${locale}`).toBeDefined();
    const html = await render(slug, locale);
    expect(html).toMatch(new RegExp(`<html lang="${locale}"`));
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(text(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)![1]!)).toBe(title[locale]);
    expect(html).toContain(`<title>${title[locale]} | Buril UI</title>`);
  });

  it("forms: shows the real example with the render prop, errors and the configurable strings", async () => {
    const html = text(main(await render("forms", locale)));
    expect(html).toContain("{(control) =>");
    expect(html).toContain('from "@/components/ui/field"');
    expect(html).not.toMatch(/registry\/ui/);
    for (const prop of ["error", "required", "requiredLabel", "errorPrefix", "noValidate"])
      expect(html).toContain(prop);
  });

  it("dark mode: covers next-themes, Astro and Vite, with the no-flash script", async () => {
    const html = text(main(await render("dark-mode", locale)));
    expect(html).toContain('attribute="class"');
    expect(html).toContain("suppressHydrationWarning");
    expect(html).toContain("is:inline");
    expect(html).toContain("index.html");
    expect(html).toContain(text(noFlashScriptFor("theme")).slice(0, 80));
  });

  it("theme: changes the red, offers a neutral preset and retunes the motion tokens", async () => {
    const html = text(main(await render("theme", locale)));
    expect(html).toContain("--ring");
    expect(html).toContain(text(neutralPresetExample).slice(0, 60));
    expect(html).toContain("--buril-duration-base");
  });

  it("shadcn: installs next to existing components with --path", async () => {
    const html = text(main(await render("shadcn", locale)));
    expect(html).toContain("--path");
    expect(html).toContain("components.json");
  });

  it("migrating: tables every component with its link and its API differences", async () => {
    const html = main(await render("migrating-from-shadcn", locale));
    const table = /<table[\s\S]*?<\/table>/.exec(html)![0];
    const rows = [...table.matchAll(/<tr[\s\S]*?<\/tr>/g)].slice(1).map(([row]) => row);
    expect(rows).toHaveLength(documentedComponents.length);
    for (const [index, { slug, name }] of documentedComponents.entries()) {
      expect(rows[index]).toContain(`href="${localizedHref(componentHref(slug), locale)}"`);
      expect(text(rows[index]!)).toContain(name);
      expect(text(rows[index]!)).toContain(migrationNotes[slug]![locale].replace(/`/g, ""));
    }
  });
});

/** WCAG relative luminance of a `#rrggbb` color. */
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r!) + 0.7152 * linear(g!) + 0.0722 * linear(b!);
}
const contrast = (a: string, b: string) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
};

describe("neutral preset", () => {
  const block = (selector: string) => {
    const body = new RegExp(`${selector}\\s*\\{([^}]*)\\}`).exec(neutralPresetExample)![1]!;
    return Object.fromEntries(
      [...body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/g)].map(([, name, value]) => [name, value]),
    ) as Record<string, string>;
  };
  // The pairs Buril measures for its own theme: 4.5:1 for text, 3:1 for borders and focus.
  const pairs = [
    ["foreground", "background", 4.5],
    ["primary-foreground", "primary", 4.5],
    ["secondary-foreground", "secondary", 4.5],
    ["muted-foreground", "background", 4.5],
    ["muted-foreground", "muted", 4.5],
    ["accent-foreground", "accent", 4.5],
    ["destructive", "background", 4.5],
    ["border", "background", 3],
    ["input", "background", 3],
    ["ring", "background", 3],
  ] as const;

  it.each([":root", "\\.dark"])("meets WCAG AA in %s", (selector) => {
    const tokens = block(selector);
    for (const [foreground, background, minimum] of pairs) {
      expect(tokens[foreground], foreground).toBeDefined();
      expect(
        contrast(tokens[foreground]!, tokens[background]!),
        `${foreground} on ${background}`,
      ).toBeGreaterThanOrEqual(minimum);
    }
  });

  it("keeps the destructive Button's text readable: white in light mode, background in dark", () => {
    expect(contrast("#ffffff", block(":root").destructive!)).toBeGreaterThanOrEqual(4.5);
    const dark = block("\\.dark");
    expect(contrast(dark.background!, dark.destructive!)).toBeGreaterThanOrEqual(4.5);
  });
});
