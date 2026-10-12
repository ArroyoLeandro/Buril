import { commands } from "vitest/browser";
import { describe, expect, inject, it } from "vitest";

/**
 * Every Spanish page in a real browser at the narrowest phone width WCAG reflow asks for: nothing
 * scrolls sideways, and the language switcher is on screen, a comfortable target, reachable with
 * Tab, visibly focused and leads to the English twin. Served by Astro's dev server for the run
 * (`test/docs-site.ts`).
 */
const origin = inject("docsOrigin");
const routes = inject("spanishRoutes");
const width = 320;

/** The English twin of a Spanish page: `/es/docs` → `/docs`, `/es/` → `/`. */
const twin = (route: string) => route.replace(/^\/es(?=\/|$)/, "").replace(/^$/, "/") || "/";

describe(`Spanish pages at ${width}px`, () => {
  it("cover the landing page, Getting Started and every component", () => {
    expect(routes).toContain("/es/");
    expect(routes).toContain("/es/docs/components/button");
    expect(routes.length).toBeGreaterThan(20);
  });

  it.each(routes)("%s reflows without sideways scrolling", async (route) => {
    const page = await commands.inspectPage(origin, route, width);
    // The real Spanish page, not an error page that happens to fit.
    expect(page.status).toBe(200);
    expect(page.lang).toBe("es");
    expect(page.title).toMatch(/\| Buril UI$|^Buril UI/);
    expect(page.clientWidth).toBe(width);
    expect(page.scrollWidth).toBeLessThanOrEqual(page.clientWidth);
  });

  it.each(routes)("%s shows a usable switcher to its English twin", async (route) => {
    const page = await commands.inspectPage(origin, route, width);
    const switcher = page.switcher!;
    expect(switcher).toBeDefined();
    expect(switcher.visible).toBe(true);
    expect(switcher.text).toBe("English");
    expect(switcher.lang).toBe("en");
    expect(switcher.hreflang).toBe("en");
    expect(switcher.href).toBe(twin(route));
    // On screen, and above the 24px minimum target size.
    expect(switcher.left).toBeGreaterThanOrEqual(0);
    expect(switcher.right).toBeLessThanOrEqual(width);
    expect(switcher.height).toBeGreaterThanOrEqual(24);
    expect(switcher.width).toBeGreaterThanOrEqual(24);
    // Reachable with Tab, focused with a visible outline, and Enter opens the twin.
    expect(page.reachedByTab).toBe(true);
    expect(page.focusOutline!.style).not.toBe("none");
    expect(page.focusOutline!.width).toBeGreaterThan(0);
    expect(page.landedOn).toBe(twin(route));
  });
});
