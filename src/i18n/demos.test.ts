import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { demoText, demoTranslator } from "./demos";

const root = resolve(__dirname, "../..");
const placeholders = (value: string) =>
  [...value.matchAll(/\{(\w+)\}/g)].map(([, name]) => name).sort();

/** Every React island the docs localize: its text goes through `t()`. */
const localized = Object.keys(
  import.meta.glob(["../components/**/*.tsx", "!../components/**/*.test.tsx"]),
)
  .map((path) => resolve(__dirname, path))
  .filter((path) => readFileSync(path, "utf8").includes("demoTranslator"));

const source = (path: string) => readFileSync(path, "utf8");

/** Props whose string value people read or hear. */
const textProps = new Set([
  "label",
  "legend",
  "description",
  "error",
  "aria-label",
  "placeholder",
  "alt",
  "title",
]);

/**
 * Literal JSX text and literal text props in a component, which would stay in English on Spanish
 * pages. Text inside `<code>` is a code identifier and stays as written.
 */
function untranslatedText(code: string) {
  const file = ts.createSourceFile(
    "demo.tsx",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const found: string[] = [];
  const insideCode = (node: ts.Node) =>
    ts.isJsxElement(node.parent) && node.parent.openingElement.tagName.getText(file) === "code";
  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node) && /[A-Za-z]/.test(node.text) && !insideCode(node)) {
      found.push(node.text.trim());
    }
    if (
      ts.isJsxAttribute(node) &&
      textProps.has(node.name.getText(file)) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer) &&
      /[A-Za-z]/.test(node.initializer.text)
    ) {
      found.push(node.getText(file));
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
}
const relative = (path: string) => path.slice(root.length + 1).replace(/\\/g, "/");

describe("demo text dictionary", () => {
  it("has a non-empty Spanish string for every English one, with the same placeholders", () => {
    for (const [english, spanish] of Object.entries(demoText)) {
      expect(spanish.trim(), english).not.toBe("");
      expect(placeholders(spanish), english).toEqual(placeholders(english));
    }
  });

  it("keeps only strings that a demo still uses", () => {
    const used = new Set(
      localized.flatMap((path) =>
        [...source(path).matchAll(/\bt\(\s*"((?:[^"\\]|\\.)*)"/g)].map(([, text]) =>
          JSON.parse(`"${text}"`),
        ),
      ),
    );
    expect(Object.keys(demoText).filter((text) => !used.has(text))).toEqual([]);
  });

  it("covers the landing showcase panels", () => {
    expect(localized.map(relative)).toEqual(
      expect.arrayContaining([
        "src/components/showcase/ButtonsPanel.tsx",
        "src/components/showcase/SettingsPanel.tsx",
        "src/components/showcase/SignInPanel.tsx",
      ]),
    );
  });

  it.each(localized.map((path) => [relative(path), path]))(
    "%s writes no user-facing text outside t()",
    (_, path) => {
      expect(untranslatedText(source(path))).toEqual([]);
    },
  );
});

describe("demoTranslator", () => {
  it("returns the English text as written and the Spanish one from the dictionary", () => {
    expect(demoTranslator("en")("Sign in")).toBe("Sign in");
    expect(demoTranslator("es")("Sign in")).toBe("Iniciar sesión");
  });

  it("fills placeholders in both languages", () => {
    expect(demoTranslator("en")("Digest set to {value}.", { value: "daily" })).toBe(
      "Digest set to daily.",
    );
    expect(demoTranslator("es")("Digest set to {value}.", { value: "diario" })).toBe(
      "Resumen: diario.",
    );
  });
});
