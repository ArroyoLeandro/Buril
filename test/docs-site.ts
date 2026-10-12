/**
 * Real-browser checks of whole docs pages (`pnpm test:browser`). The global setup serves the site
 * with Astro's dev server for the run, and `inspectPage` opens a page in its own Playwright tab at
 * a given width, measures it and drives the language switcher with the keyboard. The tests read
 * the server's origin with `inject("docsOrigin")`.
 */
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dev } from "astro";
import type { BrowserCommand, TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    docsOrigin: string;
    /** Every Spanish page by URL, such as `/es/` and `/es/docs/components/button`. */
    spanishRoutes: string[];
  }
}

const root = fileURLToPath(new URL("..", import.meta.url));

/** The URL of every page file under `src/pages/es`, the way Astro routes them. */
function spanishRoutes() {
  return readdirSync(`${root}/src/pages/es`, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".astro"))
    .map((file) => {
      const route = `/es/${file.replace(/\\/g, "/").replace(/\.astro$/, "")}`;
      return route === "/es/index" ? "/es/" : route.replace(/\/index$/, "");
    })
    .sort();
}

export default async function serveDocs(project: TestProject) {
  // Astro skips its page middleware while `VITEST` is set, so every page would be a 404. This
  // server is a separate Vite instance that serves real pages, so start it with the flag unset.
  const vitest = process.env.VITEST;
  delete process.env.VITEST;
  const server = await dev({
    root,
    logLevel: "error",
    // Any free port: the tests read the origin, never a fixed number.
    server: { host: "127.0.0.1", port: 0 },
  }).finally(() => {
    process.env.VITEST = vitest;
  });
  project.provide("docsOrigin", `http://127.0.0.1:${server.address.port}`);
  project.provide("spanishRoutes", spanishRoutes());
  return () => server.stop();
}

export interface PageInspection {
  /** The HTTP status of the page, its document language and its title. */
  status: number;
  lang: string;
  title: string;
  /** The document's scroll width and the viewport width: equal when nothing scrolls sideways. */
  scrollWidth: number;
  clientWidth: number;
  switcher?: {
    href: string | null;
    hreflang: string | null;
    lang: string;
    text: string;
    left: number;
    right: number;
    width: number;
    height: number;
    visible: boolean;
  };
  /** Whether Tab reaches the switcher from the top of the page, and how many presses it takes. */
  reachedByTab: boolean;
  tabs: number;
  /** The focused switcher's outline, which must be visible. */
  focusOutline?: { style: string; width: number };
  /** The page Enter on the focused switcher leads to. */
  landedOn?: string;
}

/** Opens `path` at `width` px, measures it, then follows the switcher with the keyboard. */
export const inspectPage: BrowserCommand<[origin: string, path: string, width: number]> = async (
  context,
  origin,
  path,
  width,
): Promise<PageInspection> => {
  const page = await context.context.newPage();
  try {
    await page.setViewportSize({ width, height: 720 });
    const response = await page.goto(new URL(path, origin).href, { waitUntil: "load" });
    const status = response?.status() ?? 0;
    const layout = await page.evaluate(() => {
      const link = document.querySelector<HTMLAnchorElement>("header [data-language-switcher]");
      const box = link?.getBoundingClientRect();
      const style = link && getComputedStyle(link);
      return {
        lang: document.documentElement.lang,
        title: document.title,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        switcher:
          link && box && style
            ? {
                href: link.getAttribute("href"),
                hreflang: link.getAttribute("hreflang"),
                lang: link.lang,
                text: link.textContent?.trim() ?? "",
                left: box.left,
                right: box.right,
                width: box.width,
                height: box.height,
                visible: style.visibility !== "hidden" && style.display !== "none",
              }
            : undefined,
      };
    });

    const onSwitcher = () =>
      page.evaluate(() => document.activeElement?.hasAttribute("data-language-switcher") ?? false);
    let tabs = 0;
    let reachedByTab = false;
    while (tabs < 30 && !reachedByTab) {
      await page.keyboard.press("Tab");
      tabs++;
      reachedByTab = await onSwitcher();
    }
    if (!reachedByTab) return { status, ...layout, reachedByTab, tabs };

    const focusOutline = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement!);
      return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
    });
    await Promise.all([
      page.waitForURL((url) => url.pathname !== path),
      page.keyboard.press("Enter"),
    ]);
    return {
      status,
      ...layout,
      reachedByTab,
      tabs,
      focusOutline,
      landedOn: new URL(page.url()).pathname,
    };
  } finally {
    await page.close();
  }
};

declare module "vitest/browser" {
  interface BrowserCommands {
    inspectPage: (origin: string, path: string, width: number) => Promise<PageInspection>;
  }
}
