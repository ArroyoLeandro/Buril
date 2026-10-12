import { commands } from "vitest/browser";
import { describe, expect, inject, it } from "vitest";

/**
 * The site header in a real browser, on phones and on a desktop. On a phone it must stay one row:
 * the theme becomes one icon button that cycles Light, Dark and System, and the main links fold
 * behind a menu button. Served by Astro's dev server for the run (`test/docs-site.ts`).
 */
const origin = inject("docsOrigin");

const pages = ["/", "/docs", "/docs/components/button", "/es/", "/es/docs/components/button"];
const phones = [375, 320];
/** One row: the 40px wordmark plus 12px of padding above and below, and the 1px border. */
const oneRow = 65;

describe.each(phones)("site header at %ipx", (width) => {
  it.each(pages)("%s fits on one row without overflowing", async (path) => {
    const header = await commands.inspectHeader(origin, path, width);
    expect(header.status).toBe(200);
    expect(header.rows, "item centres").toHaveLength(1);
    expect(header.height).toBeLessThanOrEqual(oneRow);
    expect(header.overflows).toBe(false);
    expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth);
  });

  it.each(pages)("%s cycles the theme with one named, announced icon button", async (path) => {
    const header = await commands.inspectHeader(origin, path, width);
    expect(header.groupVisible).toBe(false);
    expect(header.cycleVisible).toBe(true);
    const spanish = path.startsWith("/es");
    expect(header.cycle).toEqual({
      before: spanish ? "Tema: Sistema" : "Theme: System",
      after: spanish ? "Tema: Claro" : "Theme: Light",
      announced: spanish ? "Tema: Claro" : "Theme: Light",
      htmlClass: "light",
      // Above the 24px minimum target size.
      size: 32,
    });
  });

  it.each(pages)("%s opens and closes the main links from the menu button", async (path) => {
    const header = await commands.inspectHeader(origin, path, width);
    expect(header.navVisible).toBe(false);
    expect(header.menu).toEqual({
      visible: true,
      size: 32,
      expandedAfterOpen: "true",
      navVisibleAfterOpen: true,
      linksAfterOpen: 3,
      expandedAfterEscape: "false",
      focusOnButton: true,
    });
  });
});

describe("site header on a desktop", () => {
  it.each(pages)("%s shows the links and the three theme buttons in one row", async (path) => {
    const header = await commands.inspectHeader(origin, path, 1280);
    expect(header.rows).toHaveLength(1);
    expect(header.groupVisible).toBe(true);
    expect(header.cycleVisible).toBe(false);
    expect(header.navVisible).toBe(true);
    expect(header.menu).toBeUndefined();
  });

  it.each(["/docs/components/button", "/es/docs/components/button"])(
    "%s keeps one row on a tablet, with the icon theme button",
    async (path) => {
      const header = await commands.inspectHeader(origin, path, 768);
      expect(header.rows).toHaveLength(1);
      expect(header.navVisible).toBe(true);
      expect(header.cycleVisible).toBe(true);
      expect(header.overflows).toBe(false);
    },
  );
});
