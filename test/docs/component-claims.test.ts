// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import { componentHref } from "../../src/data/components";
import { localizePath } from "../../src/i18n/paths";
import type { Locale } from "../../src/i18n/ui";

/**
 * What the component pages claim about shadcn and about the page itself, in both languages: a
 * parity claim must name the differences, and a pointer must point where the content is.
 */
let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const pages = import.meta.glob<AstroComponentFactory>(
  ["../../src/pages/docs/components/*.astro", "../../src/pages/es/docs/components/*.astro"],
  { eager: true, import: "default" },
);

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

async function pageText(slug: string, locale: Locale) {
  const file = `../../src/pages/${locale === "es" ? "es/" : ""}docs/components/${slug}.astro`;
  const html = await container.renderToString(pages[file]!, {
    request: new Request(`http://localhost${localizePath(componentHref(slug), locale)}`),
  });
  return text(/<main[\s\S]*<\/main>/.exec(html)![0]);
}

describe("component page claims", () => {
  // The Manual tab with the source is in the Installation section, above "Coming from shadcn/ui".
  it("points the Button reader up to the source, not down", async () => {
    expect(await pageText("button", "en")).toMatch(/copy the source above/);
    expect(await pageText("button", "en")).not.toMatch(/source below/);
    expect(await pageText("button", "es")).toMatch(/de más arriba/);
  });

  it("says Separator's decorative defaults to false, unlike shadcn's", async () => {
    expect(await pageText("separator", "en")).toMatch(
      /decorative defaults to false, where shadcn's defaults to true/,
    );
    expect(await pageText("separator", "es")).toMatch(
      /decorative vale false por defecto, mientras que en shadcn vale true/,
    );
  });

  it("says Card has no CardAction", async () => {
    expect(await pageText("card", "en")).toMatch(/CardAction is not included/);
    expect(await pageText("card", "es")).toMatch(/CardAction no está incluida/);
  });
});
