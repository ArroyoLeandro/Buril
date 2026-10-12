import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Formatting can drop the space before inline code ("and<code>"), or put a line break, which
// renders as a space, before punctuation. This guards every page source.
function astroFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return astroFiles(path);
    return path.endsWith(".astro") ? [path] : [];
  });
}

describe("prose spacing", () => {
  const files = [
    ...astroFiles("src/pages"),
    ...astroFiles("src/components"),
    ...astroFiles("src/layouts"),
  ];

  it.each(files)("%s keeps a space between a word and inline code", (file) => {
    const glued = readFileSync(file, "utf8").match(/\p{Ll}<code[\s>]/gu) ?? [];
    expect(glued).toEqual([]);
  });

  // The opposite slip: a line break between inline code or a link and the punctuation after it
  // renders as a space, as in "button.tsx ." The punctuation must follow the closing tag.
  it.each(files)("%s puts no line break before punctuation after inline code or a link", (file) => {
    const loose =
      readFileSync(file, "utf8").match(
        /<\/(?:a|code|em|kbd|strong)>[ \t]*\r?\n[ \t]*(?:[.,;:!?]|\)(?!\s*[)}\]:]))/g,
      ) ?? [];
    expect(loose).toEqual([]);
  });

  // Short inline code never wraps, so `--radius` cannot break at its hyphens. Longer code would
  // overflow a 320px screen, so it opts in to wrapping with `data-wrap`; `InlineCode` marks it
  // by itself.
  it.each(files)("%s lets only inline code over 24 characters wrap", (file) => {
    const codes = [...readFileSync(file, "utf8").matchAll(/<code([^>]*)>([\s\S]*?)<\/code>/g)];
    for (const [, attributes, inner] of codes) {
      // A string literal counts by its text; any other expression is data, not page prose.
      const literal = /^\{"(.*)"\}$/.exec(inner!.trim())?.[1];
      if (literal === undefined && /^\s*\{/.test(inner!)) continue;
      const length =
        literal?.length ??
        inner!
          .replace(/<[^>]+>|\{" "\}/g, "")
          .replace(/&[a-z]+;|&#\d+;/g, "x")
          .replace(/\s+/g, " ")
          .trim().length;
      expect(attributes!.includes("data-wrap"), inner).toBe(length > 24);
    }
  });
});
