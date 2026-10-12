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

  it("frames each live panel in a real Card with a heading and the engraved band", async () => {
    const html = section(main(await render()), "Components at work");
    const cards = html.split(/(?=<div[^>]*data-slot="card")/).slice(1);
    expect(cards).toHaveLength(3);
    for (const card of cards) {
      expect(card).toMatch(/^<div[^>]*class="[^"]*\bborder-border\b/);
      expect(card).toMatch(/<div[^>]*data-decor[^>]*aria-hidden="true"/);
      expect(card).toMatch(/<h3[^>]*data-slot="card-title"/);
      // The island sits in the card's content, so the panel reads as one unit.
      expect(card).toMatch(/data-slot="card-content"[\s\S]*<astro-island/);
    }
    const titles = cards.map((card) => text(/<h3[^>]*>[\s\S]*?<\/h3>/.exec(card)![0]));
    expect(titles).toEqual(["Sign in", "Notifications", "Buttons"]);
  });

  it("names the components each panel uses with badges, not links or buttons", async () => {
    const html = section(main(await render()), "Components at work");
    const badges = [...html.matchAll(/<span[^>]*data-slot="badge"[^>]*>([\s\S]*?)<\/span>/g)];
    expect(badges.map(([, label]) => text(label!))).toEqual([
      "Field",
      "Input",
      "Checkbox",
      "Button",
      "Field",
      "Switch",
      "Radio Group",
      "Select",
      "Button",
    ]);
    for (const [badge] of badges) expect(badge).not.toMatch(/tabindex|role=/);
    expect(html.match(/<ul[^>]*aria-label="Components used"/g)).toHaveLength(3);
  });

  it("states the shadcn requirement in a static Alert before the commands", async () => {
    const html = section(main(await render()), "Install");
    const alert = /<div[^>]*data-slot="alert"[^>]*>/.exec(html);
    expect(alert).not.toBeNull();
    // Static content on load: no live role that would announce it.
    expect(alert![0]).not.toMatch(/role=/);
    expect(alert!.index).toBeLessThan(html.indexOf("data-install-tabs"));
    const callout = text(html.slice(alert!.index));
    expect(callout).toMatch(/components\.json/);
    expect(callout).toMatch(/npx shadcn@latest init/);
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
