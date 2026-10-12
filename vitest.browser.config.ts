import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

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
    css: true,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium", viewport: { width: 1024, height: 768 } }],
    },
  },
});
