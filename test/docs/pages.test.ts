// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import IndexPage from "../../src/pages/index.astro";
import ButtonPage from "../../src/pages/components/button.astro";

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

/** Visible text: Shiki splits code into many spans, so match on text content. */
const text = (html: string) => html.replace(/<[^>]+>/g, "");

const count = (html: string, pattern: RegExp) => html.match(pattern)?.length ?? 0;

const luminance = (hex: string) => {
  const full = hex.length === 4 ? hex.replace(/\w/g, "$&$&") : hex;
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

/** Every token color in every highlighted code block, with that block's background. */
function codeColors(html: string) {
  const pairs: { color: string; background: string }[] = [];
  for (const block of html.matchAll(
    /<pre class="astro-code[^"]*" style="([^"]*)"[\s\S]*?<\/pre>/g,
  )) {
    const background = /background-color:\s*(#[0-9a-fA-F]{3,6})\b/.exec(block[1]!)![1]!;
    for (const match of block[0].matchAll(/(?<![-\w])color:\s*(#[0-9a-fA-F]{3,6})\b/g)) {
      pairs.push({ color: match[1]!, background });
    }
  }
  return pairs;
}

const pages = [
  ["index", () => IndexPage],
  ["button", () => ButtonPage],
] as const;

/** Rules every page must satisfy: one document, one main landmark, nothing after </html>. */
function expectWellFormedPage(html: string) {
  expect(count(html, /<main[\s>]/g)).toBe(1);
  expect(count(html, /<\/main>/g)).toBe(1);
  expect(count(html, /<html[\s>]/g)).toBe(1);
  expect(html.trimEnd().endsWith("</html>")).toBe(true);
  expect(html.slice(html.lastIndexOf("</html>") + "</html>".length).trim()).toBe("");
}

describe.each(pages)("%s page layout", (_, page) => {
  const render = () => container.renderToString(page());

  it("opens with a skip link to the main landmark, visible on focus", async () => {
    const html = await render();
    const body = html.slice(html.indexOf("<body"));
    const firstLink = /<a\b[^>]*>[\s\S]*?<\/a>/.exec(body)![0];
    expect(firstLink).toMatch(/href="#main"/);
    expect(text(firstLink)).toMatch(/Skip to content/);
    expect(firstLink).toMatch(/\bsr-only\b/);
    expect(firstLink).toMatch(/focus:not-sr-only/);
    expect(html).toMatch(/<main[^>]*id="main"/);
  });

  it("has a header with the main navigation", async () => {
    const html = await render();
    const header = /<header[\s\S]*?<\/header>/.exec(html)?.[0] ?? "";
    const nav = /<nav[^>]*aria-label="Main"[\s\S]*?<\/nav>/.exec(header)?.[0] ?? "";
    expect(nav).toMatch(/<a[^>]+href="\/"[^>]*>\s*Home\s*<\/a>/);
    expect(text(nav)).toMatch(/Components/);
    expect(nav).toMatch(/<a[^>]+href="\/components\/button"[^>]*>\s*Button\s*<\/a>/);
  });

  it("has a theme toggle with light, dark and system choices", async () => {
    const html = await render();
    const group = /<div[^>]*role="group"[^>]*aria-label="Theme"[\s\S]*?<\/div>/.exec(html)?.[0];
    const buttons = [...(group ?? "").matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
    expect(buttons.map((button) => text(button[2]!).trim())).toEqual(["Light", "Dark", "System"]);
    for (const [, attributes] of buttons) {
      expect(attributes).toMatch(/type="button"/);
      expect(attributes).toMatch(/aria-pressed="(true|false)"/);
    }
  });

  it("applies the stored theme in <head> before first paint", async () => {
    const html = await render();
    const head = html.slice(0, html.indexOf("</head>"));
    expect(head).toMatch(/<script>[^<]*localStorage[^<]*<\/script>/);
    expect(head).toMatch(/<script>[^<]*try\s*\{[^<]*<\/script>/);
  });
});

describe("index page", () => {
  it("renders one document with a single main landmark", async () => {
    expectWellFormedPage(await container.renderToString(IndexPage));
  });

  it("links to the button page", async () => {
    const html = await container.renderToString(IndexPage);
    expect(html).toMatch(/<a[^>]+href="\/components\/button"/);
  });

  it("uses buttonVariants for its call to action instead of a dead button", async () => {
    const html = await container.renderToString(IndexPage);
    const main = /<main[\s\S]*<\/main>/.exec(html)![0];
    expect(main).not.toMatch(/<button/);
    expect(main).toMatch(/<a[^>]+href="\/components\/button"[^>]+class="[^"]*rounded-full/);
  });
});

describe("button page", () => {
  it("renders one document with a single main landmark", async () => {
    expectWellFormedPage(await container.renderToString(ButtonPage));
  });

  it("renders the Install section exactly once with URL and namespaced commands", async () => {
    const html = await container.renderToString(ButtonPage);
    expect(count(html, />Install<\/h2>/g)).toBe(1);
    expect(count(text(html), /shadcn@latest add https:\/\/example\.com\/r\/button\.json/g)).toBe(1);
    expect(count(text(html), /registry add @buril=https:\/\/example\.com/g)).toBe(1);
    expect(count(text(html), /shadcn@latest add @buril\/button/g)).toBe(1);
  });

  it("documents the theme as a separate opt-in install and its dark-mode behavior", async () => {
    const html = await container.renderToString(ButtonPage);
    expect(count(html, />Optional theme<\/h2>/g)).toBe(1);
    expect(count(text(html), /shadcn@latest add @buril\/theme/g)).toBe(1);
    expect(text(html)).toMatch(/does not change your theme/);
    expect(text(html)).toMatch(/prefers-color-scheme: dark/);
    expect(text(html)).toMatch(/class="light"|class=&quot;light&quot;/);
  });

  it("renders the Source section exactly once with the component source", async () => {
    const html = await container.renderToString(ButtonPage);
    expect(count(html, />Source<\/h2>/g)).toBe(1);
    expect(count(text(html), /const buttonVariants = cva\(/g)).toBe(1);
  });

  it("meets AA contrast for every token color in its code blocks, comments included", async () => {
    const html = await container.renderToString(ButtonPage);
    const pairs = codeColors(html);
    expect(pairs.length).toBeGreaterThan(20);
    const worst = Math.min(...pairs.map(({ color, background }) => contrast(color, background)));
    expect(worst).toBeGreaterThanOrEqual(4.5);
  });

  it("does not claim that screen readers announce aria-busy", async () => {
    const html = await container.renderToString(ButtonPage);
    expect(text(html)).not.toMatch(/announces\s+`?aria-busy/);
  });

  it("documents announcing progress with a status region outside the button", async () => {
    const html = await container.renderToString(ButtonPage);
    expect(count(html, />Loading<\/h2>/g)).toBe(1);
    expect(text(html)).toMatch(/role=(&quot;|")status(&quot;|")/);
    expect(html).toMatch(/<[a-z]+[^>]*role="status"/);
  });

  it("renders the demo as a single island", async () => {
    const html = await container.renderToString(ButtonPage);
    expect(count(html, /<astro-island/g)).toBe(1);
  });
});
