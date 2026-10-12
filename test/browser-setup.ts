import { afterEach } from "vitest";

import "./browser.css";

// Each test starts in light mode; a test that needs dark mode calls `setTheme("dark")`.
afterEach(() => {
  document.documentElement.classList.remove("dark");
});
