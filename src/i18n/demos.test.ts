import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { demoHref, demoText, demoTranslator } from "./demos";

const root = resolve(__dirname, "../..");
const placeholders = (value: string) =>
  [...value.matchAll(/\{(\w+)\}/g)].map(([, name]) => name).sort();

/** Every React island on the docs site: the live demos and the landing panels. */
const islands = Object.keys(
  import.meta.glob(["../components/**/*.tsx", "!../components/**/*.test.tsx"]),
).map((path) => resolve(__dirname, path));

/** The islands that localize their text through `t()`. */
const localized = islands.filter((path) => readFileSync(path, "utf8").includes("demoTranslator"));

/** Names of people, products and languages: written the same way in every language. */
const names = new Set([
  "Ada Lovelace",
  "Grace Hopper",
  "Katherine Johnson",
  "Dorothy Vaughan",
  "Buril UI",
  "English",
  "Español",
  "Français",
]);

/** Calls whose string argument is the English text or a path, translated at run time. */
const translating = new Set(["t", "href", "demoTranslator", "demoHref"]);

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
  "requiredLabel",
  "errorPrefix",
  "newTabLabel",
]);

/**
 * Text in a component that would stay in English on Spanish pages: literal JSX text, literal text
 * props, and sentence-case strings anywhere else (state messages, option names). Text inside
 * `<code>` is a code identifier, and names are written the same way in every language.
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
  const insideOtherAttribute = (node: ts.Node): boolean => {
    for (let parent = node.parent; parent; parent = parent.parent) {
      if (ts.isJsxAttribute(parent)) return !textProps.has(parent.name.getText(file));
    }
    return false;
  };
  const translated = (node: ts.Node) =>
    ts.isCallExpression(node.parent) &&
    translating.has(node.parent.expression.getText(file)) &&
    node.parent.arguments[0] === node;
  const visit = (node: ts.Node) => {
    if (
      ts.isJsxText(node) &&
      /[A-Za-z]/.test(node.text) &&
      !insideCode(node) &&
      !names.has(node.text.trim())
    ) {
      found.push(node.text.trim());
    }
    if (
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
      /^[A-Z][a-z]/.test(node.text) &&
      !names.has(node.text) &&
      !translated(node) &&
      !ts.isImportDeclaration(node.parent) &&
      !ts.isJsxAttribute(node.parent) &&
      !ts.isLiteralTypeNode(node.parent) &&
      !insideOtherAttribute(node)
    ) {
      found.push(node.getText(file));
    }
    if (ts.isTemplateExpression(node) && /^[A-Z][a-z]/.test(node.head.text)) {
      found.push(node.getText(file));
    }
    if (
      ts.isJsxAttribute(node) &&
      textProps.has(node.name.getText(file)) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer) &&
      /[A-Za-z]/.test(node.initializer.text) &&
      !names.has(node.initializer.text)
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
      islands.flatMap((path) =>
        [...source(path).matchAll(/\bt\(\s*"((?:[^"\\]|\\.)*)"/g)].map(([, text]) =>
          JSON.parse(`"${text}"`),
        ),
      ),
    );
    expect(Object.keys(demoText).filter((text) => !used.has(text))).toEqual([]);
  });

  it("covers the landing showcase panels and the component demos", () => {
    expect(localized.map(relative)).toEqual(
      expect.arrayContaining([
        "src/components/showcase/ButtonsPanel.tsx",
        "src/components/showcase/SettingsPanel.tsx",
        "src/components/showcase/SignInPanel.tsx",
        "src/components/ButtonDemo.tsx",
        "src/components/FieldDemo.tsx",
      ]),
    );
  });

  it.each(islands.map((path) => [relative(path), path]))(
    "%s writes no user-facing text outside t()",
    (_, path) => {
      expect(untranslatedText(source(path))).toEqual([]);
    },
  );
});

// Field and Link write text of their own: the required marker, the error prefix and the new-tab
// hint. A demo that uses them passes that text through t(), so Spanish pages never show English.
describe("the library's own strings in the demos", () => {
  const tags = (code: string, name: string) =>
    [...code.matchAll(new RegExp(`<${name}\\b[^>]*?(?:/>|>)`, "gs"))].map(([tag]) => tag);

  it.each(islands.map((path) => [relative(path), path]))("%s localizes them", (_, path) => {
    const code = source(path);
    for (const tag of tags(code, "Field")) {
      if (/\brequired\b/.test(tag)) expect(tag).toMatch(/requiredLabel=\{t\("\(required\)"\)\}/);
      if (/\berror=/.test(tag)) expect(tag).toMatch(/errorPrefix=\{t\("Error:"\)\}/);
    }
    for (const tag of tags(code, "Link")) {
      if (/\bexternal\b|target="_blank"/.test(tag))
        expect(tag).toMatch(/newTabLabel=\{t\("\(opens in a new tab\)"\)\}/);
    }
  });
});

describe("demoHref", () => {
  it("keeps English paths and moves Spanish ones under /es/", () => {
    expect(demoHref("en")("/docs/components/button")).toBe("/docs/components/button");
    expect(demoHref("es")("/docs/components/button")).toBe("/es/docs/components/button");
    expect(demoHref("en")("/")).toBe("/");
    expect(demoHref("es")("/")).toBe("/es/");
  });
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
