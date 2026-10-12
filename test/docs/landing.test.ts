// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import IndexPage from "../../src/pages/index.astro";
import ButtonPage from "../../src/pages/docs/components/button.astro";

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
const render = () => container.renderToString(IndexPage, { request: new Request("http://x/") });
const main = (html: string) => /<main[\s\S]*<\/main>/.exec(html)![0];
const section = (html: string, title: string) => {
  const start = html.search(new RegExp(`>\\s*${title}\\s*</h2>`));
  expect(start, title).toBeGreaterThan(-1);
  const end = html.indexOf("<h2", start);
  return html.slice(start, end === -1 ? undefined : end);
};

describe("landing page", () => {
  it("has a hero with the name, a one-line value proposition and two link CTAs", async () => {
    const html = main(await render());
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(text(/<h1[^>]*>[\s\S]*?<\/h1>/.exec(html)![0])).toBe("Buril UI");
    expect(text(html)).toMatch(/Accessible React components you copy into your project/);
    // Real links styled as pill buttons, never a button that navigates.
    expect(html).toMatch(
      /<a[^>]+href="\/docs"[^>]+class="[^"]*rounded-full[^"]*"[^>]*>\s*Get started/,
    );
    expect(html).toMatch(
      /<a[^>]+href="\/docs\/components"[^>]+class="[^"]*rounded-full[^"]*"[^>]*>\s*Components/,
    );
  });

  it("keeps the engraved illustration out of the accessibility tree", async () => {
    const html = main(await render());
    const svgs = [...html.matchAll(/<svg\b[^>]*>/g)].map(([tag]) => tag);
    const art = svgs.filter((tag) => tag.includes("data-engraving"));
    expect(art).toHaveLength(1);
    expect(art[0]).toMatch(/aria-hidden="true"/);
    expect(art[0]).toMatch(/focusable="false"/);
    expect(html).not.toMatch(/role="img"/);
  });

  it("states the four principles", async () => {
    const values = text(section(main(await render()), "Why Buril"));
    for (const principle of [
      "You own the code",
      "Accessible by default",
      "Platform first",
      "Themeable",
    ]) {
      expect(values).toContain(principle);
    }
  });

  it("shows real components at work in three live panels", async () => {
    const html = section(main(await render()), "Components at work");
    expect(html.match(/<astro-island/g)).toHaveLength(3);
    // Server-rendered markup of the real components, readable before hydration.
    expect(html).toMatch(/<input[^>]+type="email"/);
    expect(html).toMatch(/<input[^>]+type="checkbox"(?![^>]*role="switch")/);
    expect(html).toMatch(/<input[^>]+role="switch"/);
    expect(html).toMatch(/<fieldset/);
    expect(html).toMatch(/<select/);
    expect(html).toMatch(/<button[^>]+type="submit"/);
  });

  it("ends with the install commands and a link to the guide", async () => {
    const html = section(main(await render()), "Install");
    expect(html).toMatch(/data-install-tabs/);
    expect(text(html)).toContain(
      "npx shadcn@latest registry add @buril=https://example.com/r/{name}.json",
    );
    expect(text(html)).toContain("npx shadcn@latest add @buril/button");
    expect(html).toMatch(/<a[^>]+href="\/docs\/installation"/);
  });

  it("has no docs sidebar or page TOC", async () => {
    const html = await render();
    expect(html).not.toMatch(/aria-label="Docs"/);
    expect(html).not.toMatch(/aria-label="On this page"/);
  });
});

describe.each([
  ["landing page", IndexPage],
  ["component page", ButtonPage],
] as [string, AstroComponentFactory][])("footer on the %s", (_, page) => {
  it("is a footer outside the main with the license and the GitHub link", async () => {
    const html = await container.renderToString(page);
    const footer = /<footer[\s\S]*?<\/footer>/.exec(html)?.[0] ?? "";
    expect(html.match(/<footer[\s>]/g)).toHaveLength(1);
    expect(html.indexOf("<footer")).toBeGreaterThan(html.indexOf("</main>"));
    expect(text(footer)).toMatch(/MIT/);
    expect(footer).toMatch(
      /<a[^>]+href="https:\/\/github\.com\/ArroyoLeandro\/Buril\/blob\/main\/LICENSE"/,
    );
    expect(footer).toMatch(/<a[^>]+href="https:\/\/github\.com\/ArroyoLeandro\/Buril"/);
  });
});
