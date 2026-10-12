/**
 * Reads the semantic tokens from a Buril-style stylesheet, so the Theming page always shows the
 * values the registry ships. Primitives (`--buril-*`) are resolved into the values they name.
 */
export interface Token {
  name: string;
  light: string;
  dark: string;
}

function block(css: string, selector: RegExp) {
  const match = selector.exec(css);
  if (!match) return [];
  const start = match.index + match[0].length;
  const body = css.slice(start, css.indexOf("}", start));
  return [...body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map(
    ([, name, value]) => [name!, value!.trim()] as const,
  );
}

export function readTokens(css: string): Token[] {
  const root = block(css, /(^|\n):root\s*\{/);
  const dark = new Map(block(css, /(^|\n)\.dark\s*\{/));
  const primitives = new Map(root.filter(([name]) => name.startsWith("buril-")));

  const resolve = (value: string, scope: Map<string, string>): string =>
    value.replace(/var\(--([\w-]+)\)/g, (whole, name: string) => {
      const next = scope.get(name) ?? primitives.get(name);
      return next === undefined ? whole : resolve(next, scope);
    });

  const lightScope = new Map(root);
  const darkScope = new Map([...root, ...dark]);
  return root
    .filter(([name]) => !name.startsWith("buril-"))
    .map(([name, value]) => ({
      name,
      light: resolve(value, lightScope),
      dark: resolve(dark.get(name) ?? value, darkScope),
    }));
}

export interface MotionToken {
  name: string;
  value: string;
}

/**
 * The motion tokens, `--buril-duration-*` and `--buril-ease-*`, with their values from `:root`, in
 * the order the stylesheet declares them, so the Motion page always shows the shipped values.
 */
export function readMotionTokens(css: string): MotionToken[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return block(withoutComments, /(^|\n):root\s*\{/)
    .filter(([name]) => /^buril-(duration|ease)-/.test(name))
    .map(([name, value]) => ({ name, value: value.replace(/\s+/g, " ") }));
}
