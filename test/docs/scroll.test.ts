// @vitest-environment node
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { compile } from "tailwindcss";
import { beforeAll, describe, expect, it } from "vitest";

import ButtonPage from "../../src/pages/docs/components/button.astro";

/**
 * The docs scroll model: the document is the only visible scroller. From the lg breakpoint the
 * header sticks to the top, and the sidebar and the "On this page" list stick right below it as
 * viewport-sized panels that scroll on their own without showing a second scrollbar. A real
 * browser check of the same model lives in the screenshot harness; these tests pin the structure.
 */
let container: AstroContainer;
let html: string;

const globalCssPath = resolve(__dirname, "../../src/styles/global.css");
const tailwindDir = resolve(dirname(createRequire(import.meta.url).resolve("tailwindcss")), "..");

async function buildCss(candidates: string[]) {
  const compiler = await compile(readFileSync(globalCssPath, "utf8"), {
    base: dirname(globalCssPath),
    loadStylesheet: async (id: string, base: string) => {
      const path = id === "tailwindcss" ? join(tailwindDir, "index.css") : resolve(base, id);
      return { path, base: dirname(path), content: readFileSync(path, "utf8") };
    },
  });
  return compiler.build(candidates).replace(/\s+/g, " ");
}

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
  html = await container.renderToString(ButtonPage, {
    request: new Request("http://localhost/docs/components/button"),
  });
});

const openTag = (pattern: RegExp) => pattern.exec(html)?.[0] ?? "";
const classesOf = (tag: string) => (/class="([^"]*)"/.exec(tag)?.[1] ?? "").split(/\s+/);

describe("docs scroll model", () => {
  it("sticks the header to the top from the lg breakpoint, with an opaque background", () => {
    const header = classesOf(openTag(/<header[^>]*>/));
    expect(header).toEqual(expect.arrayContaining(["lg:sticky", "lg:top-0", "bg-background"]));
    expect(header.some((name) => /^lg:z-\d+$/.test(name))).toBe(true);
    // The header itself, bottom border included, is the shared height the panels offset by;
    // sizing only the row inside would leave the border 1px under the panels.
    expect(header).toContain("lg:h-(--header-height)");
    const row = classesOf(openTag(/<header[^>]*>\s*<div[^>]*>/).replace(/^<header[^>]*>/, ""));
    expect(row).toContain("lg:h-full");
  });

  it("makes the sidebar a sticky panel on large screens, with the divider on the panel", () => {
    const sidebar = classesOf(openTag(/<nav[^>]*aria-label="Docs"[^>]*>/));
    expect(sidebar).toContain("lg:docs-panel");
    // The line is as tall as the panel, not the page: the panel draws it, the column does not.
    expect(sidebar).toEqual(expect.arrayContaining(["lg:border-r", "lg:border-border"]));
    const column = classesOf(openTag(/<div[^>]*>\s*<button[^>]*data-docs-nav-toggle/));
    expect(column).toContain("lg:p-0");
    expect(column.filter((name) => /^lg:border-r/.test(name))).toEqual([]);
    // The old panel was a full viewport tall under a header that scrolled away.
    expect(sidebar).not.toContain("lg:max-h-dvh");
    expect(sidebar).not.toContain("lg:top-0");
  });

  it("makes the On this page list the same kind of panel on extra-large screens", () => {
    const toc = classesOf(openTag(/<nav[^>]*aria-label="On this page"[^>]*>/));
    expect(toc).toEqual(expect.arrayContaining(["xl:docs-panel", "xl:self-start"]));
    expect(toc).not.toContain("xl:max-h-dvh");
  });

  it("defines the panel as sticky below the header, contained and without a visible scrollbar", async () => {
    const css = await buildCss(["lg:docs-panel"]);
    const panel = css.slice(css.indexOf(".lg\\:docs-panel"));
    expect(panel).toMatch(/position: sticky/);
    // Inset from the header and from the bottom of the viewport by the same gap, like a card.
    expect(css).toMatch(/--docs-panel-gap: [\d.]+rem/);
    expect(panel).toMatch(/top: calc\(var\(--header-height\) \+ var\(--docs-panel-gap\)\)/);
    expect(panel).toMatch(
      /max-height: calc\(100svh - var\(--header-height\) - 2 \* var\(--docs-panel-gap\)\)/,
    );
    // The last 2rem fade out, so a cut-off list reads as "more below"; the bottom padding lets
    // the last link scroll clear of the fade. Forced colors drop the mask.
    expect(panel).toMatch(
      /mask-image: linear-gradient\(to bottom, #000 calc\(100% - 2rem\), transparent\)/,
    );
    expect(panel).toMatch(/padding-bottom: 2rem/);
    expect(panel).toMatch(
      /@media \(forced-colors: active\) \{ \.lg\\:docs-panel \{ mask-image: none;? \} \}/,
    );
    expect(panel).toMatch(/overflow-y: auto/);
    expect(panel).toMatch(/overscroll-behavior: contain/);
    expect(panel).toMatch(/scrollbar-width: none/);
    // Older WebKit and Blink ignore scrollbar-width and need the pseudo-element.
    expect(panel).toMatch(/::-webkit-scrollbar \{ display: none;? \}/);
  });

  it("keeps focused and linked targets clear of the sticky header", async () => {
    const css = await buildCss([]);
    expect(css).toMatch(/--header-height: [\d.]+rem/);
    expect(css).toMatch(
      /@media \(width >= 64rem\) \{ html \{ scroll-padding-top: calc\(var\(--header-height\) \+ [\d.]+rem\);? \} \}/,
    );
  });
});
