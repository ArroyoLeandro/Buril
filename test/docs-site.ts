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

export interface HeaderInspection {
  status: number;
  /** The header's height, and the vertical centres of its visible items: one value, one row. */
  height: number;
  rows: number[];
  /** Whether any header item reaches past the viewport. */
  overflows: boolean;
  scrollWidth: number;
  clientWidth: number;
  /** The theme control a reader sees: the icon button below lg, or the button group. */
  cycleVisible: boolean;
  groupVisible: boolean;
  /** Pressing the visible cycle button: its name before and after, and what was announced. */
  cycle?: { before: string; after: string; announced: string; htmlClass: string; size: number };
  /** The main navigation: visible from the start, or behind a menu button that opens it. */
  navVisible: boolean;
  menu?: {
    visible: boolean;
    size: number;
    expandedAfterOpen: string | null;
    navVisibleAfterOpen: boolean;
    linksAfterOpen: number;
    /** Escape closes the menu and returns focus to the button. */
    expandedAfterEscape: string | null;
    focusOnButton: boolean;
  };
}

/**
 * Opens `path` at `width` px and measures the header: how many rows it takes, whether anything
 * overflows, and whether the compact theme button and the menu button work from the keyboard.
 */
export const inspectHeader: BrowserCommand<[origin: string, path: string, width: number]> = async (
  context,
  origin,
  path,
  width,
): Promise<HeaderInspection> => {
  const page = await context.context.newPage();
  try {
    await page.setViewportSize({ width, height: 720 });
    // Tabs share storage: start every page from the system theme, whatever a test chose before.
    await page.addInitScript(() => localStorage.clear());
    const response = await page.goto(new URL(path, origin).href, { waitUntil: "load" });
    // The header scripts unhide the compact controls; wait for them instead of guessing a delay.
    await page.waitForFunction(
      () => !document.querySelector("[data-theme-toggle]")?.hasAttribute("hidden"),
    );
    const layout = await page.evaluate(() => {
      const header = document.querySelector("header")!;
      const shown = (element: Element | null) =>
        !!element && (element as HTMLElement).offsetParent !== null;
      const items = [...header.querySelectorAll(":scope > div > *")].filter(
        // Screen-reader-only text is 1px wide and takes no room in the row.
        (item) => shown(item) && item.getBoundingClientRect().width > 1,
      );
      const centre = (item: Element) => {
        const box = item.getBoundingClientRect();
        return Math.round(box.top + box.height / 2);
      };
      const rows = [...new Set(items.map(centre))];
      return {
        height: header.getBoundingClientRect().height,
        rows,
        overflows: items.some(
          (item) => item.getBoundingClientRect().right > document.documentElement.clientWidth,
        ),
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        cycleVisible: shown(document.querySelector("[data-theme-cycle]")),
        groupVisible: shown(document.querySelector("[data-theme-toggle]")),
        navVisible: shown(document.querySelector("header nav")),
      };
    });

    let cycle: HeaderInspection["cycle"];
    if (layout.cycleVisible) {
      const button = page.locator("[data-theme-cycle]");
      const before = (await button.getAttribute("aria-label")) ?? "";
      await button.focus();
      await page.keyboard.press("Enter");
      cycle = {
        before,
        after: (await button.getAttribute("aria-label")) ?? "",
        announced: (await page.locator("[data-theme-status]").textContent()) ?? "",
        htmlClass: await page.evaluate(() => document.documentElement.className),
        size: (await button.boundingBox())?.height ?? 0,
      };
    }

    let menu: HeaderInspection["menu"];
    const toggle = page.locator("[data-site-nav-toggle]");
    if (await toggle.isVisible()) {
      await toggle.focus();
      await page.keyboard.press("Enter");
      const navAfterOpen = page.locator("header nav");
      const expandedAfterOpen = await toggle.getAttribute("aria-expanded");
      const navVisibleAfterOpen = await navAfterOpen.isVisible();
      const linksAfterOpen = await navAfterOpen.locator("a:visible").count();
      await navAfterOpen.locator("a").first().focus();
      await page.keyboard.press("Escape");
      menu = {
        visible: true,
        size: (await toggle.boundingBox())?.height ?? 0,
        expandedAfterOpen,
        navVisibleAfterOpen,
        linksAfterOpen,
        expandedAfterEscape: await toggle.getAttribute("aria-expanded"),
        focusOnButton: await page.evaluate(() =>
          document.activeElement!.hasAttribute("data-site-nav-toggle"),
        ),
      };
    }
    return { status: response?.status() ?? 0, ...layout, cycle, menu };
  } finally {
    await page.close();
  }
};

export interface MotionDemoInspection {
  /** Whether the demo Switch's dot slides (a `translate` transition), and the Spinner's dots show. */
  before: { slides: boolean; dots: string; stage: boolean };
  after: { slides: boolean; dots: string; stage: boolean };
}

/**
 * Opens the Motion page, waits for its demo to hydrate, and reads how the demo moves before and
 * after its "Simulate reduced motion" switch is turned on with the keyboard.
 */
export const inspectMotionDemo: BrowserCommand<[origin: string, path: string]> = async (
  context,
  origin,
  path,
): Promise<MotionDemoInspection> => {
  const page = await context.context.newPage();
  try {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(new URL(path, origin).href, { waitUntil: "load" });
    await page.locator("[data-motion-stage]").scrollIntoViewIfNeeded();
    await page.waitForSelector("astro-island:not([ssr]) [data-motion-stage]");
    const read = () =>
      page.evaluate(() => {
        const stage = document.querySelector<HTMLElement>("[data-motion-stage]")!;
        const carrier = stage.querySelector("[data-thumb] > span")!;
        const properties = getComputedStyle(carrier).transitionProperty.split(",");
        return {
          slides: properties.map((property) => property.trim()).includes("translate"),
          dots: getComputedStyle(stage.querySelector("[data-dots]")!).display,
          stage: stage.hasAttribute("data-reduced-motion"),
        };
      });
    const before = await read();
    const simulate = page.getByRole("switch").first();
    await simulate.focus();
    await page.keyboard.press("Space");
    return { before, after: await read() };
  } finally {
    await page.close();
  }
};

export interface PanelsInspection {
  viewportHeight: number;
  headerBottom: number;
  scrollWidth: number;
  clientWidth: number;
  /** The sticky sidebar and "On this page" panels, and whatever draws the sidebar's divider. */
  sidebar: { top: number; bottom: number; height: number; borderRight: number };
  sidebarColumnBorderRight: number;
  toc: { top: number; bottom: number; borderLeft: number };
  /** The first sidebar label and the content's h1, which share a top line. */
  firstSidebarItemTop: number;
  headingTop: number;
  /** The last sidebar link with the panel scrolled to its end: inside it, above the fade. */
  lastLink: { bottom: number; panelBottom: number; fade: number; scrolled: boolean };
  /** Whether keyboard focus on the last link scrolls the panel to show it. */
  focusedLastLinkVisible: boolean;
}

/** Opens a docs page at 1440x900 and measures the sticky sidebar and "On this page" panels. */
export const inspectPanels: BrowserCommand<[origin: string, path: string]> = async (
  context,
  origin,
  path,
): Promise<PanelsInspection> => {
  const page = await context.context.newPage();
  try {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(new URL(path, origin).href, { waitUntil: "load" });
    const alignment = await page.evaluate(() => {
      const textTop = (element: Element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return range.getBoundingClientRect().top;
      };
      return {
        firstSidebarItemTop: textTop(document.querySelector("#docs-sidebar p")!),
        headingTop: textTop(document.querySelector("main h1")!),
      };
    });
    // Scrolled down a little, the panels sit in their stuck position.
    const layout = await page.evaluate(() => {
      window.scrollTo(0, 400);
      const sidebar = document.querySelector<HTMLElement>("#docs-sidebar")!;
      const toc = document.querySelector<HTMLElement>("main + nav")!;
      const box = (element: Element) => element.getBoundingClientRect();
      const style = (element: Element) => getComputedStyle(element);
      return {
        viewportHeight: window.innerHeight,
        headerBottom: box(document.querySelector("header")!).bottom,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        sidebar: {
          top: box(sidebar).top,
          bottom: box(sidebar).bottom,
          height: box(sidebar).height,
          borderRight: parseFloat(style(sidebar).borderRightWidth),
        },
        sidebarColumnBorderRight: parseFloat(style(sidebar.parentElement!).borderRightWidth),
        toc: {
          top: box(toc).top,
          bottom: box(toc).bottom,
          borderLeft: parseFloat(style(toc).borderLeftWidth),
        },
      };
    });
    const lastLink = await page.evaluate(() => {
      const sidebar = document.querySelector<HTMLElement>("#docs-sidebar")!;
      sidebar.scrollTop = sidebar.scrollHeight;
      const links = sidebar.querySelectorAll("a");
      const last = links[links.length - 1]!;
      return {
        bottom: last.getBoundingClientRect().bottom,
        panelBottom: sidebar.getBoundingClientRect().bottom,
        // The faded strip at the bottom of the panel: 2rem.
        fade: 2 * parseFloat(getComputedStyle(document.documentElement).fontSize),
        scrolled: sidebar.scrollTop > 0,
      };
    });
    await page.evaluate(() => {
      document.querySelector<HTMLElement>("#docs-sidebar")!.scrollTop = 0;
    });
    await page.locator("#docs-sidebar a").last().focus();
    const focusedLastLinkVisible = await page.evaluate(() => {
      const panel = document.querySelector("#docs-sidebar")!.getBoundingClientRect();
      const link = document.activeElement!.getBoundingClientRect();
      return link.top >= panel.top && link.bottom <= panel.bottom;
    });
    return { ...layout, ...alignment, lastLink, focusedLastLinkVisible };
  } finally {
    await page.close();
  }
};

export interface WrappingInspection {
  status: number;
  scrollWidth: number;
  clientWidth: number;
  /** How many identifiers and short inline code elements were measured. */
  measured: number;
  /**
   * Code that broke onto another line where it must not, with the text around the break (`⏎`):
   * identifiers in table row headers and Default cells, never at all; the Type column of an API
   * table, only after a `|`, or at a space inside an alternative over 24 characters; other code
   * in tables, only at a space; inline code of up to 24 characters, such as `--radius`, never.
   * Also punctuation that a break parted from its code.
   */
  splits: string[];
  /** The first package manager's install block: the code beside or below its Copy button. */
  install?: { codeWidth: number; panelWidth: number; firstLineFits: boolean };
}

/**
 * Opens `path` at `width` px and finds code that breaks in the middle of an identifier: it reads
 * the line box of every character, so it sees exactly where the browser wrapped each element.
 */
export const inspectWrapping: BrowserCommand<
  [origin: string, path: string, width: number]
> = async (context, origin, path, width): Promise<WrappingInspection> => {
  const page = await context.context.newPage();
  try {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto(new URL(path, origin).href, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(() => {
      type Rule = "never" | "after-pipe" | "at-space";
      /** The indexes in the element's text where a new line starts. */
      const breaksIn = (element: Element) => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const range = document.createRange();
        const breaks: number[] = [];
        let offset = 0;
        let lastTop: number | undefined;
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const value = node.nodeValue ?? "";
          for (let i = 0; i < value.length; i++) {
            if (/\s/.test(value[i]!)) continue;
            range.setStart(node, i);
            range.setEnd(node, i + 1);
            const rect = range.getClientRects()[0];
            if (!rect) continue;
            if (lastTop !== undefined && rect.top > lastTop + rect.height / 2)
              breaks.push(offset + i);
            lastTop = rect.top;
          }
          offset += value.length;
        }
        return breaks;
      };
      const allowed = (text: string, index: number, rule: Rule) => {
        const before = text.slice(0, index);
        if (rule === "after-pipe") {
          if (before.trimEnd().endsWith("|")) return true;
          // A long alternative, such as a function type, may also break at a space.
          const alternative = text.split(" | ").find((_, i, all) => {
            const end = all.slice(0, i + 1).join(" | ").length;
            return index <= end;
          });
          return /\s$/.test(before) && (alternative?.length ?? 0) > 24;
        }
        if (rule === "at-space") return /\s$/.test(before);
        return false;
      };
      const checks: [Element, Rule][] = [];
      for (const table of document.querySelectorAll("main table")) {
        const headers = [...table.querySelectorAll("thead th")].map((th) => th.textContent!.trim());
        const api = headers[0] === "Prop";
        for (const row of table.querySelectorAll("tbody tr")) {
          [...row.children].forEach((cell, column) => {
            for (const code of cell.querySelectorAll("code")) {
              const rule: Rule =
                cell.matches("th") || (api && column === 2)
                  ? "never"
                  : api && column === 1
                    ? "after-pipe"
                    : "at-space";
              checks.push([code, rule]);
            }
          });
        }
      }
      for (const code of document.querySelectorAll("main :not(pre) > code"))
        if ((code.textContent ?? "").trim().length <= 24 && !code.closest("table"))
          checks.push([code, "never"]);
      const splits: string[] = [];
      for (const [element, rule] of checks) {
        const text = element.textContent ?? "";
        for (const index of breaksIn(element))
          if (!allowed(text, index, rule))
            splits.push(
              `${text.slice(Math.max(0, index - 12), index)}⏎${text.slice(index, index + 12)}`,
            );
      }
      // Punctuation right after inline code stays on the code's line: "--radius," never ends
      // one line with the code and starts the next with the comma.
      const range = document.createRange();
      for (const code of document.querySelectorAll("main :not(pre) > code")) {
        const next = code.nextSibling;
        if (next?.nodeType !== Node.TEXT_NODE || !/^[.,;:)]/.test(next.nodeValue ?? "")) continue;
        const rects = code.getClientRects();
        const last = rects[rects.length - 1];
        range.setStart(next, 0);
        range.setEnd(next, 1);
        const mark = range.getClientRects()[0];
        if (last && mark && mark.top > last.top + last.height / 2)
          splits.push(`${code.textContent}⏎${next.nodeValue!.slice(0, 6)}`);
      }

      const panel = document.querySelector<HTMLElement>(
        "main [data-install-tabs] [role=tabpanel]:not([hidden])",
      );
      const pre = panel?.querySelector("pre");
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        measured: checks.length,
        splits,
        install:
          panel && pre
            ? {
                codeWidth: pre.getBoundingClientRect().width,
                panelWidth: panel.getBoundingClientRect().width,
                firstLineFits: pre.scrollWidth <= pre.clientWidth,
              }
            : undefined,
      };
    });
    return { status: response?.status() ?? 0, ...result };
  } finally {
    await page.close();
  }
};

declare module "vitest/browser" {
  interface BrowserCommands {
    inspectPanels: (origin: string, path: string) => Promise<PanelsInspection>;
    inspectWrapping: (origin: string, path: string, width: number) => Promise<WrappingInspection>;
    inspectMotionDemo: (origin: string, path: string) => Promise<MotionDemoInspection>;
    inspectPage: (origin: string, path: string, width: number) => Promise<PageInspection>;
    inspectHeader: (origin: string, path: string, width: number) => Promise<HeaderInspection>;
  }
}
