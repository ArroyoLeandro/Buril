import { commands } from "vitest/browser";
import { describe, expect, inject, it } from "vitest";

/**
 * How docs text wraps in a real browser. Identifiers such as `variant`, `"default"` and
 * `--buril-duration-instant` never break in the middle, a type breaks only between its `|`
 * alternatives, short inline code such as `--radius` stays on one line, the install command gets
 * the full width on a phone, and no page scrolls sideways at 320px. Served by Astro's dev server
 * for the run (`test/docs-site.ts`).
 */
const origin = inject("docsOrigin");
const routes = inject("spanishRoutes");

const pages = [
  "/docs/components/button",
  "/docs/components/field",
  "/docs/components/icon-button",
  "/docs/motion",
  "/docs/theming",
  "/docs/installation",
  "/docs/accessibility",
  "/docs/guides/migrating-from-shadcn",
  "/es/docs/components/button",
  "/es/docs/motion",
  "/es/docs/installation",
];

describe.each([1440, 375])("code at %ipx", (width) => {
  it.each(pages)("%s keeps identifiers whole", async (path) => {
    const page = await commands.inspectWrapping(origin, path, width);
    expect(page.status).toBe(200);
    expect(page.measured).toBeGreaterThan(0);
    expect(page.splits).toEqual([]);
  });
});

describe("the install command on a phone", () => {
  it.each(["/docs/installation", "/docs/components/button", "/es/docs/installation"])(
    "%s gives the command the full width, its Copy button above it",
    async (path) => {
      const page = await commands.inspectWrapping(origin, path, 375);
      expect(page.install).toBeDefined();
      expect(page.install!.codeWidth).toBeGreaterThanOrEqual(page.install!.panelWidth - 1);
      if (path.endsWith("installation")) expect(page.install!.firstLineFits).toBe(true);
    },
  );
});

describe("English pages at 320px", () => {
  /** The English twin of every Spanish page: `/es/docs/x` → `/docs/x`, `/es/` → `/`. */
  const english = routes.map((route) => route.replace(/^\/es(?=\/|$)/, "") || "/");

  it("cover the landing page and every docs page", () => {
    expect(english).toContain("/");
    expect(english).toContain("/docs/components/button");
  });

  it.each(english)("%s reflows without sideways scrolling", async (path) => {
    const page = await commands.inspectWrapping(origin, path, 320);
    expect(page.status).toBe(200);
    expect(page.clientWidth).toBe(320);
    expect(page.scrollWidth).toBeLessThanOrEqual(page.clientWidth);
  });
});
