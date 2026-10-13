/**
 * A general real-browser probe of one docs page (`pnpm test:browser`): it opens the page in its
 * own Playwright tab with the given viewport and user preferences, runs a few keyboard or pointer
 * steps, then evaluates an expression in the page and returns its JSON result. Site-wide checks
 * (icons, the scrollbar, smooth scrolling, cursors, the favicon) use it instead of one command
 * each. The origin comes from `inject("docsOrigin")` (see `test/docs-site.ts`).
 */
import type { BrowserCommand } from "vitest/node";

export type ProbeStep =
  | { focus: string }
  | { click: string }
  | { hover: string }
  | { press: string }
  | { wait: number }
  /** Waits until the expression is truthy in the page. */
  | { until: string };

export interface ProbeOptions {
  width: number;
  height?: number;
  colorScheme?: "light" | "dark";
  reducedMotion?: "reduce" | "no-preference";
  forcedColors?: "active" | "none";
  steps?: ProbeStep[];
  /** A JavaScript expression evaluated in the page after the steps; it may return a promise. */
  evaluate: string;
}

export interface ProbeResult<T = unknown> {
  status: number;
  result: T;
}

export const probePage: BrowserCommand<
  [origin: string, path: string, options: ProbeOptions]
> = async (
  context,
  origin,
  path,
  {
    width,
    height = 800,
    colorScheme = "light",
    reducedMotion = "no-preference",
    forcedColors = "none",
    steps = [],
    evaluate,
  },
): Promise<ProbeResult> => {
  const page = await context.context.newPage();
  try {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ colorScheme, reducedMotion, forcedColors });
    // Tabs share storage: start every page from the system theme, whatever a test chose before.
    await page.addInitScript(() => localStorage.clear());
    const response = await page.goto(new URL(path, origin).href, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    for (const step of steps) {
      if ("focus" in step) await page.locator(step.focus).first().focus();
      else if ("click" in step) await page.locator(step.click).first().click();
      else if ("hover" in step) await page.locator(step.hover).first().hover();
      else if ("press" in step) await page.keyboard.press(step.press);
      else if ("wait" in step) await page.waitForTimeout(step.wait);
      else await page.waitForFunction(step.until);
    }
    return { status: response?.status() ?? 0, result: await page.evaluate(evaluate) };
  } finally {
    await page.close();
  }
};

declare module "vitest/browser" {
  interface BrowserCommands {
    probePage: <T = unknown>(
      origin: string,
      path: string,
      options: ProbeOptions,
    ) => Promise<ProbeResult<T>>;
  }
}
