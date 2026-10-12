// @vitest-environment node
import { describe, expect, it } from "vitest";

import { componentDocs } from "../../src/data/component-docs";
import * as snippets from "../../src/data/snippets";

/**
 * The code samples readers copy from the docs, checked as source text: patterns that would
 * render wrong or announce nothing when pasted into an app.
 */

/** Every snippet string, by a readable name such as `componentExamples.alert.insertExample`. */
function allSnippets(): [string, string][] {
  const walk = (value: unknown, path: string): [string, string][] => {
    if (typeof value === "string") return [[path, value]];
    if (value && typeof value === "object")
      return Object.entries(value).flatMap(([key, inner]) =>
        walk(inner, path ? `${path}.${key}` : key),
      );
    return [];
  };
  return walk(snippets, "");
}

describe("docs snippets", () => {
  it("finds the snippets", () => {
    expect(allSnippets().length).toBeGreaterThan(20);
  });

  // An Alert whose children are all conditional renders an empty bordered box with its icon until
  // the condition is true. Insert the whole Alert into a region that is already on the page.
  it.each(allSnippets())(
    "%s never renders an Alert whose only content is conditional",
    (_, code) => {
      expect(code).not.toMatch(/<Alert\b[^>]*>\s*\{[^}]*&&/);
    },
  );

  it("inserts the urgent error Alert into an empty role=alert region already on the page", () => {
    const { assertiveExample } = snippets.componentExamples.alert;
    expect(assertiveExample).toMatch(
      /<div role="alert">\s*\{\w+ && \(\s*<Alert variant="destructive">/,
    );
  });
});

/** JSX snippets: the samples that render components, including each page's usage snippet. */
const jsxSnippets: [string, string][] = [
  ...allSnippets(),
  ...Object.entries(componentDocs).map(
    ([slug, docs]) => [`componentDocs.${slug}.usage`, docs.usage] as [string, string],
  ),
].filter(([, code]) => /<[A-Z]\w*[\s/>]/.test(code));

// Your own components, which a sample uses to stand for the rest of your app.
const yourComponents = new Set(["Profile", "CommentList"]);

describe("copyable snippets", () => {
  it("finds the JSX snippets", () => {
    expect(jsxSnippets.length).toBeGreaterThan(30);
  });

  it.each(jsxSnippets)("%s imports every component, icon and helper it uses", (_, code) => {
    const imported = new Set(
      [...code.matchAll(/import\s*\{([^}]*)\}\s*from/g)].flatMap(([, names]) =>
        names!
          .split(",")
          .map((name) =>
            name
              .trim()
              .replace(/^type\s+/, "")
              .split(/\s+as\s+/)
              .pop()!,
          )
          .filter(Boolean),
      ),
    );
    for (const [, name] of code.matchAll(/import\s+(\w+)\s+from/g)) imported.add(name!);
    const used = new Set([
      // A tag, not a TypeScript type argument such as `querySelector<HTMLSelectElement>`.
      ...[...code.matchAll(/(?<![\w.])<([A-Z]\w*)/g)].map(([, name]) => name!),
      ...[...code.matchAll(/\b(\w+Variants)\(/g)].map(([, name]) => name!),
    ]);
    const missing = [...used].filter((name) => !imported.has(name) && !yourComponents.has(name));
    expect(missing).toEqual([]);
  });

  it.each(jsxSnippets)("%s points aria-describedby only at ids it renders", (_, code) => {
    for (const [, ids] of code.matchAll(/aria-describedby="([^"]+)"/g))
      for (const id of ids!.split(/\s+/)) expect(code, id).toContain(`id="${id}"`);
  });
});

/** WCAG contrast of two `#rrggbb` colors. */
function contrast(a: string, b: string) {
  const luminance = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
    const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear(r!) + 0.7152 * linear(g!) + 0.0722 * linear(bl!);
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}

describe("the brand color override", () => {
  // The Buril theme's background and foreground in each scheme, which the snippet keeps.
  const schemes = {
    ":root": { background: "#f4efe6", foreground: "#1a1714" },
    ".dark": { background: "#161310", foreground: "#ede6da" },
    ":root:not(.light)": { background: "#161310", foreground: "#ede6da" },
  };
  const block = (selector: string) => {
    const start = snippets.overrideRedExample.indexOf(`${selector} {`);
    expect(start, selector).toBeGreaterThanOrEqual(0);
    const body = snippets.overrideRedExample.slice(
      start,
      snippets.overrideRedExample.indexOf("}", start),
    );
    return Object.fromEntries(
      [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value!.trim()]),
    );
  };

  it.each(Object.entries(schemes))(
    "keeps hover text and focus readable in %s",
    (selector, theme) => {
      const tokens = block(selector);
      const resolve = (value: string) => (value === "var(--foreground)" ? theme.foreground : value);
      for (const name of ["--decor", "--ring", "--accent", "--accent-foreground"])
        expect(tokens[name], name).toBeDefined();
      expect(
        contrast(resolve(tokens["--accent-foreground"]!), tokens["--accent"]!),
      ).toBeGreaterThanOrEqual(4.5);
      expect(contrast(tokens["--ring"]!, tokens["--accent"]!)).toBeGreaterThanOrEqual(3);
      expect(contrast(tokens["--ring"]!, theme.background)).toBeGreaterThanOrEqual(3);
    },
  );
});
