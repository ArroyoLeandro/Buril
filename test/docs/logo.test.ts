// @vitest-environment node
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import IndexPage from "../../src/pages/index.astro";
import SpanishIndexPage from "../../src/pages/es/index.astro";
import ButtonPage from "../../src/pages/docs/components/button.astro";

/**
 * The Buril mark: concentric rings with a graver entering from the top right, its tip resting on
 * the inner ring, and the stretch of ring it just cut in red. A site-only component in the header
 * and an SVG favicon that reads on light and dark tabs.
 */
let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const root = resolve(__dirname, "../..");
const header = (html: string) => /<header[\s\S]*?<\/header>/.exec(html)![0];
const head = (html: string) => html.slice(0, html.indexOf("</head>"));
const homeLink = (html: string) =>
  /<a[^>]*href="(?:\/es)?\/"[^>]*>[\s\S]*?<\/a>/.exec(header(html))![0];

/** The mark's geometry on its 48 grid, shared by the header and the favicon. */
function expectMarkGeometry(svg: string) {
  expect(svg).toMatch(/viewBox="0 0 48 48"/);
  expect(svg).toMatch(/<circle[^>]*cx="22"[^>]*cy="26"[^>]*r="7.5"/);
  expect(svg).toMatch(/<circle[^>]*cx="22"[^>]*cy="26"[^>]*r="16.5"/);
  expect(svg).toMatch(/stroke-width="4"/);
  // The graver, its tip on the inner ring at -45°, and the 110° arc it cut behind the tip.
  expect(svg).toMatch(
    /<polygon[^>]*transform="translate\(27.3 20.7\) rotate\(-45\)"[^>]*points="0,0 9.88,-3.8 22,-3.8 22,3.8 2.66,3.8"/,
  );
  expect(svg).toMatch(/<path[^>]*d="M15.2 22.83 A7.5 7.5 0 0 1 27.3 20.7"/);
  // The rings break where the tool crosses them: a mask with the tool outline and a 5 unit gap.
  const mask = /<mask[^>]*id="([^"]+)"[\s\S]*?<\/mask>/.exec(svg);
  expect(mask, "mask").not.toBeNull();
  expect(mask![0]).toMatch(/stroke-width="5"/);
  expect(svg).toContain(`mask="url(#${mask![1]})"`);
}

describe.each([
  ["en", IndexPage, "/"],
  ["es", SpanishIndexPage, "/es/"],
  ["en", ButtonPage, "/docs/components/button"],
] as const)("%s header mark on %s", (_, page, path) => {
  const render = () =>
    container.renderToString(page, { request: new Request(`http://localhost${path}`) });

  it("replaces the old glyph with the Buril mark, decorative, beside the name", async () => {
    const link = homeLink(await render());
    const svg = /<svg[\s\S]*?<\/svg>/.exec(link)![0];
    expect(svg).toMatch(/^<svg[^>]*data-logo="buril"/);
    expect(svg).toMatch(/^<svg[^>]*aria-hidden="true"/);
    expect(svg).toMatch(/^<svg[^>]*focusable="false"/);
    expectMarkGeometry(svg);
    // The cut stretch is the decoration red; the rings and the graver are the text color.
    expect(svg).toMatch(/<path[^>]*class="[^"]*\btext-decor\b[^"]*"[^>]*stroke="currentColor"/);
    expect(svg).not.toMatch(/#[0-9a-f]{3,6}\b/i);
    // The old glyph: a diagonal stroke over a baseline.
    expect(svg).not.toContain("M3 21 15 9");
    expect(link.replace(/<[^>]+>/g, "").trim()).toBe("Buril UI");
  });

  it("links the SVG favicon", async () => {
    expect(head(await render())).toMatch(
      /<link rel="icon" href="\/favicon.svg" type="image\/svg\+xml"/,
    );
  });
});

describe("favicon", () => {
  const favicon = readFileSync(join(root, "public/favicon.svg"), "utf8");

  it("draws the same mark", () => {
    expect(favicon).toMatch(/^<svg[^>]*xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    expectMarkGeometry(favicon);
  });

  it("switches to light ink and a brighter red on dark browser tabs", () => {
    expect(favicon).toMatch(/<style>[\s\S]*#1a1714[\s\S]*#d72828[\s\S]*<\/style>/i);
    expect(favicon).toMatch(
      /@media \(prefers-color-scheme: dark\)\s*\{[\s\S]*#ede6da[\s\S]*#ff5a51[\s\S]*\}/i,
    );
  });

  it("loads nothing from outside the file", () => {
    expect(favicon).not.toMatch(/href=|url\((?!#)/);
  });
});

describe("mark component", () => {
  it("is site-only: nothing in the registry refers to it", () => {
    expect(readFileSync(join(root, "registry.json"), "utf8")).not.toMatch(/BurilMark/);
  });
});
