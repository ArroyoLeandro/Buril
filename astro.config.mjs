import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

import { componentHref, documentedComponents } from "./src/data/components.ts";

// Component pages moved from /components/<slug> to /docs/components/<slug>; old links redirect.
const legacyComponentRedirects = Object.fromEntries(
  documentedComponents.map(({ slug }) => [`/components/${slug}`, componentHref(slug)]),
);

export default defineConfig({
  integrations: [react(), mdx()],
  // Compression drops the line-break space between text and an inline element that starts the
  // next source line ("creates<code>…"), which runs words together. Keep the HTML as written.
  compressHTML: false,
  redirects: { "/components": "/docs/components", ...legacyComponentRedirects },
  vite: {
    resolve: {
      alias: { "@/lib": fileURLToPath(new URL("./registry/lib", import.meta.url)) },
    },
    plugins: [tailwindcss()],
  },
});
