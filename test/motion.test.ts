import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Components are standalone, so they cannot rely on the theme being installed. Every motion token
 * they use carries a literal fallback, such as `duration-(--buril-duration-fast,120ms)`, and these
 * tests keep each fallback equal to the token's value in buril.css. Without the theme a component
 * then moves exactly as it does with it.
 */
const css = readFileSync(resolve(__dirname, "../registry/styles/buril.css"), "utf8");
const uiDir = resolve(__dirname, "../registry/ui");
const components = readdirSync(uiDir)
  .filter((name) => name.endsWith(".tsx") && !name.includes(".test."))
  .map((name) => [name, readFileSync(join(uiDir, name), "utf8")] as const);

/** Spacing is not significant, and Tailwind writes a space in an arbitrary value as `_`. */
const normalize = (value: string) => value.replace(/[\s_]+/g, "");

const tokens = Object.fromEntries(
  [...css.matchAll(/(--buril-(?:duration|ease)-[\w-]+)\s*:\s*([^;]+);/g)].map((match) => [
    match[1]!,
    normalize(match[2]!),
  ]),
);

interface Reference {
  token: string;
  fallback?: string;
}

/**
 * Every reference to a motion token in a source text, with its fallback: the text after the
 * first comma, up to the parenthesis that closes the reference.
 */
function motionReferences(source: string): Reference[] {
  const references: Reference[] = [];
  for (const match of source.matchAll(/--buril-(?:duration|ease)-[\w-]*\w/g)) {
    const token = match[0];
    let index = match.index + token.length;
    if (source[index] !== ",") {
      references.push({ token });
      continue;
    }
    let depth = 0;
    let fallback = "";
    for (index += 1; index < source.length; index++) {
      const char = source[index]!;
      if (char === "(") depth++;
      if (char === ")" && depth-- === 0) break;
      fallback += char;
    }
    references.push({ token, fallback: normalize(fallback) });
  }
  return references;
}

describe("motion token references", () => {
  it("are parsed with their fallbacks, including nested parentheses", () => {
    const sample =
      "duration-(--buril-duration-fast,120ms) ease-(--buril-ease-out,cubic-bezier(0.2,0,0,1)) " +
      "[transition-duration:var(--buril-duration-base,_180ms)] duration-(--buril-duration-slow)";
    expect(motionReferences(sample)).toEqual([
      { token: "--buril-duration-fast", fallback: "120ms" },
      { token: "--buril-ease-out", fallback: "cubic-bezier(0.2,0,0,1)" },
      { token: "--buril-duration-base", fallback: "180ms" },
      { token: "--buril-duration-slow" },
    ]);
  });

  it("finds the motion tokens in buril.css", () => {
    expect(Object.keys(tokens)).toHaveLength(9);
  });

  // Until a component uses a motion token, this passes with nothing to check.
  it.each(components)("in %s name a real token and fall back to its exact value", (_, source) => {
    for (const { token, fallback } of motionReferences(source)) {
      expect(tokens, `${token} is not in buril.css`).toHaveProperty([token]);
      expect(fallback, `${token} has no literal fallback`).toBeDefined();
      expect(fallback, `${token} falls back to a different value`).toBe(tokens[token]);
    }
  });
});

/** The utility each class in the string literals of a source applies, without its variants. */
const utilitiesIn = (source: string) =>
  [...source.matchAll(/"([^"\n]*)"/g)]
    .flatMap((match) => match[1]!.split(/\s+/))
    .map((name) => name.slice(name.lastIndexOf(":") + 1));

describe("component transitions", () => {
  it("finds the utilities in a class string", () => {
    expect(utilitiesIn('cn("transition-colors motion-safe:transition", "hover:bg-x")')).toEqual([
      "transition-colors",
      "transition",
      "bg-x",
    ]);
  });

  // `transition`, `transition-all` and `transition-colors` all include outline-color, which would
  // fade the focus ring in instead of showing it at once (rule 10), and `transition-all` animates
  // layout too. Components list the properties they transition.
  it.each(components)("in %s list their properties explicitly", (_, source) => {
    const broad = utilitiesIn(source).filter((name) =>
      ["transition", "transition-all", "transition-colors"].includes(name),
    );
    expect(broad).toEqual([]);
  });

  // Layout properties repaint and reflow every frame; move with translate instead.
  it.each(components)("in %s never transition layout properties", (_, source) => {
    const transitioned = utilitiesIn(source)
      .filter((name) => name.startsWith("transition-["))
      .flatMap((name) => name.slice("transition-[".length, -1).split(","));
    for (const property of ["left", "right", "top", "bottom", "width", "height", "inset"]) {
      expect(transitioned).not.toContain(property);
    }
  });
});
