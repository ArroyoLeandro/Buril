// @vitest-environment node
import { describe, expect, it } from "vitest";

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
