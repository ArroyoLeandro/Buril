// @vitest-environment node
import { JSDOM } from "jsdom";
import axe from "axe-core";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const pages = import.meta.glob<AstroComponentFactory>(
  ["../../src/pages/index.astro", "../../src/pages/docs/**/*.astro"],
  { eager: true, import: "default" },
);

/** Runs axe on the server-rendered page. jsdom has no layout, so color contrast is skipped. */
async function violations(html: string) {
  const { window } = new JSDOM(html);
  const result = await axe.run(window.document.documentElement, {
    rules: { "color-contrast": { enabled: false } },
  } as axe.RunOptions);
  return result.violations.map(({ id, nodes }) => `${id}: ${nodes.map((n) => n.html).join(" | ")}`);
}

describe.each(Object.entries(pages))("%s", (path, page) => {
  it("has no axe violations in its server-rendered HTML", async () => {
    const url = path.replace("../../src/pages", "").replace(/(\/index)?\.astro$/, "") || "/";
    const html = await container.renderToString(page, {
      request: new Request(`http://localhost${url}`),
    });
    expect(await violations(html)).toEqual([]);
  });
});
