// @vitest-environment node
import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { componentDocs } from "../../src/data/component-docs";
import { documentedComponents } from "../../src/data/components";

/**
 * The API tables against the real props. The TypeScript compiler reads each registry file and
 * resolves the props parameter of every documented export, so the tables cannot drift:
 *
 * - every prop a component declares itself, in its registry file or through its `cva` variants,
 *   must have a row (`ref` and `key` are React's and are described in prose instead);
 * - every row must name a prop that exists, own or inherited from the native element;
 * - a row whose type is a list of string literals must list exactly the literals the type allows.
 */
const root = resolve(__dirname, "../..");

const program = ts.createProgram(
  [...new Set(documentedComponents.map(({ source }) => resolve(root, source)))],
  {
    strict: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2022,
    skipLibCheck: true,
    noEmit: true,
    baseUrl: root,
    paths: { "@/lib/*": ["registry/lib/*"] },
  },
);
const checker = program.getTypeChecker();

interface PropInfo {
  /** Declared by the component itself or by its variants, not inherited from React's DOM types. */
  own: boolean;
  /** The string literals the prop accepts, when it accepts only string literals. */
  literals?: string[];
}

/** The props a documented export accepts, from its first parameter's type. */
function propsOf(source: string, exportName: string): Map<string, PropInfo> {
  const file = program.getSourceFile(resolve(root, source));
  if (!file) throw new Error(`Cannot read ${source}`);
  const symbol = checker
    .getExportsOfModule(checker.getSymbolAtLocation(file)!)
    .find(({ name }) => name === exportName);
  if (!symbol) throw new Error(`${source} does not export ${exportName}`);
  const type = checker.getTypeOfSymbolAtLocation(symbol, file);
  const [signature] = type.getCallSignatures();
  const [parameter] = signature?.getParameters() ?? [];
  if (!parameter) throw new Error(`${exportName} takes no props`);
  const propsType = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(parameter, file));
  const variantsHelper = exportName.endsWith("Variants");

  const props = new Map<string, PropInfo>();
  for (const property of checker.getPropertiesOfType(propsType)) {
    const files = (property.declarations ?? []).map((node) => node.getSourceFile().fileName);
    const own = files.some(
      (name) => name.includes("/registry/") || name.includes("class-variance-authority"),
    );
    // A cva helper also takes `class` and `className`; only its variants are its API.
    if (variantsHelper && (property.name === "class" || property.name === "className")) continue;
    const propType = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(property, file));
    const members = propType.isUnion() ? propType.types : [propType];
    const literals = members.every((member) => member.isStringLiteral())
      ? members.map((member) => (member as ts.StringLiteralType).value).sort()
      : undefined;
    props.set(property.name, { own: own || variantsHelper, literals });
  }
  return props;
}

const ignored = new Set(["ref", "key"]);

const tables = documentedComponents.flatMap(({ slug, source }) =>
  componentDocs[slug]!.api.flatMap((api) =>
    api.component.split(/,\s*/).map((name) => ({
      slug,
      source,
      exportName: name.replace(/\(\)$/, ""),
      api,
    })),
  ),
);

describe("API tables against the TypeScript props", () => {
  it("covers every documented export", () => {
    expect(tables.length).toBeGreaterThan(documentedComponents.length);
  });

  // The checker itself: it tells own props from inherited ones, and reads literal unions.
  it("tells a component's own props from the native ones it inherits", () => {
    const own = (source: string, name: string) =>
      [...propsOf(source, name)]
        .filter(([, info]) => info.own)
        .map(([prop]) => prop)
        .sort();
    expect(own("registry/ui/button.tsx", "Button")).toEqual(["loading", "size", "variant"]);
    expect(own("registry/ui/button.tsx", "IconButton")).toEqual([
      "aria-label",
      "children",
      "loading",
      "motion",
      "size",
      "variant",
    ]);
    expect(own("registry/ui/separator.tsx", "Separator")).toEqual([
      "decorative",
      "orientation",
      "ref",
    ]);
    expect(own("registry/ui/input.tsx", "Input")).toEqual([]);
    const button = propsOf("registry/ui/button.tsx", "Button");
    expect(button.get("type")?.own).toBe(false);
    expect(button.get("size")?.literals).toEqual(
      ["default", "icon", "icon-lg", "icon-sm", "lg", "sm"].sort(),
    );
  });

  it.each(tables.map((table) => [`${table.slug}: ${table.exportName}`, table] as const))(
    "%s documents every own prop and no prop that does not exist",
    (_, { source, exportName, api }) => {
      const props = propsOf(source, exportName);
      const documented = api.props.map(({ name }) => name);
      const own = [...props].filter(([name, info]) => info.own && !ignored.has(name));
      expect(
        own.map(([name]) => name).filter((name) => !documented.includes(name)),
        "undocumented",
      ).toEqual([]);
      expect(
        documented.filter((name) => !props.has(name)),
        "stale",
      ).toEqual([]);
    },
  );

  it.each(tables.map((table) => [`${table.slug}: ${table.exportName}`, table] as const))(
    "%s lists exactly the string values each prop accepts",
    (_, { source, exportName, api }) => {
      const props = propsOf(source, exportName);
      for (const prop of api.props) {
        const documented = [...prop.type.matchAll(/"([^"]*)"/g)].map(([, value]) => value!);
        const onlyLiterals = prop.type.replace(/"[^"]*"|\s|\|/g, "") === "";
        if (!onlyLiterals) continue;
        expect(documented.sort(), `${exportName} ${prop.name}`).toEqual(
          props.get(prop.name)?.literals,
        );
      }
    },
  );
});
