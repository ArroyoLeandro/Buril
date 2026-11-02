// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { componentDocs } from "../../src/data/component-docs";
import { documentedComponents } from "../../src/data/components";
import { gettingStarted, guideItems } from "../../src/data/docs-nav";
import { llmsFullTxt, llmsTxt } from "../../src/data/llms";
import { pageRoutes } from "../../src/i18n/paths";
import { readMotionTokens, readTokens } from "../../src/utils/tokens";
import { GET as getFull } from "../../src/pages/llms-full.txt";
import { GET as getIndex } from "../../src/pages/llms.txt";

/**
 * The plain-text entry points for AI agents, built from the same data as the docs site:
 * `/llms.txt` follows llmstxt.org (an H1, a blockquote summary, then sections of links) and
 * `/llms-full.txt` holds the docs as one Markdown file.
 */
const index = llmsTxt();
const full = llmsFullTxt();
const registry = JSON.parse(readFileSync(resolve("registry.json"), "utf8")) as {
  items: { name: string; type: string }[];
};
const css = readFileSync(resolve("registry/styles/buril.css"), "utf8");
const items = [...new Set(documentedComponents.map(({ item }) => item))];

/** The `- [name](url)` links of one `## section`. */
function sectionLinks(text: string, title: string) {
  const start = text.indexOf(`\n## ${title}\n`);
  expect(start, title).toBeGreaterThan(-1);
  const end = text.indexOf("\n## ", start + 1);
  const body = text.slice(start, end === -1 ? undefined : end);
  return [...body.matchAll(/^- \[([^\]]+)\]\(([^)]+)\)/gm)].map(([, name, url]) => ({
    name: name!,
    url: url!,
  }));
}

describe("llms.txt", () => {
  it("opens with the H1 and a one-paragraph blockquote summary", () => {
    const [h1, blank, quote] = index.split("\n");
    expect(h1).toBe("# Buril UI");
    expect(blank).toBe("");
    expect(quote).toMatch(/^> \S/);
    expect(index.match(/^# /gm)).toHaveLength(1);
  });

  it("explains the registry URL pattern, the CLI and the shadcn MCP server", () => {
    expect(index).toContain("https://buril.site/r/{name}.json");
    expect(index).toContain('"@buril": "https://buril.site/r/{name}.json"');
    expect(index).toContain("npx shadcn@latest add @buril/button");
    expect(index).toContain("npx shadcn@latest mcp init --client claude");
  });

  it("links every Getting Started page and every guide", () => {
    const docs = sectionLinks(index, "Docs").map(({ url }) => url);
    for (const { href } of gettingStarted("en"))
      expect(docs).toContain(`https://buril.site${href}`);
    const guides = sectionLinks(index, "Guides").map(({ url }) => url);
    for (const { href } of guideItems("en")) expect(guides).toContain(`https://buril.site${href}`);
  });

  it("links every documented component page, with its description", () => {
    const links = sectionLinks(index, "Components");
    expect(links.map(({ name }) => name)).toEqual(documentedComponents.map(({ name }) => name));
    for (const { slug, description } of documentedComponents) {
      expect(index).toContain(`(https://buril.site/docs/components/${slug}): ${description}`);
    }
  });

  it("links the registry JSON of every component item and of the theme", () => {
    const urls = sectionLinks(index, "Registry").map(({ url }) => url);
    for (const item of [...items, "theme"])
      expect(urls).toContain(`https://buril.site/r/${item}.json`);
  });

  it("links only pages the site builds and items the registry ships", () => {
    const names = new Set(registry.items.map(({ name }) => name));
    const links = [...index.matchAll(/\]\((https:\/\/buril\.site[^)]*)\)/g)].map(([, url]) => url!);
    expect(links.length).toBeGreaterThan(30);
    for (const link of links) {
      const path = new URL(link).pathname;
      const item = /^\/r\/([\w-]+)\.json$/.exec(path)?.[1];
      if (item === "registry") continue;
      if (item) expect(names, link).toContain(item);
      else if (path !== "/llms-full.txt") expect(pageRoutes, link).toContain(path);
    }
  });

  it("is plain Markdown, in English, with no placeholder domain", () => {
    expect(index).not.toContain("example.com");
    expect(index).not.toMatch(/<\/?(div|span|p|a)\b/);
    expect(index).not.toMatch(/\/es\//);
  });
});

describe("llms-full.txt", () => {
  it("starts like llms.txt and covers installation, theming, motion and accessibility", () => {
    expect(full.split("\n")[0]).toBe("# Buril UI");
    for (const title of [
      "Installation",
      "Theming",
      "Motion",
      "Accessibility",
      "Guides",
      "Components",
    ])
      expect(full, title).toMatch(new RegExp(`^## ${title}$`, "m"));
    expect(full).toContain("npx shadcn@latest init");
    expect(full).toContain("npx shadcn@latest add @buril/theme");
  });

  it("lists every theme token and every motion token the theme ships", () => {
    for (const { name } of readTokens(css)) expect(full, name).toContain(`--${name}`);
    for (const { name, value } of readMotionTokens(css)) {
      expect(full, name).toContain(`--${name}`);
      expect(full, name).toContain(value);
    }
  });

  it.each(documentedComponents.map((entry) => [entry.name, entry] as const))(
    "documents %s: description, install command, usage, props and accessibility",
    (name, entry) => {
      const start = full.indexOf(`\n### ${name}\n`);
      expect(start, name).toBeGreaterThan(-1);
      const end = full.indexOf("\n### ", start + 1);
      const section = full.slice(start, end === -1 ? undefined : end);
      expect(section).toContain(entry.description);
      expect(section).toContain(`https://buril.site/docs/components/${entry.slug}`);
      expect(section).toContain(`npx shadcn@latest add @buril/${entry.item}`);
      const docs = componentDocs[entry.slug]!;
      expect(section).toContain(docs.usage);
      for (const api of docs.api) {
        expect(section).toContain(api.component);
        for (const prop of api.props) expect(section, prop.name).toContain(`\`${prop.name}\``);
      }
      for (const { key } of docs.keyboard ?? []) expect(section).toContain(key);
      expect(section).toContain(docs.aria.role);
    },
  );

  it("has balanced code fences and no HTML or placeholder domain", () => {
    expect((full.match(/^```/gm) ?? []).length % 2).toBe(0);
    expect(full).not.toContain("example.com");
    // Code samples are JSX, so only the prose around them must be free of HTML.
    const prose = full.replace(/^```[\s\S]*?^```/gm, "").replace(/`[^`\n]*`/g, "");
    expect(prose).not.toMatch(/<\/?(div|span|p|a|code)\b[^>]*>/);
  });
});

describe("the endpoints", () => {
  it.each([
    ["/llms.txt", getIndex, index],
    ["/llms-full.txt", getFull, full],
  ] as const)("%s serves the text as UTF-8 plain text", async (_, get, body) => {
    const response = await get({} as never);
    expect(response.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    expect(await response.text()).toBe(body);
  });
});
