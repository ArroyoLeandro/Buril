// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import IndexPage from "../../src/pages/index.astro";
import ButtonPage from "../../src/pages/docs/components/button.astro";

/**
 * Docs layout proportions, measured against ui.shadcn.com and adapted to Buril: a full-width
 * header and frame, a compact sidebar with a quiet current-page state, and a centred reading
 * column. The screenshot harness checks the rendered geometry; these tests pin the structure.
 */
let container: AstroContainer;
let docs: string;
let landing: string;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
  docs = await container.renderToString(ButtonPage, {
    request: new Request("http://localhost/docs/components/button"),
  });
  landing = await container.renderToString(IndexPage);
});

const classesOf = (tag: string) => (/class="([^"]*)"/.exec(tag)?.[1] ?? "").split(/\s+/);
const first = (html: string, pattern: RegExp) => pattern.exec(html)?.[0] ?? "";
const headerRow = (html: string) =>
  first(html, /<header[^>]*>\s*<div[^>]*>/).replace(/^<header[^>]*>/, "");
const footerRow = (html: string) =>
  first(html, /<footer[^>]*>\s*<div[^>]*>/).replace(/^<footer[^>]*>/, "");
const capped = (classes: string[]) => classes.filter((name) => /(^|:)max-w-/.test(name));

describe("full-width frame", () => {
  it.each([
    ["landing page", () => landing],
    ["docs page", () => docs],
  ])("on the %s spans the header row across the window", (_, html) => {
    expect(capped(classesOf(headerRow(html())))).toEqual([]);
  });

  // Only the landing page has a footer.
  it("on the landing page spans the footer row across the window", () => {
    expect(footerRow(landing)).not.toBe("");
    expect(capped(classesOf(footerRow(landing)))).toEqual([]);
  });

  it("lets the docs grid span the window, so the sidebar sits flush left", () => {
    const grid = classesOf(first(docs, /<div[^>]*class="[^"]*lg:grid[^"]*"[^>]*>/));
    expect(grid).toContain("lg:grid");
    expect(capped(grid)).toEqual([]);
  });

  it("pushes GitHub and the theme toggle to the end of the header on large screens", () => {
    const nav = first(docs, /<nav[^>]*aria-label="Main"[\s\S]*?<\/nav>/);
    expect(classesOf(first(nav, /<nav[^>]*>/))).toContain("lg:flex-1");
    const github = first(nav, /<li[^>]*>\s*<a[^>]+href="https:\/\/github\.com[^"]*"/);
    expect(classesOf(github)).toContain("lg:ms-auto");
  });
});

describe("docs sidebar", () => {
  const sidebar = () => first(docs, /<nav[^>]*aria-label="Docs"[\s\S]*?<\/nav>/);
  const links = () => [...sidebar().matchAll(/<a[^>]*>/g)].map(([tag]) => tag);

  it("uses compact type for the links", () => {
    for (const list of sidebar().matchAll(/<ul[^>]*>/g)) {
      expect(classesOf(list[0])).toContain("text-[0.8125rem]");
    }
  });

  it("keeps every link at least 32px tall, above the 24px target minimum", () => {
    expect(links().length).toBeGreaterThan(10);
    for (const link of links()) expect(classesOf(link)).toContain("min-h-8");
  });

  it("marks the current page quietly, with weight and a marker, not a filled pill", () => {
    const current = links().find((tag) => /aria-current="page"/.test(tag))!;
    const classes = classesOf(current);
    expect(
      classes.filter((name) => /bg-primary|rounded-full|text-primary-foreground/.test(name)),
    ).toEqual([]);
    // Not colour alone: a heavier weight and an inset marker on the leading edge.
    expect(classes).toContain("aria-[current=page]:font-semibold");
    expect(classes.some((name) => name.startsWith("aria-[current=page]:shadow-[inset_"))).toBe(
      true,
    );
    // Forced colours drop backgrounds and shadows, so the current page is underlined there.
    expect(classes).toContain("forced-colors:aria-[current=page]:underline");
  });
});

describe("docs content column", () => {
  it("centres the content at a readable width with docs body type", () => {
    const main = classesOf(first(docs, /<main[^>]*>/));
    expect(main).toContain("mx-auto");
    const width = main
      .map((name) => /^max-w-\[(\d+(?:\.\d+)?)rem\]$/.exec(name)?.[1])
      .find(Boolean);
    expect(Number(width)).toBeGreaterThanOrEqual(40);
    expect(Number(width)).toBeLessThanOrEqual(48);
    expect(main).toContain("sm:text-[0.9375rem]");
  });

  it("tightens API table cells on small screens so the table fits 320px", () => {
    const cells = [...docs.matchAll(/<t[hd][^>]*class="([^"]*)"/g)].map(([, value]) => value!);
    expect(cells.length).toBeGreaterThan(4);
    for (const value of cells)
      expect(value.split(/\s+/)).toEqual(expect.arrayContaining(["px-2", "sm:px-4"]));
  });
});
