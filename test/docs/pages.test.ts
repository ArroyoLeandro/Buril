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

/** Rules every page must satisfy: one document, one main landmark, nothing after </html>. */
function expectWellFormedPage(html: string) {
  expect(count(html, /<main[\s>]/g)).toBe(1);
  expect(count(html, /<\/main>/g)).toBe(1);
  expect(count(html, /<html[\s>]/g)).toBe(1);
  expect(html.trimEnd().endsWith("</html>")).toBe(true);
  expect(html.slice(html.lastIndexOf("</html>") + "</html>".length).trim()).toBe("");
}

describe("index page", () => {
  it("renders one document with a single main landmark", async () => {
    expectWellFormedPage(await container.renderToString(IndexPage));
  });

  it("links to the button page", async () => {
    const html = await container.renderToString(IndexPage);
    expect(html).toMatch(/<a[^>]+href="\/components\/button"/);
  });
});

describe("button page", () => {
  it("renders one document with a single main landmark", async () => {
    expectWellFormedPage(await container.renderToString(ButtonPage));
  });

  it("renders the Install section exactly once with its code block", async () => {
    const html = await container.renderToString(ButtonPage);
    expect(count(html, />Install<\/h2>/g)).toBe(1);
    expect(count(text(html), /registry add @buril=https:\/\/example\.com/g)).toBe(1);
    expect(count(text(html), /shadcn@latest add @buril\/button/g)).toBe(1);
  });

  it("renders the Source section exactly once with the component source", async () => {
    const html = await container.renderToString(ButtonPage);
    expect(count(html, />Source<\/h2>/g)).toBe(1);
    expect(count(text(html), /const buttonVariants = cva\(/g)).toBe(1);
    expect(count(html, /class="astro-code/g)).toBe(2);
  });

  it("renders the demo as a single island", async () => {
    const html = await container.renderToString(ButtonPage);
    expect(count(html, /<astro-island/g)).toBe(1);
  });
});
