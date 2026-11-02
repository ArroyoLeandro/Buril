// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import { mcpClients } from "../../src/data/agents";
import { llmsTxt } from "../../src/data/llms";
import { routeOf } from "../../src/i18n/paths";
import { locales, type Locale } from "../../src/i18n/ui";

/**
 * The AI agents page, in both languages: how an agent reaches Buril through the shadcn MCP server
 * or the CLI, and where the plain-text docs live. Commands and code stay the same in Spanish.
 */
let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const pages = Object.fromEntries(
  Object.entries(
    import.meta.glob<AstroComponentFactory>("../../src/pages/**/*.astro", {
      eager: true,
      import: "default",
    }),
  ).map(([file, page]) => [routeOf(file), page]),
);

const route = (locale: Locale) => (locale === "es" ? "/es/docs/ai-agents" : "/docs/ai-agents");
const decode = (html: string) =>
  html
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
const text = (html: string) =>
  decode(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

async function main(locale: Locale) {
  const page = pages[route(locale)];
  expect(page, route(locale)).toBeDefined();
  const html = await container.renderToString(page!, {
    request: new Request(`http://localhost${route(locale)}`),
  });
  return /<main[\s\S]*<\/main>/.exec(html)![0];
}
const squash = (value: string) => value.replace(/\s+/g, "");
const commands = (html: string) =>
  [...html.matchAll(/data-copy="([^"]*)"/g)].map(([, code]) => decode(code!));

describe.each(locales)("the %s AI agents page", (locale) => {
  it("is titled in its language", async () => {
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(await main(locale))![1]!;
    expect(text(h1)).toBe(locale === "es" ? "Agentes de IA" : "AI agents");
  });

  it("explains why: agents can browse, search and install Buril components", async () => {
    const page = text(await main(locale));
    expect(page).toContain("MCP");
    expect(page).toMatch(
      locale === "es" ? /buscar[\s\S]*instalar/ : /browse[\s\S]*search[\s\S]*install/,
    );
  });

  it("shows the components.json registries entry for @buril", async () => {
    // Highlighted code is split into spans, so compare it without whitespace.
    expect(squash(text(await main(locale)))).toContain(
      '{"registries":{"@buril":"https://buril.site/r/{name}.json"}}',
    );
  });

  it("sets up the shadcn MCP server and names every client it supports", async () => {
    const html = await main(locale);
    expect(commands(html)).toContain("npx shadcn@latest mcp init --client claude");
    const page = text(html);
    for (const { id, name, config } of mcpClients) {
      expect(page, id).toContain(`--client ${id}`);
      expect(page, id).toContain(name);
      expect(page, id).toContain(config);
    }
    expect(squash(page)).toContain('[mcp_servers.shadcn]command="npx"args=["shadcn@latest","mcp"]');
  });

  it("installs by namespace with the CLI", async () => {
    const copy = commands(await main(locale));
    expect(copy).toContain(
      "npx shadcn@latest registry add @buril=https://buril.site/r/{name}.json\nnpx shadcn@latest add @buril/button",
    );
  });

  it("links llms.txt, llms-full.txt and the installation page", async () => {
    const html = await main(locale);
    expect(html).toMatch(/<a[^>]+href="\/llms\.txt"/);
    expect(html).toMatch(/<a[^>]+href="\/llms-full\.txt"/);
    expect(html).toMatch(
      new RegExp(`<a[^>]+href="${locale === "es" ? "/es" : ""}/docs/installation"`),
    );
  });
});

describe("the AI agents page in llms.txt", () => {
  it("is listed with the other docs pages", () => {
    expect(llmsTxt()).toMatch(/^- \[AI agents\]\(https:\/\/buril\.site\/docs\/ai-agents\): \S/m);
  });
});
