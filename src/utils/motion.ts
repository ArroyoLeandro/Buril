import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The global reduced-motion rule an app can paste, read from rule 10 of COMPONENTS.md, so the docs
 * and the rules always show the same snippet. Returned unindented, as it would be pasted.
 */
export function reducedMotionSnippet() {
  const rules = readFileSync(resolve("COMPONENTS.md"), "utf8");
  const block = /```css\n([\s\S]*?prefers-reduced-motion[\s\S]*?)\n\s*```/.exec(rules)?.[1];
  if (block === undefined) throw new Error("No reduced-motion snippet in COMPONENTS.md");
  const lines = block.split("\n");
  const indent = Math.min(
    ...lines.filter((line) => line.trim()).map((line) => /^ */.exec(line)![0].length),
  );
  return lines.map((line) => line.slice(indent)).join("\n");
}
