import { afterEach } from "vitest";
import { commands } from "vitest/browser";

import "./browser.css";

// Each test starts in light mode, with motion allowed; a test that needs dark mode or reduced
// motion calls `setTheme("dark")` or `setReducedMotion(true)`.
afterEach(async () => {
  document.documentElement.classList.remove("dark");
  await commands.emulateReducedMotion(false);
});
