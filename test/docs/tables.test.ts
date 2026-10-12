// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

/**
 * Every docs table: its cells never hyphenate or break words anywhere, and the table sits in a
 * frame that scrolls on its own when a phone is too narrow, which keyboard users can focus and
 * screen readers announce by name. The real-browser check of the wrapping itself is in
 * `test/docs-wrapping.browser.test.tsx`.
 */
let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const pages = import.meta.glob<AstroComponentFactory>(
  [
    "../../src/pages/docs/components/button.astro",
    "../../src/pages/docs/components/field.astro",
    "../../src/pages/docs/accessibility.astro",
    "../../src/pages/docs/motion.astro",
    "../../src/pages/docs/theming.astro",
    "../../src/pages/docs/guides/migrating-from-shadcn.astro",
    "../../src/pages/es/docs/motion.astro",
    "../../src/pages/es/docs/accessibility.astro",
  ],
  { eager: true, import: "default" },
);

const route = (file: string) =>
  file
    .replace("../../src/pages", "")
    .replace(/\.astro$/, "")
    .replace(/\/index$/, "");

describe.each(Object.keys(pages).map((file) => [route(file), file] as const))(
  "tables on %s",
  (path, file) => {
    const render = () =>
      container.renderToString(pages[file]!, { request: new Request(`http://localhost${path}`) });

    it("never hyphenate or break words anywhere", async () => {
      const html = await render();
      const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/g)].map(([table]) => table);
      expect(tables.length).toBeGreaterThan(0);
      for (const table of tables) {
        expect(table).not.toMatch(/hyphens-auto|wrap-anywhere|break-all/);
      }
    });

    it("scroll inside a focusable, named frame", async () => {
      const html = await render();
      const tables = [...html.matchAll(/<table/g)].length;
      const frames = [...html.matchAll(/<div([^>]*)>\s*<table/g)].map(
        ([, attributes]) => attributes!,
      );
      expect(frames).toHaveLength(tables);
      const ids = new Set([...html.matchAll(/<caption[^>]*\sid="([^"]+)"/g)].map(([, id]) => id));
      const names: string[] = [];
      for (const frame of frames) {
        expect(frame).toMatch(/role="region"/);
        expect(frame).toMatch(/tabindex="0"/);
        expect(frame).toMatch(/overflow-x-auto/);
        const labelledby = /aria-labelledby="([^"]+)"/.exec(frame)?.[1];
        const label = /aria-label="([^"]+)"/.exec(frame)?.[1];
        if (labelledby) expect(ids).toContain(labelledby);
        else expect(label).toBeTruthy();
        names.push(labelledby ?? label!);
      }
      // Landmarks on one page need different names.
      expect(new Set(names).size).toBe(names.length);
    });
  },
);
