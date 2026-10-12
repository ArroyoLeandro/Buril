import { expect } from "vitest";

import type { CascadeOptions } from "./tailwind-cascade";

/**
 * Shared motion assertions for the compiled-style tests. Components reference the motion tokens
 * with their literal fallbacks, so the compiled values are these exact `var()` expressions.
 */
export const durations = {
  instant: "var(--buril-duration-instant,100ms)",
  fast: "var(--buril-duration-fast,200ms)",
  base: "var(--buril-duration-base,420ms)",
  slow: "var(--buril-duration-slow,460ms)",
  slower: "var(--buril-duration-slower,560ms)",
  gesture: "var(--buril-duration-gesture,720ms)",
};

/** The soft spring of the entry and position easings: it overshoots about 3% and settles. */
export const spring =
  "linear(0,0.045,0.153,0.29,0.434,0.569,0.688,0.787,0.865,0.925,0.967,0.996,1.014,1.024,1.028,1.028,1.026,1.022,1.018,1.014,1.011,1.007,1.005,1.003,1)";

export const easings = {
  out: `var(--buril-ease-out,${spring})`,
  in: "var(--buril-ease-in,cubic-bezier(0.4,0,1,1))",
  inOut: `var(--buril-ease-in-out,${spring})`,
  linear: "var(--buril-ease-linear,linear)",
};

/** Movement only runs when the user has not asked for reduced motion. */
export const motionAllowed = { media: ["(prefers-reduced-motion: no-preference)"] };
export const motionReduced = { media: ["(prefers-reduced-motion: reduce)"] };

type Computed = (classes: string[], property: string, options?: CascadeOptions) => unknown;

/** Split a comma-separated list, keeping the commas inside parentheses. */
export function splitList(value: string) {
  const items: string[] = [];
  let depth = 0;
  let item = "";
  for (const char of value) {
    if (char === "(") depth++;
    if (char === ")") depth--;
    if (char === "," && depth === 0) {
      items.push(item.trim());
      item = "";
    } else {
      item += char;
    }
  }
  return [...items, item.trim()];
}

/** The transition an element with these classes resolves to, as lists. */
export function transitionOf(computed: Computed, classes: string[], options?: CascadeOptions) {
  const list = (property: string) => {
    const value = computed(classes, property, options);
    return typeof value === "string" ? splitList(value) : undefined;
  };
  return {
    properties: list("transition-property"),
    durations: list("transition-duration"),
    easings: list("transition-timing-function"),
  };
}

/**
 * The focus indicator appears at once: no transition can touch the outline, so `all`, which
 * `transition` and `transition-colors` imply for it, is never allowed either.
 */
export function expectInstantFocusRing(properties: string[] | undefined) {
  for (const property of properties ?? []) {
    expect(property).not.toBe("all");
    expect(property).not.toMatch(/^outline/);
  }
}
