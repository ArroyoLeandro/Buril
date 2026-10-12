/**
 * The source of an example under `src/examples`, as a reader would write it: imports from
 * `@/components/ui/` instead of this repository's relative paths.
 */
export function exampleSource(raw: string) {
  return raw.replace(/(["'])(?:\.\.\/)+registry\/ui\//g, "$1@/components/ui/");
}
