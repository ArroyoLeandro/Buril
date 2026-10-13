// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import IndexPage from "../../src/pages/index.astro";
import SpanishIndexPage from "../../src/pages/es/index.astro";
import ButtonPage from "../../src/pages/docs/components/button.astro";
import Icon from "../../src/components/icons/Icon.astro";
import { iconNames, type IconName } from "../../src/components/icons/icons";
import {
  packageManagerLogos,
  type PackageManager,
} from "../../src/components/icons/package-managers";

/**
 * The docs site's own stroke icons: one module under `src/components/icons/`, drawn on a 24 grid
 * with a 2px stroke in `currentColor`, always decorative. The shell uses them instead of inline
 * copies, and the registry never ships them.
 */
let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const render = (page: AstroComponentFactory, path: string) =>
  container.renderToString(page, { request: new Request(`http://localhost${path}`) });
const renderIcon = (name: IconName) => container.renderToString(Icon, { props: { name } });
const header = (html: string) => /<header[\s\S]*?<\/header>/.exec(html)![0];
const svgTags = (html: string) => [...html.matchAll(/<svg[^>]*>/g)].map(([tag]) => tag);
const iconsIn = (html: string) =>
  [...html.matchAll(/<svg[^>]*data-icon="([\w-]+)"/g)].map(([, name]) => name);

const root = resolve(__dirname, "../..");
const filesUnder = (dir: string) =>
  readdirSync(join(root, dir), { recursive: true, encoding: "utf8" }).map((file) =>
    join(root, dir, file),
  );

describe("site icon set", () => {
  it("covers the shell, the copy button, the arrows, the callouts and the showcase", () => {
    expect(iconNames).toEqual(
      expect.arrayContaining([
        "sun",
        "moon",
        "monitor",
        "globe",
        "menu",
        "copy",
        "check",
        "arrow-right",
        "info",
        "warning",
        "error",
        "close",
        "plus",
        "refresh",
        "trash",
        "bell",
        "send",
        "arrow-up",
        "heart",
        "external",
        "chevron-down",
        "code",
        "mail",
        "cookie",
      ]),
    );
  });

  it.each(iconNames)(
    "draws %s on the 24 grid with a 2px currentColor stroke, hidden",
    async (name) => {
      const html = await renderIcon(name);
      const [svg] = svgTags(html);
      expect(svg).toContain(`data-icon="${name}"`);
      expect(svg).toContain('viewBox="0 0 24 24"');
      expect(svg).toContain('fill="none"');
      expect(svg).toContain('stroke="currentColor"');
      expect(svg).toContain('stroke-width="2"');
      expect(svg).toContain('stroke-linecap="round"');
      expect(svg).toContain('stroke-linejoin="round"');
      expect(svg).toContain('aria-hidden="true"');
      expect(svg).toContain('focusable="false"');
      // It draws something, and never a hard-coded color.
      expect(html).toMatch(/<(path|circle|rect)\b/);
      expect(html).not.toMatch(/#[0-9a-f]{3,6}\b/i);
    },
  );

  it("marks the wiggle lid of the trash icon", async () => {
    expect(await renderIcon("trash")).toMatch(/<g[^>]*data-lid[^>]*>\s*<path/);
  });

  it("is site-only: nothing in the registry imports it or lists it", () => {
    const registryFiles = filesUnder("registry").filter((file) => /\.(tsx?|css)$/.test(file));
    for (const file of registryFiles) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/components\/icons/);
    }
    expect(readFileSync(join(root, "registry.json"), "utf8")).not.toMatch(/components\/icons/);
  });
});

describe.each([
  ["en", ButtonPage, "/docs/components/button"],
  ["es", ButtonPage, "/es/docs/components/button"],
] as const)("%s header icons", (_, page, path) => {
  it("uses the site icons for the theme, the language and the menu", async () => {
    const html = header(await render(page, path));
    const cycle = /<button[^>]*data-theme-cycle[\s\S]*?<\/button>/.exec(html)![0];
    expect(iconsIn(cycle)).toEqual(["sun", "moon", "monitor"]);
    const switcher = /<a[^>]*data-language-switcher[\s\S]*?<\/a>/.exec(html)![0];
    expect(iconsIn(switcher)).toEqual(["globe"]);
    const menu = /<button[^>]*data-site-nav-toggle[\s\S]*?<\/button>/.exec(html)![0];
    expect(iconsIn(menu)).toEqual(["menu"]);
  });

  it("draws no inline icon of its own: every svg is a site icon or a logo", async () => {
    const html = header(await render(page, path));
    for (const tag of svgTags(html)) expect(tag).toMatch(/data-(icon|logo)=/);
  });
});

describe.each([
  ["en", IndexPage, "/"],
  ["es", SpanishIndexPage, "/es/"],
] as const)("%s landing icons", (_, page, path) => {
  it("shows a copy icon that turns into a check on every Copy button", async () => {
    const html = await render(page, path);
    const copies = [...html.matchAll(/<button[^>]*data-copy=[\s\S]*?<\/button>/g)].map(
      ([button]) => button,
    );
    expect(copies.length).toBeGreaterThan(0);
    for (const button of copies) {
      expect(iconsIn(button)).toEqual(["copy", "check"]);
      // The check shows only while the button carries `data-copy-done`.
      const check = /<svg[^>]*data-icon="check"[^>]*>/.exec(button)![0];
      expect(check).toMatch(/class="[^"]*\bhidden\b[^"]*\bin-data-copy-done:inline\b/);
      const copy = /<svg[^>]*data-icon="copy"[^>]*>/.exec(button)![0];
      expect(copy).toMatch(/class="[^"]*\bin-data-copy-done:hidden\b/);
    }
  });

  it("points the primary call to action forward with the arrow", async () => {
    const html = await render(page, path);
    const cta = /<a[^>]*href="(?:\/es)?\/docs"[^>]*>[\s\S]*?<\/a>/.exec(
      html.slice(html.indexOf("<main")),
    )![0];
    expect(iconsIn(cta)).toEqual(["arrow-right"]);
  });
});

describe.each([
  ["en", IndexPage, "/"],
  ["es", SpanishIndexPage, "/es/"],
  ["en", ButtonPage, "/docs/components/button"],
] as const)("%s install tab logos on %s", (_, page, path) => {
  it("shows each package manager's logo, monochrome and hidden, before its name", async () => {
    const html = await render(page, path);
    const tabs = [
      ...html.matchAll(/<button[^>]*role="tab"[^>]*id="[^"]*-tab-(\w+)"[\s\S]*?<\/button>/g),
    ].filter(([, name]) => name in packageManagerLogos);
    expect(tabs.map(([, name]) => name)).toEqual(
      expect.arrayContaining(["npm", "pnpm", "yarn", "bun"]),
    );
    for (const [tab, name] of tabs) {
      const svg = /<svg[^>]*>/.exec(tab)![0];
      expect(svg).toContain(`data-logo="${name}"`);
      expect(svg).toContain('viewBox="0 0 24 24"');
      expect(svg).toContain('fill="currentColor"');
      expect(svg).toContain('aria-hidden="true"');
      expect(svg).toContain('focusable="false"');
      expect(tab).toContain(`d="${packageManagerLogos[name as PackageManager]}"`);
      // The visible name stays and is the tab's whole accessible name.
      expect(tab.replace(/<[^>]+>/g, "").trim()).toBe(name);
    }
  });
});

describe("package manager logo source", () => {
  it("records the Simple Icons version and its licence next to the paths", () => {
    const source = readFileSync(join(root, "src/components/icons/package-managers.ts"), "utf8");
    expect(source).toContain("simple-icons@13.21.0");
    expect(source).toContain("CC0-1.0");
    expect(source).toMatch(/icons\/\{npm,pnpm,yarn,bun\}\.svg/);
    for (const d of Object.values(packageManagerLogos)) expect(d).toMatch(/^M[\d.\s\w,-]+z?$/i);
  });
});
