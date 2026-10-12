// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import IndexPage from "../../src/pages/index.astro";
import { componentHref, documentedComponents } from "../../src/data/components";
import { docsNav } from "../../src/data/docs-nav";

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const text = (html: string) => html.replace(/<[^>]+>/g, "");
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const componentPages = Object.fromEntries(
  Object.entries(
    import.meta.glob<AstroComponentFactory>("../../src/pages/components/*.astro", {
      eager: true,
      import: "default",
    }),
  ).map(([path, page]) => [/([^/]+)\.astro$/.exec(path)![1]!, page]),
);

const renderComponentPage = (slug: string) =>
  container.renderToString(componentPages[slug]!, {
    request: new Request(`http://localhost${componentHref(slug)}`),
  });

const header = (html: string) => /<header[\s\S]*?<\/header>/.exec(html)?.[0] ?? "";
const main = (html: string) => /<main[\s\S]*<\/main>/.exec(html)![0];
const sidebar = (html: string) => /<nav[^>]*aria-label="Docs"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? "";
const toc = (html: string) =>
  /<nav[^>]*aria-label="On this page"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? "";

/** Rendered markup outside React islands: a demo's own headings are not page sections. */
const outsideIslands = (html: string) => html.replace(/<astro-island[\s\S]*?<\/astro-island>/g, "");

describe("site header", () => {
  it.each([
    ["landing page", () => container.renderToString(IndexPage)],
    ["component page", () => renderComponentPage("button")],
  ])("on the %s has the wordmark, the main links and the theme toggle", async (_, render) => {
    const html = header(await render());
    expect(html).toMatch(/<a[^>]+href="\/"[^>]*>[\s\S]*?Buril UI[\s\S]*?<\/a>/);
    const nav = /<nav[^>]*aria-label="Main"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? "";
    expect(nav).toMatch(/<a[^>]+href="\/docs"[^>]*>\s*Docs\s*<\/a>/);
    expect(nav).toMatch(/<a[^>]+href="\/docs\/components"[^>]*>\s*Components\s*<\/a>/);
    expect(nav).toMatch(/<a[^>]+href="https:\/\/github\.com\/ArroyoLeandro\/Buril"/);
    expect(text(nav)).toMatch(/GitHub/);
    expect(html).toMatch(/role="group"[^>]*aria-label="Theme"/);
  });
});

describe("docs shell on a component page", () => {
  it("has one banner, one main and the sidebar and TOC outside the main", async () => {
    const html = await renderComponentPage("button");
    expect(html.match(/<header[\s>]/g)).toHaveLength(1);
    expect(html.match(/<main[\s>]/g)).toHaveLength(1);
    expect(main(html)).not.toMatch(/aria-label="Docs"/);
    expect(main(html)).not.toMatch(/aria-label="On this page"/);
    expect(sidebar(html)).not.toBe("");
    expect(toc(html)).not.toBe("");
  });

  it("groups the sidebar links under labelled lists that follow the docs nav", async () => {
    const nav = sidebar(await renderComponentPage("button"));
    for (const group of docsNav()) {
      const label = new RegExp(
        `<[a-z]+[^>]*id="([^"]+)"[^>]*>\\s*${escape(group.title)}\\s*<`,
      ).exec(nav);
      expect(label, group.title).not.toBeNull();
      const list = new RegExp(`<ul[^>]*aria-labelledby="${label![1]}"[\\s\\S]*?</ul>`).exec(nav);
      expect(list, group.title).not.toBeNull();
      for (const item of group.items) {
        expect(list![0]).toMatch(
          new RegExp(`<a[^>]+href="${escape(item.href)}"[^>]*>\\s*${escape(item.name)}\\s*</a>`),
        );
      }
    }
  });

  it.each(documentedComponents.map(({ slug }) => slug))(
    "marks only the %s link as the current page",
    async (slug) => {
      const nav = sidebar(await renderComponentPage(slug));
      const current = [...nav.matchAll(/<a[^>]+aria-current="page"[^>]*>/g)];
      expect(current).toHaveLength(1);
      expect(current[0]![0]).toContain(`href="${componentHref(slug)}"`);
    },
  );

  it("collapses the sidebar behind a menu button on small screens", async () => {
    const html = await renderComponentPage("button");
    const id = /<nav[^>]*aria-label="Docs"[^>]*>/.exec(html)![0].match(/id="([^"]+)"/)?.[1];
    expect(id).toBeDefined();
    const button = /<button[^>]*data-docs-nav-toggle[^>]*>[\s\S]*?<\/button>/.exec(html)?.[0];
    expect(button).toBeDefined();
    expect(button).toMatch(/type="button"/);
    expect(button).toMatch(/aria-expanded="false"/);
    expect(button).toContain(`aria-controls="${id}"`);
    // Without JavaScript the button could not do anything, so it starts hidden.
    expect(button).toMatch(/\shidden[\s>=]/);
    expect(button).toMatch(/lg:hidden/);
    expect(text(button!).trim()).toMatch(/Menu/);
    // The button comes right before the menu, so Tab moves from one into the other.
    expect(html.indexOf("data-docs-nav-toggle")).toBeLessThan(html.indexOf('aria-label="Docs"'));
  });

  it("lists every h2 and h3 of the main content in the On this page nav", async () => {
    const html = await renderComponentPage("button");
    const content = outsideIslands(main(html));
    const headings = [...content.matchAll(/<h([23])\b[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)];
    const all = [...content.matchAll(/<h[23][\s>]/g)];
    expect(headings.length).toBe(all.length);
    expect(headings.length).toBeGreaterThan(2);
    const links = [...toc(html).matchAll(/<a[^>]+href="#([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
    expect(links.map(([, id]) => id)).toEqual(headings.map(([, , id]) => id));
    for (const [, , label] of links) expect(text(label!).trim()).not.toBe("");
  });

  it("links every TOC entry to exactly one element id on the page", async () => {
    const html = await renderComponentPage("field");
    const ids = [...toc(html).matchAll(/href="#([^"]+)"/g)].map(([, id]) => id!);
    expect(ids.length).toBeGreaterThan(2);
    for (const id of ids) {
      expect(html.match(new RegExp(`\\sid="${escape(id)}"`, "g")), id).toHaveLength(1);
    }
  });

  it("leaves demo headings inside the island out of the TOC", async () => {
    const html = await renderComponentPage("button");
    expect(text(toc(html))).not.toMatch(/Variants/);
  });

  it("hides the TOC on small screens", async () => {
    const html = await renderComponentPage("button");
    const open = /<nav[^>]*aria-label="On this page"[^>]*>/.exec(html)![0];
    expect(open).toMatch(/\bhidden\b/);
    expect(open).toMatch(/xl:block/);
  });
});
