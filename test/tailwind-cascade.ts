import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { compile } from "tailwindcss";

/**
 * jsdom runs without CSS, so class assertions cannot see how Tailwind orders the generated
 * rules. This helper compiles the real stylesheet with Tailwind and resolves the cascade the way a
 * browser would for an element that carries the classes, including a raw element where no `cn()`
 * removes conflicting classes. Style tests run it in the node environment.
 */
const tailwindDir = resolve(dirname(createRequire(import.meta.url).resolve("tailwindcss")), "..");
const burilCss = readFileSync(resolve(__dirname, "../registry/styles/buril.css"), "utf8");

async function loadStylesheet(id: string, base: string) {
  const path = id === "tailwindcss" ? join(tailwindDir, "index.css") : resolve(base, id);
  return { path, base: dirname(path), content: readFileSync(path, "utf8") };
}

type Node = { prelude: string; declarations: [string, string][]; children: Node[] };

/** Parse a CSS block into nested rules. Enough for Tailwind output; not a general parser. */
function parse(css: string): Node[] {
  const root: Node = { prelude: "", declarations: [], children: [] };
  const stack = [root];
  let buffer = "";
  for (const char of css) {
    const current = stack[stack.length - 1]!;
    if (char === "{") {
      const node: Node = { prelude: buffer.trim(), declarations: [], children: [] };
      current.children.push(node);
      stack.push(node);
      buffer = "";
    } else if (char === "}") {
      addDeclaration(current, buffer);
      stack.pop();
      buffer = "";
    } else if (char === ";") {
      addDeclaration(current, buffer);
      buffer = "";
    } else {
      buffer += char;
    }
  }
  return root.children;
}

function addDeclaration(node: Node, text: string) {
  const colon = text.indexOf(":");
  if (colon > 0 && !text.trim().startsWith("@")) {
    node.declarations.push([text.slice(0, colon).trim(), text.slice(colon + 1).trim()]);
  }
}

const escape = (name: string) => `.${name.replace(/[:/[\].*='(),&>%+#@]/g, "\\$&")}`;

export interface CascadeOptions {
  /** Also apply rules inside `@media (forced-colors: active)`. */
  forcedColors?: boolean;
  /** Pseudo-classes the element matches, such as `[":focus", ":focus-visible"]`. */
  states?: string[];
  /**
   * Other media queries that match, such as `["(prefers-reduced-motion: no-preference)"]`.
   * Spacing does not matter, and `not (prefers-reduced-motion: reduce)` is the same query as
   * `(prefers-reduced-motion: no-preference)`.
   */
  media?: string[];
  /** `@supports` conditions that hold, such as `["(overlay: auto)"]` or `["not (width: 1cqw)"]`. */
  supports?: string[];
  /**
   * Resolve the starting style instead: rules in `@starting-style` apply on top of the others, as
   * when the browser starts a transition for an element that was just inserted.
   */
  startingStyle?: boolean;
}

/** Spacing in a condition is not significant, so `(a: b)` and `(a:b)` compare equal. */
const normalize = (condition: string) => condition.replace(/\s+/g, "");

/** Queries that a browser evaluates the same way. */
const equivalentMedia = [
  ["(prefers-reduced-motion: no-preference)", "not (prefers-reduced-motion: reduce)"],
].map((group) => group.map(normalize));

function matchingMedia(media: string[]) {
  const matching = new Set(media.map(normalize));
  for (const group of equivalentMedia) {
    if (group.some((query) => matching.has(query))) group.forEach((query) => matching.add(query));
  }
  return matching;
}

export async function createCascade() {
  const compiler = await compile(`@import "tailwindcss";\n${burilCss}`, {
    base: __dirname,
    loadStylesheet,
  });
  const build = (candidates: string[]) => compiler.build(candidates);

  /**
   * Winning value of a property on an element with these classes. Variant rules come after the
   * plain utilities in Tailwind's output, so the last matching declaration wins.
   */
  function computed(classes: string[], property: string, options: CascadeOptions = {}) {
    return lastOf(classes, [property], options)?.value;
  }

  /**
   * The last declaration among several properties, such as `padding` and `padding-inline`, so a
   * shorthand that comes later in the output is seen to override a longhand.
   */
  function lastOf(
    classes: string[],
    properties: string[],
    {
      forcedColors = false,
      states = [],
      media = [],
      supports = [],
      startingStyle = false,
    }: CascadeOptions = {},
  ) {
    const selectors = new Set(
      classes.flatMap((name) => [escape(name), ...states.map((state) => escape(name) + state)]),
    );
    const mediaThatMatch = matchingMedia(media);
    const supportsThatHold = new Set(supports.map(normalize));
    /** Whether the rules inside an at-rule apply, so `visit` goes into it. */
    const applies = (prelude: string) => {
      if (prelude === "@starting-style") return startingStyle;
      if (prelude.startsWith("@supports ")) {
        return supportsThatHold.has(normalize(prelude.slice("@supports ".length)));
      }
      if (prelude === "@media (forced-colors: active)") return forcedColors;
      // Tailwind only applies hover: on devices that can hover.
      if (prelude === "@media (hover: hover)") return states.includes(":hover");
      if (prelude.startsWith("@media ")) {
        return mediaThatMatch.has(normalize(prelude.slice("@media ".length)));
      }
      return false;
    };
    const layer = parse(build(classes)).find((node) => node.prelude === "@layer utilities");
    if (!layer) throw new Error("No utilities layer in the generated CSS");
    let winner: { property: string; value: string } | undefined;
    // Depth first in source order, so at-rules nested at any depth keep their place in the
    // cascade. Starting styles come last in Tailwind's output, so they win when they apply.
    const visit = (nodes: Node[]) => {
      for (const node of nodes) {
        if (node.prelude.startsWith("@")) {
          if (applies(node.prelude)) visit(node.children);
          continue;
        }
        if (!selectors.has(node.prelude)) continue;
        for (const [name, declared] of node.declarations) {
          if (properties.includes(name)) winner = { property: name, value: declared };
        }
      }
    };
    visit(layer.children);
    return winner;
  }

  return { build, computed, lastOf };
}

/** Split a class string from a cva() call into the candidates Tailwind compiles. */
export const classList = (classes: string) => classes.split(/\s+/).filter(Boolean);
