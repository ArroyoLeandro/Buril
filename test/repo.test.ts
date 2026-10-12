import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "..");
const read = (file: string) => readFileSync(join(root, file), "utf8");

/** Folders that are generated, installed or private (git-ignored). */
const skipped = new Set([
  ".git",
  "node_modules",
  "dist",
  ".astro",
  ".planning",
  "odd",
  ".atl",
  ".claude",
  "r",
]);

function publicTextFiles(dir = root): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return skipped.has(name) ? [] : publicTextFiles(path);
    return /\.(md|ts|tsx|astro|css|json|mjs|js)$/.test(name) && name !== "pnpm-lock.yaml"
      ? [relative(root, path)]
      : [];
  });
}

describe("public repository files", () => {
  it("do not cite the private decision log", () => {
    const citing = publicTextFiles().filter((file) => /\bdecisions? \d{3}\b/i.test(read(file)));
    expect(citing).toEqual([]);
  });

  it("ignore the local agent folder", () => {
    expect(read(".gitignore").split(/\r?\n/)).toContain(".atl/");
  });
});

describe("CONTRIBUTING.md", () => {
  it("exists and covers setup, scripts and tests", () => {
    expect(existsSync(join(root, "CONTRIBUTING.md"))).toBe(true);
    const doc = read("CONTRIBUTING.md");
    for (const script of ["pnpm test", "pnpm check", "pnpm lint", "pnpm build"]) {
      expect(doc).toContain(script);
    }
  });

  it("explains why TypeScript and ESLint are pinned", () => {
    const doc = read("CONTRIBUTING.md");
    expect(doc).toMatch(/TypeScript 6/);
    expect(doc).toMatch(/ESLint 9/);
    expect(doc).toMatch(/typescript-eslint/);
    expect(doc).toMatch(/eslint-plugin-react/);
  });
});

describe.each(["README.md", "README.es.md"])("%s", (file) => {
  const doc = () => read(file);

  it("is no longer marked as planning-only", () => {
    expect(doc()).not.toMatch(/early planning|No components are published yet/i);
    expect(doc()).not.toMatch(/planificación inicial|Todavía no hay componentes/i);
    expect(doc()).not.toContain("<buril-registry-url>");
  });

  it("shows the working install flow and the opt-in theme", () => {
    expect(doc()).toContain("npx shadcn@latest add https://example.com/r/button.json");
    expect(doc()).toContain(
      "npx shadcn@latest registry add @buril=https://example.com/r/{name}.json",
    );
    expect(doc()).toContain("npx shadcn@latest add @buril/button");
    expect(doc()).toContain("npx shadcn@latest add @buril/theme");
  });

  it("describes the ink primary with red reserved for focus, decoration and destructive", () => {
    expect(doc()).toMatch(file === "README.md" ? /\bink\b/i : /\btinta\b/i);
    expect(doc()).not.toMatch(/vermilion ink|tinta bermellón/i);
  });
});
