import ts from "typescript";

/** Modules whose imports only serve localization, so the shown source drops them. */
const localizationModules = /\/i18n\/(demos|ui)$/;
/** Helpers that build a translator or a path builder from the locale. */
const factories = new Set(["demoTranslator", "demoHref"]);
/** Calls that take the English text, or a page path, as their first argument. */
const translating = new Set(["t", "href"]);

interface Edit {
  start: number;
  end: number;
  text: string;
}

/** `{name}` placeholders filled from an object literal, as a template literal. */
function templateLiteral(text: string, values: ts.ObjectLiteralExpression, file: ts.SourceFile) {
  const expressions = new Map<string, string>();
  for (const property of values.properties) {
    if (ts.isShorthandPropertyAssignment(property)) {
      expressions.set(property.name.text, property.name.text);
    } else if (ts.isPropertyAssignment(property)) {
      expressions.set(property.name.getText(file), property.initializer.getText(file));
    }
  }
  const escaped = text.replace(/[`\\]/g, "\\$&").replace(/\$\{/g, "\\${");
  return `\`${escaped.replace(/\{(\w+)\}/g, (match, name: string) =>
    expressions.has(name) ? `\${${expressions.get(name)}}` : match,
  )}\``;
}

/** The replacement for a `t("…")` or `href("…")` call, shaped for where it sits. */
function replacement(call: ts.CallExpression, file: ts.SourceFile): Edit | undefined {
  const [first, values] = call.arguments;
  if (!first || !ts.isStringLiteral(first)) return undefined;
  const text = first.text;
  if (values && ts.isObjectLiteralExpression(values)) {
    return {
      start: call.getStart(file),
      end: call.getEnd(),
      text: templateLiteral(text, values, file),
    };
  }
  const wrapper = call.parent;
  if (ts.isJsxExpression(wrapper)) {
    // `label={t("Email")}` becomes `label="Email"`, and `{t("Save")}` as a child becomes `Save`.
    if (ts.isJsxAttribute(wrapper.parent) && !text.includes('"')) {
      return { start: wrapper.getStart(file), end: wrapper.getEnd(), text: JSON.stringify(text) };
    }
    if (
      (ts.isJsxElement(wrapper.parent) || ts.isJsxFragment(wrapper.parent)) &&
      !/[{}<>]/.test(text)
    ) {
      return { start: wrapper.getStart(file), end: wrapper.getEnd(), text };
    }
  }
  return { start: call.getStart(file), end: call.getEnd(), text: JSON.stringify(text) };
}

/** A whole statement, with its leading comments, removed. */
const removal = (node: ts.Node): Edit => ({
  start: node.getFullStart(),
  end: node.getEnd(),
  text: "",
});

/**
 * The source of a localized demo as a reader would write it, for the Code tab: every `t("…")`
 * becomes its English text, every `href("…")` its path, and the locale plumbing goes away (the
 * `locale` prop and its `Props` interface, the helpers and their imports). Code stays in English
 * on every page, so the source shown is the same in both languages.
 */
export function plainDemoSource(code: string): string {
  const file = ts.createSourceFile(
    "demo.tsx",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const edits: Edit[] = [];

  const visit = (node: ts.Node) => {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      localizationModules.test(node.moduleSpecifier.text)
    ) {
      edits.push(removal(node));
      return;
    }
    if (
      ts.isInterfaceDeclaration(node) &&
      node.name.text === "Props" &&
      node.members.every((member) => member.name?.getText(file) === "locale")
    ) {
      edits.push(removal(node));
      return;
    }
    if (
      ts.isParameter(node) &&
      ts.isObjectBindingPattern(node.name) &&
      node.name.elements.every((element) => element.name.getText(file) === "locale")
    ) {
      edits.push({ start: node.getStart(file), end: node.getEnd(), text: "" });
      return;
    }
    if (
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.every(
        ({ initializer }) =>
          initializer !== undefined &&
          ts.isCallExpression(initializer) &&
          factories.has(initializer.expression.getText(file)),
      )
    ) {
      edits.push(removal(node));
      return;
    }
    if (ts.isCallExpression(node) && translating.has(node.expression.getText(file))) {
      const edit = replacement(node, file);
      if (edit) {
        edits.push(edit);
        return;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);

  if (edits.length === 0) return code;
  let result = code;
  for (const { start, end, text } of edits.sort((a, b) => b.start - a.start)) {
    result = result.slice(0, start) + text + result.slice(end);
  }
  // Removed lines leave no run of blank lines, no blank line opening a block or the file.
  return result
    .replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, "\n\n")
    .replace(/\{\n[ \t]*\n/g, "{\n")
    .replace(/^\s+/, "");
}
