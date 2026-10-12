import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [react(), mdx()],
  vite: {
    resolve: {
      alias: { "@/lib": fileURLToPath(new URL("./registry/lib", import.meta.url)) },
    },
    plugins: [tailwindcss()],
  },
});
