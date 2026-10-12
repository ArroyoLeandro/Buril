import { commands } from "vitest/browser";
import { describe, expect, inject, it } from "vitest";

/**
 * The docs sidebar and "On this page" panels at 1440x900, in a real browser: they float below the
 * header and above the bottom of the viewport, draw their own divider, fade their bottom edge and
 * still let the last link scroll into full view. Served by Astro's dev server for the run.
 */
const origin = inject("docsOrigin");

describe.each(["/docs/components/button", "/es/docs/components/button"])("%s panels", (path) => {
  it("float with a gap below the header and above the bottom of the viewport", async () => {
    const page = await commands.inspectPanels(origin, path);
    expect(page.sidebar.top).toBeGreaterThan(page.headerBottom + 16);
    expect(page.sidebar.bottom).toBeLessThan(page.viewportHeight - 16);
    expect(page.toc.top).toBeCloseTo(page.sidebar.top, 0);
    expect(page.toc.bottom).toBeLessThan(page.viewportHeight);
    expect(page.scrollWidth).toBeLessThanOrEqual(page.clientWidth);
  });

  it("draw the divider on the panel, as tall as the panel and not the page", async () => {
    const page = await commands.inspectPanels(origin, path);
    expect(page.sidebar.borderRight).toBe(1);
    expect(page.sidebarColumnBorderRight).toBe(0);
    expect(page.sidebar.height).toBeLessThan(page.viewportHeight);
    expect(page.toc.borderLeft).toBe(1);
  });

  it("align the first sidebar item with the page heading", async () => {
    const page = await commands.inspectPanels(origin, path);
    expect(Math.abs(page.firstSidebarItemTop - page.headingTop)).toBeLessThanOrEqual(8);
  });

  it("let the last link scroll clear of the faded bottom edge, and into view on focus", async () => {
    const page = await commands.inspectPanels(origin, path);
    expect(page.lastLink.scrolled).toBe(true);
    expect(page.lastLink.bottom).toBeLessThanOrEqual(
      page.lastLink.panelBottom - page.lastLink.fade + 1,
    );
    expect(page.focusedLastLinkVisible).toBe(true);
  });
});
