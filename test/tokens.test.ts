import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The CSS file is the single source of truth for the palette. This test parses it,
 * resolves var() references and color-mix(), and checks the WCAG contrast pairs
 * from decision 016.
 */
const css = readFileSync(resolve(__dirname, "../registry/styles/buril.css"), "utf8");

type Rgb = [number, number, number];
type Tokens = Record<string, string>;

function declarations(body: string): Tokens {
  const out: Tokens = {};
  for (const match of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out[match[1]!] = match[2]!.trim();
  }
  return out;
}

/** Body of the first rule whose selector matches, balancing braces. */
function ruleBody(source: string, selector: RegExp): string {
  const found = selector.exec(source);
  if (!found) throw new Error(`Selector not found: ${selector}`);
  let depth = 1;
  let i = found.index + found[0].length;
  const start = i;
  for (; i < source.length && depth > 0; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}") depth--;
  }
  return source.slice(start, i - 1);
}

const light = declarations(ruleBody(css, /^:root\s*\{/m));
const dark = declarations(ruleBody(css, /^\.dark\s*\{/m));
const systemDark = declarations(
  ruleBody(ruleBody(css, /@media \(prefers-color-scheme: dark\)\s*\{/), /:root:not\(\.light\)\s*\{/),
);

const hexToRgb = (hex: string): Rgb => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as Rgb;
};

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function toOklab([r, g, b]: Rgb): Rgb {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromOklab([L, a, b]: Rgb): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => toSrgb(Math.min(1, Math.max(0, c)))) as Rgb;
}

function resolveColor(tokens: Tokens, name: string): Rgb {
  const value = tokens[name];
  if (value === undefined) throw new Error(`Missing token ${name}`);
  const ref = /^var\((--[\w-]+)\)$/.exec(value);
  if (ref) return resolveColor(tokens, ref[1]!);
  if (value.startsWith("#")) return hexToRgb(value);
  const mix = /^color-mix\(in oklab,\s*(#[0-9a-fA-F]{6})\s+(\d+)%,\s*(#[0-9a-fA-F]{6})\)$/.exec(value);
  if (mix) {
    const weight = Number(mix[2]) / 100;
    const a = toOklab(hexToRgb(mix[1]!));
    const b = toOklab(hexToRgb(mix[3]!));
    return fromOklab(a.map((v, i) => v * weight + b[i]! * (1 - weight)) as Rgb);
  }
  throw new Error(`Cannot resolve ${name}: ${value}`);
}

const luminance = ([r, g, b]: Rgb) => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

function contrast(a: Rgb, b: Rgb) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const ratio = (tokens: Tokens, fg: string, bg: string) =>
  contrast(resolveColor(tokens, `--buril-${fg}`), resolveColor(tokens, `--buril-${bg}`));

// [foreground token, background token, minimum ratio, expected ratio (2 decimals)]
const pairs = {
  light: [
    ["fg", "bg", 4.5, 15.58],
    ["muted", "bg", 4.5, 7.52],
    ["accent", "bg", 3, 4.34],
    ["accent-strong", "bg", 4.5, 5.14],
    ["accent-strong-fg", "accent-strong", 4.5, 5.89],
  ],
  dark: [
    ["fg", "bg", 4.5, 14.92],
    ["muted", "bg", 4.5, 8.33],
    ["accent", "bg", 3, 3.72],
    ["accent-strong", "bg", 4.5, 6.02],
    ["accent-strong-fg", "accent-strong", 4.5, 6.02],
  ],
} as const;

describe.each([
  ["light", light],
  ["dark", dark],
] as const)("%s palette contrast (WCAG 2.2 AA)", (mode, tokens) => {
  it.each(pairs[mode])("%s on %s meets %s:1 (expected about %s)", (fg, bg, min, expected) => {
    const actual = ratio({ ...light, ...tokens }, fg, bg);
    expect(actual).toBeGreaterThanOrEqual(min);
    expect(actual).toBeCloseTo(expected, 1);
  });

  it("focus indicator meets 3:1 against the background", () => {
    expect(ratio({ ...light, ...tokens }, "focus", "bg")).toBeGreaterThanOrEqual(3);
  });
});

describe("dark mechanism", () => {
  it("system fallback declares exactly the same tokens as .dark", () => {
    expect(systemDark).toEqual(dark);
  });

  it("does not use data-theme", () => {
    expect(css).not.toContain("data-theme");
  });

  it("exposes semantic font tokens", () => {
    expect(css).toMatch(/--font-display:/);
    expect(css).toMatch(/--font-body:/);
  });
});
