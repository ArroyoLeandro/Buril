// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import astroConfig from "../../astro.config.mjs";
import { componentHref, documentedComponents } from "../../src/data/components";
import { noFlashScript } from "../../src/scripts/theme";
import { readTokens } from "../../src/utils/tokens";

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const root = resolve(__dirname, "../..");
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const main = (html: string) => /<main[\s\S]*<\/main>/.exec(html)![0];

const pages = import.meta.glob<AstroComponentFactory>("../../src/pages/docs/*.astro", {
  eager: true,
  import: "default",
});
const page = (name: string) => pages[`../../src/pages/docs/${name}.astro`]!;

const gettingStarted = [
  ["index", "/docs", "Introduction"],
  ["installation", "/docs/installation", "Installation"],
  ["theming", "/docs/theming", "Theming"],
  ["components", "/docs/components", "Components"],
] as const;

const render = (name: string, path: string) =>
  container.renderToString(page(name), { request: new Request(`http://localhost${path}`) });

describe.each(gettingStarted)("%s docs page", (name, path, title) => {
  it("exists and renders one document with one main landmark and one h1", async () => {
    expect(pages[`../../src/pages/docs/${name}.astro`]).toBeDefined();
    const html = await render(name, path);
    expect(html.match(/<main[\s>]/g)).toHaveLength(1);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(text(/<h1[^>]*>[\s\S]*?<\/h1>/.exec(html)![0]).trim()).toBe(title);
    expect(html).toContain(`<title>${title} | Buril UI</title>`);
  });

  it("sits in the docs shell with its sidebar link marked current", async () => {
    const html = await render(name, path);
    const sidebar = /<nav[^>]*aria-label="Docs"[\s\S]*?<\/nav>/.exec(html)![0];
    const current = [...sidebar.matchAll(/<a[^>]+aria-current="page"[^>]*>/g)];
    // The components index is reached from the header, not from a sidebar entry.
    if (name === "components") {
      expect(current).toHaveLength(0);
      expect(html).toMatch(
        /<nav[^>]*aria-label="Main"[\s\S]*?href="\/docs\/components"[^>]*aria-current="page"/,
      );
    } else {
      expect(current).toHaveLength(1);
      expect(current[0]![0]).toContain(`href="${path}"`);
    }
  });

  it("has an On this page list whose links all resolve", async () => {
    const html = await render(name, path);
    const toc = /<nav[^>]*aria-label="On this page"[\s\S]*?<\/nav>/.exec(html)![0];
    const ids = [...toc.matchAll(/href="#([^"]+)"/g)].map(([, id]) => id!);
    expect(ids.length).toBeGreaterThan(1);
    for (const id of ids)
      expect(html.match(new RegExp(`\\sid="${escape(id)}"`, "g"))).toHaveLength(1);
  });
});

describe("introduction page", () => {
  it("explains what Buril is and points to the next pages", async () => {
    const html = main(await render("index", "/docs"));
    expect(text(html)).toMatch(/copy/i);
    expect(text(html)).toMatch(/shadcn/);
    for (const href of ["/docs/installation", "/docs/theming", "/docs/components"]) {
      expect(html).toMatch(new RegExp(`<a[^>]+href="${escape(href)}"`));
    }
  });
});

describe("installation page", () => {
  it("shows the URL and namespaced install flows with the example.com placeholder", async () => {
    const visible = text(main(await render("installation", "/docs/installation")));
    expect(visible).toContain("npx shadcn@latest add https://example.com/r/button.json");
    expect(visible).toContain(
      "npx shadcn@latest registry add @buril=https://example.com/r/{name}.json",
    );
    expect(visible).toContain("npx shadcn@latest add @buril/button");
    expect(visible).toMatch(/example\.com[^.]*placeholder/);
  });

  it("documents the opt-in theme and the cn package note", async () => {
    const visible = text(main(await render("installation", "/docs/installation")));
    expect(visible).toContain("npx shadcn@latest add @buril/theme");
    expect(visible).toMatch(/does not change your theme/);
    expect(visible).toMatch(/re-exports\s+cn\(\)\s+from\s+the\s+cn\s+npm\s+package/);
    expect(visible).toMatch(/also\s+adds\s+cn\s+to\s+your\s+dependencies/);
  });
});

describe("theming page", () => {
  const tokens = readTokens(readFileSync(resolve(root, "registry/styles/buril.css"), "utf8"));

  it("describes the three token layers", async () => {
    const visible = text(main(await render("theming", "/docs/theming")));
    expect(visible).toMatch(/--buril-/);
    expect(visible).toMatch(/shadcn/);
    expect(visible).toMatch(/--decor/);
    expect(visible).toMatch(/--grid/);
  });

  it("tables every shadcn token name with its Buril light and dark values", async () => {
    const html = main(await render("theming", "/docs/theming"));
    const table = /<table[\s\S]*?<\/table>/.exec(html)![0];
    expect(table).toMatch(/<caption/);
    const headers = [...table.matchAll(/<th[^>]*scope="col"[^>]*>([\s\S]*?)<\/th>/g)].map(
      ([, cell]) => text(cell!).trim(),
    );
    expect(headers).toEqual(["Token", "Light", "Dark"]);
    for (const { name, light, dark } of tokens) {
      const row = new RegExp(
        `<tr[^>]*>(?:(?!</tr>)[\\s\\S])*--${escape(name)}\\b(?:(?!</tr>)[\\s\\S])*</tr>`,
      ).exec(table);
      expect(row, name).not.toBeNull();
      expect(row![0]).toMatch(/<th[^>]*scope="row"/);
      expect(text(row![0])).toContain(light);
      expect(text(row![0])).toContain(dark);
    }
  });

  it("explains dark mode classes, the system fallback and the no-flash script", async () => {
    const visible = text(main(await render("theming", "/docs/theming")));
    expect(visible).toMatch(/\.dark/);
    expect(visible).toMatch(/\.light/);
    expect(visible).toMatch(/prefers-color-scheme/);
    // The snippet is the script this site runs, not a hand-copied version.
    expect(visible.replace(/\s+/g, "")).toContain(noFlashScript.replace(/\s+/g, ""));
  });

  it("shows how to override the red", async () => {
    const visible = text(main(await render("theming", "/docs/theming")));
    const start = visible.indexOf("Override the red");
    expect(start).toBeGreaterThan(-1);
    const section = visible.slice(start);
    for (const token of ["--decor", "--ring", "--destructive"]) expect(section).toContain(token);
    expect(section).toMatch(/3:1/);
    expect(section).toMatch(/4\.5:1/);
  });
});

describe("components index", () => {
  it("links every documented component with its description", async () => {
    const html = main(await render("components", "/docs/components"));
    for (const { slug, name, description } of documentedComponents) {
      const link = new RegExp(`<a[^>]+href="${escape(componentHref(slug))}"[\\s\\S]*?</a>`).exec(
        html,
      );
      expect(link, name).not.toBeNull();
      expect(text(link![0])).toContain(name);
      expect(text(html)).toContain(text(description));
    }
  });
});

describe("component URLs", () => {
  it("live under /docs/components like the rest of the docs", () => {
    for (const { slug } of documentedComponents) {
      expect(componentHref(slug)).toBe(`/docs/components/${slug}`);
      expect(existsSync(resolve(root, `src/pages/docs/components/${slug}.astro`)), slug).toBe(true);
      expect(existsSync(resolve(root, `src/pages/components/${slug}.astro`)), slug).toBe(false);
    }
  });

  it("redirect the old /components paths so existing links keep working", () => {
    const redirects = astroConfig.redirects ?? {};
    for (const { slug } of documentedComponents) {
      expect(redirects[`/components/${slug}`], slug).toBe(`/docs/components/${slug}`);
    }
  });
});
