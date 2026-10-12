import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Formatting can drop the space before inline code ("and<code>"). This guards every page source.
function astroFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return astroFiles(path);
    return path.endsWith(".astro") ? [path] : [];
  });
}

describe("prose spacing", () => {
  const files = [...astroFiles("src/pages"), ...astroFiles("src/components")];

  it.each(files)("%s keeps a space between a word and inline code", (file) => {
    const glued = readFileSync(file, "utf8").match(/\p{Ll}<code>/gu) ?? [];
    expect(glued).toEqual([]);
  });
});
