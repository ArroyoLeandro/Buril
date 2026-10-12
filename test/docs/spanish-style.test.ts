// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The Spanish docs use neutral Spanish with "tú": no voseo, no regional words, and one term per
 * idea. Each pattern below is a slip an independent review found, with the wording to use instead.
 * It scans the Spanish pages and every source file that holds Spanish text.
 */
function files(dir: string, extensions: string[]): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path, extensions);
    return extensions.some((extension) => path.endsWith(extension)) && !/\.test\./.test(path)
      ? [path]
      : [];
  });
}

const sources = [
  ...files("src/pages/es", [".astro"]),
  ...files("src/data", [".ts"]),
  ...files("src/i18n", [".ts"]),
  "README.es.md",
];

/** A whole-word pattern: JavaScript's `\b` does not see accented letters as part of a word. */
const word = (source: string, flags = "iu") =>
  new RegExp(`(?<!\\p{L})(?:${source})(?!\\p{L})`, flags);

const banned: [RegExp, string][] = [
  [/responder que no es seguro/i, 'ambiguous: "puedes responder que no sin problema"'],
  [word("grillas?"), '"cuadrícula"'],
  [word("no alcanza"), '"no basta", or "no llega" for reach'],
  [word("se da vuelta|dan vuelta"), '"gira"'],
  [word("directo al?"), '"directamente"'],
  [word("librerías?"), '"biblioteca"'],
  [word("íconos?"), '"icono", without an accent'],
  [word("fundirse|se funden?"), '"desvanecerse" or "aparecer gradualmente"'],
  [word("pasa su destino"), '"sobrepasa su destino en aproximadamente un 3%"'],
  [word("globos?"), 'the browser\'s validation "burbujas"'],
  [word("Retiro", "u"), '"Recoger en tienda"'],
  [word("solo late|Late[.]", "u"), '"parpadea"'],
  [word("rebote suave"), '"resorte suave": the motion is a spring, not a bounce'],
  [word("punto del Switch"), '"indicador del Switch", the glossary term for the thumb'],
  [word("podés|tenés|querés|sabés|hacés|usá|mirá|probá|fijate|elegí|poné|tené|andá|vení"), "voseo"],
];

describe("Spanish style", () => {
  it("scans the Spanish sources", () => {
    expect(sources.length).toBeGreaterThan(30);
  });

  it.each(sources)("%s uses neutral Spanish and one term per idea", (file) => {
    const content = readFileSync(file, "utf8");
    const found = banned.flatMap(([pattern, instead]) => {
      const match = pattern.exec(content);
      return match ? [`"${match[0]}" → ${instead}`] : [];
    });
    expect(found).toEqual([]);
  });
});
