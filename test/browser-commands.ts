/**
 * Browser commands for the real-browser tests. They run in Node with the Playwright page that
 * hosts the tests, for settings a page cannot change from inside, such as a user preference.
 */
import type { BrowserCommand } from "vitest/node";

/** Emulate the user's reduced-motion setting for the test page, or clear it with `false`. */
export const emulateReducedMotion: BrowserCommand<[reduce: boolean]> = async (context, reduce) => {
  await context.page.emulateMedia({ reducedMotion: reduce ? "reduce" : "no-preference" });
};

declare module "vitest/browser" {
  interface BrowserCommands {
    emulateReducedMotion: (reduce: boolean) => Promise<void>;
  }
}
