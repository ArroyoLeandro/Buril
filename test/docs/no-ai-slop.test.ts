// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The docs avoid the words and phrases that make prose read as filler: the banned words, the
 * often-empty adverbs and phrases, and their Spanish equivalents. Em dashes are rationed: none in
 * short strings (dictionaries, data, READMEs) and at most two in a page source. Code is not prose,
 * so inline code, code fences and import lines are skipped.
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

const pages = files("src/pages", [".astro"]);
const strings = [...files("src/data", [".ts"]), ...files("src/i18n", [".ts"])];
const readmes = ["README.md", "README.es.md"];

/** The prose of a source file: inline code, code fences and import lines removed. */
const prose = (file: string) =>
  readFileSync(file, "utf8")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<code[^>]*>[\s\S]*?<\/code>/g, " ")
    .replace(/`[^`\n]*`/g, " ")
    .replace(/^import .*$/gm, " ");

/** A whole-word pattern: JavaScript's `\b` does not see accented letters as part of a word. */
const word = (source: string) => new RegExp(`(?<!\\p{L})(?:${source})(?!\\p{L})`, "iu");

const english = [
  "delv(?:e|es|ed|ing)",
  "foster(?:s|ed|ing)?",
  "leverag(?:e|es|ed|ing)",
  "utili[sz](?:e|es|ed|ing)",
  "facilitat(?:e|es|ed|ing)",
  "empower(?:s|ed|ing)?",
  "streamlin(?:e|es|ed|ing)",
  "robust",
  "cutting-edge",
  "paradigm shifts?",
  "game[- ]changers?",
  "this is huge",
  "this changes everything",
  "tapestry",
  "realms?",
  "beacons?",
  "multifaceted",
  "meticulous(?:ly)?",
  "intricate(?:ly)?",
  "paramount",
  "transformative",
  "elevat(?:e|es|ed|ing)",
  "embark(?:s|ed|ing)?",
  "supercharg(?:e|es|ed|ing)",
  "harness(?:es|ed|ing)?",
  "ever-evolving",
  "simply",
  "literally",
  "honestly",
  "actually",
  "truly",
  "fundamentally",
  "importantly",
  "crucially",
  "inherently",
  "it['’]s worth noting",
  "it['’]s important to note",
  "at the end of the day",
  "when it comes to",
  "at its core",
  "in today['’]s world",
  "in the age of",
  "in the world of",
  "the reality is",
  "the truth is",
  "in terms of",
  "with regard to",
  "in order to",
  "going forward",
  "in this article",
  "let['’]s dive in",
  "here['’]s the thing",
  "let me be clear",
  "the uncomfortable truth",
  "what most people get wrong",
  "nobody tells you",
  "stands as a testament",
  "pivotal moments?",
  "plays a vital role",
  "underscores",
  "experts agree",
  "studies show",
  "widely regarded",
  "in conclusion",
];

const spanish = [
  "cabe (?:destacar|señalar|mencionar|resaltar)",
  "es importante (?:señalar|destacar|tener en cuenta|recordar)",
  "vale la pena (?:destacar|mencionar|señalar)",
  "en definitiva",
  "en resumen",
  "en conclusión",
  "en última instancia",
  "a la hora de",
  "en términos de",
  "con respecto a",
  "de cara a",
  "hoy en día",
  "en el mundo de",
  "la realidad es que",
  "la verdad es que",
  "sin lugar a dudas",
  "realmente",
  "simplemente",
  "básicamente",
  "literalmente",
  "sencillamente",
  "fundamentalmente",
  "verdaderamente",
  "honestamente",
  "de vanguardia",
  "sin fisuras",
  "cambio de paradigma",
  "potenciar",
  "empoderar",
  "robust(?:o|a|os|as)",
  "meticulos(?:o|a|os|as|amente)",
];

const banned = word([...english, ...spanish].join("|"));
const emDashes = (text: string) => text.match(/—|&mdash;|&#8212;|\\u2014/g)?.length ?? 0;

describe("no AI slop", () => {
  it("scans the pages, dictionaries, data and READMEs", () => {
    expect(pages.length).toBeGreaterThan(60);
    expect(strings.length).toBeGreaterThan(10);
  });

  it("matches whole words only", () => {
    expect(banned.test("Without them the icons simply stay still.")).toBe(true);
    expect(banned.test("los iconos simplemente se quedan quietos")).toBe(true);
    expect(banned.test("a simplyfied name")).toBe(false);
  });

  it.each([...pages, ...strings, ...readmes])("%s uses none of the banned words", (file) => {
    const found = [...prose(file).matchAll(new RegExp(banned.source, "giu"))].map(
      ([match]) => match,
    );
    expect(found).toEqual([]);
  });

  it.each([...strings, ...readmes])("%s has no em dash", (file) => {
    expect(emDashes(prose(file))).toBe(0);
  });

  it.each(pages)("%s has at most two em dashes", (file) => {
    expect(emDashes(prose(file))).toBeLessThanOrEqual(2);
  });
});
