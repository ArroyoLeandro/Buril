import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

import { emulateReducedMotion } from "./test/browser-commands.ts";
import { inspectHeader, inspectMotionDemo, inspectPage } from "./test/docs-site.ts";

// Real-browser tests: geometry, computed styles, transitions and focus, which jsdom cannot see.
// They run in headless Chromium with the compiled Tailwind stylesheet and the Buril theme.
export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: { "@/lib": fileURLToPath(new URL("./registry/lib", import.meta.url)) },
  },
  // Pre-bundle the runtime dependencies, so Vite does not reload the page mid-run.
  optimizeDeps: {
    include: [
      "class-variance-authority",
      "clsx",
      "react",
      "react/jsx-dev-runtime",
      "react-dom/client",
      "tailwind-merge",
      "vitest-browser-react",
    ],
  },
  test: {
    include: ["registry/**/*.browser.test.{ts,tsx}", "test/**/*.browser.test.{ts,tsx}"],
    setupFiles: ["./test/browser-setup.ts"],
    // Serves the docs site for the whole-page checks in test/i18n-pages.browser.test.tsx.
    globalSetup: ["./test/docs-site.ts"],
    css: true,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      commands: { emulateReducedMotion, inspectHeader, inspectMotionDemo, inspectPage },
      instances: [{ browser: "chromium", viewport: { width: 1024, height: 768 } }],
    },
  },
});
