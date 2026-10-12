import { fileURLToPath } from "node:url";
import { getViteConfig } from "astro/config";
import { configDefaults } from "vitest/config";

export default getViteConfig({
  resolve: {
    alias: { "@/lib": fileURLToPath(new URL("./registry/lib", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["registry/**/*.test.{ts,tsx}", "test/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    // Real-browser tests run in their own config: `pnpm test:browser`.
    exclude: [...configDefaults.exclude, "**/*.browser.test.{ts,tsx}"],
    css: false,
  },
});
