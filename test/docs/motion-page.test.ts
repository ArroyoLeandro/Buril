// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import reactRenderer from "@astrojs/react/server.js";
import { beforeAll, describe, expect, it } from "vitest";

import MotionPage from "../../src/pages/docs/motion.astro";
import MotionPageEs from "../../src/pages/es/docs/motion.astro";
import {
  iconPresets,
  motionTokenUses,
  presetDuration,
  reducedMotionBehavior,
} from "../../src/data/motion";
import { docsNav } from "../../src/data/docs-nav";
import { localizedHref } from "../../src/i18n/paths";
import { locales } from "../../src/i18n/ui";
import { reducedMotionSnippet } from "../../src/utils/motion";
import { readMotionTokens } from "../../src/utils/tokens";

/**
 * The Motion page: the personality, the motion tokens read from buril.css, the reduced-motion
 * behavior and snippet, the IconButton presets, the interactive card and a live demo.
 */
const root = resolve(__dirname, "../..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");
const css = read("registry/styles/buril.css");
const button = read("registry/ui/button.tsx");

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
const plain = (value: string) => value.replace(/`/g, "");
const main = (html: string) => /<main[\s\S]*<\/main>/.exec(html)![0];
const tables = (html: string) =>
  [...main(html).matchAll(/<table[\s\S]*?<\/table>/g)].map(([t]) => t);
const bodyRows = (table: string) =>
  [...table.matchAll(/<tr[\s\S]*?<\/tr>/g)].slice(1).map(([row]) => text(row));
const caption = (table: string) => text(/<caption[\s\S]*?<\/caption>/.exec(table)?.[0] ?? "");

describe("readMotionTokens", () => {
  it("reads every duration and easing from :root, in order, with its value", () => {
    const tokens = readMotionTokens(css);
    expect(tokens.map(({ name }) => name)).toEqual([
      "buril-duration-instant",
      "buril-duration-fast",
      "buril-duration-base",
      "buril-duration-slow",
      "buril-duration-slower",
      "buril-duration-gesture",
      "buril-ease-out",
      "buril-ease-in",
      "buril-ease-in-out",
      "buril-ease-linear",
    ]);
    for (const { name, value } of tokens) {
      expect(css).toContain(`--${name}: ${value};`);
    }
  });
});

describe("motion data", () => {
  it("says what every motion token is for, in both languages, and nothing more", () => {
    const names = readMotionTokens(css).map(({ name }) => name);
    expect(Object.keys(motionTokenUses).sort()).toEqual([...names].sort());
    for (const use of Object.values(motionTokenUses))
      for (const locale of locales) expect(use[locale].trim()).not.toBe("");
  });

  it("covers every IconButton motion preset", () => {
    const iconMotion = /const iconMotion = \{([\s\S]*?)\n\};/.exec(button)![1]!;
    const presets = [...iconMotion.matchAll(/^ {2}"?([\w-]+)"?: \[/gm)].map(([, name]) => name);
    expect(iconPresets.map(({ preset }) => preset)).toEqual(presets);
  });

  // The page computes each gesture's duration from the tokens; the formula must be the one the
  // IconButton classes use.
  it.each(iconPresets)(
    "times $preset with the same token and factor as the IconButton",
    (preset) => {
      const nudge = /const nudge = `([^`]*)`/.exec(button)![1]!;
      const iconMotion = /const iconMotion = \{([\s\S]*?)\n\};/.exec(button)![1]!.replace(
        // The nudge presets share one class string, `nudge`: inline it.
        /\bnudge\b(?!-)/g,
        nudge,
      );
      const key = preset.preset.includes("-") ? `"${preset.preset}"` : preset.preset;
      const start = iconMotion.indexOf(`  ${key}: [`);
      // Up to the end of this preset's array, written on one line or on several.
      const classes = iconMotion.slice(start, iconMotion.indexOf("],\n", start));
      const factor = preset.factor === 1 ? String.raw`(?!\*)` : String.raw`\*${preset.factor}\)`;
      expect(classes).toMatch(
        new RegExp(
          String.raw`(?:var\(|duration-\()--buril-duration-${preset.token},\d+ms\)${factor}`,
        ),
      );
    },
  );

  it("computes the gesture durations the browser tests measure", () => {
    const tokens = readMotionTokens(css);
    const ms = Object.fromEntries(
      iconPresets.map((preset) => [preset.preset, presetDuration(preset, tokens)]),
    );
    expect(ms).toEqual({
      rotate: 420,
      spin: 840,
      wiggle: 720,
      swing: 936,
      "nudge-x": 648,
      "nudge-up": 648,
      "nudge-diagonal": 648,
      pop: 644,
    });
  });

  it("explains what reduced motion keeps and stops, in both languages", () => {
    expect(reducedMotionBehavior.length).toBeGreaterThan(8);
    for (const row of reducedMotionBehavior)
      for (const locale of locales)
        for (const value of [row.motion[locale], row.reduced[locale]])
          expect(value.trim()).not.toBe("");
  });

  it("takes the reduced-motion snippet from COMPONENTS.md", () => {
    const snippet = reducedMotionSnippet();
    expect(snippet).toMatch(/^@media \(prefers-reduced-motion: reduce\) \{/);
    expect(snippet).toContain("transition-duration: 0.01ms !important;");
    // Unindented, as it would be pasted.
    expect(snippet.split("\n").at(-1)).toBe("}");
  });
});

describe.each([
  ["en", MotionPage, "/docs/motion", "Motion"],
  ["es", MotionPageEs, "/es/docs/motion", "Movimiento"],
] as const)("%s Motion page", (locale, page, path, title) => {
  const render = () =>
    container.renderToString(page, { request: new Request(`http://localhost${path}`) });

  it("is one document with its title, in its language", async () => {
    const html = await render();
    expect(html).toMatch(new RegExp(`<html lang="${locale}"`));
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(text(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)![1]!)).toBe(title);
    expect(html).toContain(`<title>${title} | Buril UI</title>`);
  });

  it("tables every motion token with its value from buril.css and its use", async () => {
    const table = tables(await render()).find((t) => caption(t).includes("buril.css"))!;
    expect(table).toBeDefined();
    const rows = bodyRows(table);
    const tokens = readMotionTokens(css);
    expect(rows).toHaveLength(tokens.length);
    for (const [index, { name, value }] of tokens.entries()) {
      expect(rows[index]).toContain(`--${name}`);
      expect(rows[index]!.replace(/\s/g, "")).toContain(value.replace(/\s/g, ""));
      expect(rows[index]).toContain(plain(motionTokenUses[name]![locale]));
    }
  });

  it("shows what reduced motion changes, and the snippet from COMPONENTS.md", async () => {
    const html = await render();
    const table = tables(html).find((t) => bodyRows(t).length === reducedMotionBehavior.length)!;
    expect(table).toBeDefined();
    for (const [index, row] of reducedMotionBehavior.entries()) {
      expect(bodyRows(table)[index]).toContain(plain(row.reduced[locale]));
    }
    expect(text(main(html))).toContain(
      text(reducedMotionSnippet()).replace(/\s+/g, " ").slice(0, 60),
    );
  });

  it("tables the IconButton presets with their computed durations", async () => {
    const tokens = readMotionTokens(css);
    const table = tables(await render()).find((t) => bodyRows(t)[0]?.startsWith("rotate"))!;
    expect(table).toBeDefined();
    const rows = bodyRows(table);
    expect(rows).toHaveLength(iconPresets.length);
    for (const [index, preset] of iconPresets.entries()) {
      expect(rows[index]).toContain(preset.preset);
      expect(rows[index]).toContain(`${presetDuration(preset, tokens)}ms`);
    }
  });

  it("describes the interactive card's lift and shadow", async () => {
    const html = text(main(await render()));
    expect(html).toContain("interactive");
    expect(html).toContain("4.5px");
  });

  it("has a live demo with a reduced-motion simulation", async () => {
    const html = main(await render());
    expect(html).toMatch(/<astro-island[^>]*component-url="[^"]*MotionDemo/);
  });
});

describe("Motion in the sidebar", () => {
  it.each(locales)("is a Getting Started page in %s", (locale) => {
    const [gettingStarted] = docsNav(locale);
    expect(gettingStarted!.items.map(({ href }) => href)).toContain(
      localizedHref("/docs/motion", locale),
    );
  });
});
