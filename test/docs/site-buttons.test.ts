// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import IndexPage from "../../src/pages/index.astro";
import SpanishIndexPage from "../../src/pages/es/index.astro";
import ButtonPage from "../../src/pages/docs/components/button.astro";

/**
 * The site's own buttons (theme, menus, tabs, Copy) show the pointer, like Buril's: they are
 * styled with `buttonVariants()`, which carries `cursor-pointer`.
 */
let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

/** Buttons rendered by Astro, outside React islands (the demos test their own). */
const siteButtons = (html: string) =>
  [...html.replace(/<astro-island[\s\S]*?<\/astro-island>/g, "").matchAll(/<button[^>]*>/g)].map(
    ([tag]) => tag,
  );

describe.each([
  ["/", IndexPage],
  ["/es/", SpanishIndexPage],
  ["/docs/components/button", ButtonPage],
  ["/es/docs/components/button", ButtonPage],
] as const)("site buttons on %s", (path, page: AstroComponentFactory) => {
  it("show the pointer: theme, menus, tabs and Copy", async () => {
    const html = await container.renderToString(page, {
      request: new Request(`http://localhost${path}`),
    });
    const buttons = siteButtons(html);
    // The theme choices and cycle, the menu, the install tabs and their Copy buttons at least.
    expect(buttons.length).toBeGreaterThanOrEqual(10);
    for (const tag of buttons) expect(tag).toMatch(/class="[^"]*\bcursor-pointer\b/);
  });
});
