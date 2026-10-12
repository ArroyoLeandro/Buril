import { expect } from "vitest";

import type { CascadeOptions } from "./tailwind-cascade";

/**
 * Shared motion assertions for the compiled-style tests. Components reference the motion tokens
 * with their literal fallbacks, so the compiled values are these exact `var()` expressions.
 */
export const durations = {
  instant: "var(--buril-duration-instant,80ms)",
  fast: "var(--buril-duration-fast,120ms)",
  base: "var(--buril-duration-base,180ms)",
  slow: "var(--buril-duration-slow,240ms)",
  slower: "var(--buril-duration-slower,320ms)",
};

export const easings = {
  out: "var(--buril-ease-out,cubic-bezier(0.2,0,0,1))",
  in: "var(--buril-ease-in,cubic-bezier(0.4,0,1,1))",
  inOut: "var(--buril-ease-in-out,cubic-bezier(0.4,0,0.2,1))",
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
