// @vitest-environment node
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { compile } from "tailwindcss";
import { beforeAll, describe, expect, it } from "vitest";

import { buttonVariants } from "./button";

/**
 * jsdom runs without CSS, so class assertions cannot see how Tailwind orders the generated
 * rules. These tests compile the real stylesheet with Tailwind and resolve the cascade the way a
 * browser would for an element that carries the classes. That covers a raw <a> styled with
 * `buttonVariants()`, where no `cn()` removes conflicting classes.
 */
const tailwindDir = resolve(dirname(createRequire(import.meta.url).resolve("tailwindcss")), "..");
const burilCss = readFileSync(resolve(__dirname, "../styles/buril.css"), "utf8");

async function loadStylesheet(id: string, base: string) {
  const path = id === "tailwindcss" ? join(tailwindDir, "index.css") : resolve(base, id);
  return { path, base: dirname(path), content: readFileSync(path, "utf8") };
}

let build: (candidates: string[]) => string;

beforeAll(async () => {
  const compiler = await compile(`@import "tailwindcss";\n${burilCss}`, {
    base: __dirname,
    loadStylesheet,
  });
  build = (candidates) => compiler.build(candidates);
});

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

const escape = (name: string) => `.${name.replace(/[:/[\].]/g, "\\$&")}`;

/**
 * Winning value of a property on an element with these classes. Utilities share one specificity,
 * so the last matching declaration wins. With `forcedColors`, rules inside
 * `@media (forced-colors: active)` apply too.
 */
function computed(classes: string[], property: string, { forcedColors = false } = {}) {
  const selectors = new Set(classes.map(escape));
  const layer = parse(build(classes)).find((node) => node.prelude === "@layer utilities");
  if (!layer) throw new Error("No utilities layer in the generated CSS");
  let value: string | undefined;
  const visit = (nodes: Node[]) => {
    for (const node of nodes) {
      if (node.prelude === "@media (forced-colors: active)") {
        if (forcedColors) visit(node.children);
        continue;
      }
      if (!selectors.has(node.prelude)) continue;
      for (const [name, declared] of node.declarations) if (name === property) value = declared;
    }
  };
  visit(layer.children);
  return value;
}

const classesOf = (options: Parameters<typeof buttonVariants>[0]) =>
  buttonVariants(options).split(/\s+/).filter(Boolean);

/** Unprefixed utilities that set a border color, such as `border-border`. */
const borderColorClasses = (classes: string[]) =>
  classes.filter((name) => /^border-(?!\d|[xytrblse]-|[xytrblse]$)/.test(name));

const variants = ["default", "secondary", "outline", "ghost", "link", "destructive"] as const;
const borderless = ["default", "secondary", "ghost", "link", "destructive"] as const;

describe("buttonVariants compiled with Tailwind", () => {
  it.each(variants)("the %s variant sets exactly one border color", (variant) => {
    expect(borderColorClasses(classesOf({ variant }))).toHaveLength(1);
  });

  it("outline on a raw anchor keeps a visible border", () => {
    const classes = classesOf({ variant: "outline" });
    expect(computed(classes, "border-color")).toBe("var(--border)");
    expect(computed(classes, "border-width")).toBe("1px");
  });

  it.each(borderless)(
    "the %s variant keeps a transparent 1px border so every variant has the same box",
    (variant) => {
      const classes = classesOf({ variant });
      expect(computed(classes, "border-color")).toBe("transparent");
      expect(computed(classes, "border-width")).toBe("1px");
    },
  );

  it.each(["default", "secondary", "outline", "ghost", "destructive"] as const)(
    "the %s variant shows its border as currentcolor in forced-colors mode",
    (variant) => {
      const classes = classesOf({ variant });
      expect(computed(classes, "border-color", { forcedColors: true })).toBe("currentcolor");
    },
  );

  it("the link variant stays borderless in forced-colors mode", () => {
    const classes = classesOf({ variant: "link" });
    expect(computed(classes, "border-color", { forcedColors: true })).toBe("transparent");
  });

  it.each(["sm", "default", "lg"] as const)(
    "the %s size grows with its label instead of overflowing",
    (size) => {
      const classes = classesOf({ size });
      expect(classes.some((name) => /^h-\d+$/.test(name))).toBe(false);
      expect(classes).not.toContain("whitespace-nowrap");
      expect(classes).not.toContain("shrink-0");
      expect(classes).toContain("text-center");
    },
  );

  it.each([
    ["sm", 8],
    ["default", 10],
    ["lg", 12],
  ] as const)("the %s size keeps a minimum height of %s spacing units", (size, units) => {
    const classes = classesOf({ size });
    expect(computed(classes, "min-height")).toBe(`calc(var(--spacing) * ${units})`);
    // The default spacing unit is 0.25rem, so the smallest size is 32px: above the 24px target.
    expect(units * 4).toBeGreaterThanOrEqual(24);
  });
});
