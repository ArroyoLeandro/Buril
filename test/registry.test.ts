import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Distribution contract. Installing a component must never rewrite the consumer's theme or
 * helpers, and every documented install command must work without extra registry setup.
 */
type Item = { name: string; type: string; registryDependencies?: string[] };

const registry = JSON.parse(readFileSync(resolve(__dirname, "../registry.json"), "utf8")) as {
  items: Item[];
};
const pkg = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf8")) as {
  scripts: Record<string, string>;
};

const byName = new Map(registry.items.map((item) => [item.name, item]));
const components = registry.items.filter((item) => item.type === "registry:ui");

/** Strip a `@buril/` namespace, so `@buril/theme` and `theme` resolve to the same item. */
const local = (dependency: string) => byName.get(dependency.replace(/^@buril\//, ""));

describe("registry items", () => {
  it.each(components.map((item) => [item.name, item] as const))(
    "%s does not pull in a theme or style",
    (_, item) => {
      const types = (item.registryDependencies ?? []).map((name) => local(name)?.type);
      expect(types).not.toContain("registry:theme");
      expect(types).not.toContain("registry:style");
    },
  );

  // A URL install (`shadcn add https://.../button.json`) fails with "Unknown registry" when a
  // dependency uses a namespace the consumer has not configured.
  it.each(components.map((item) => [item.name, item] as const))(
    "%s has no namespaced dependencies, so a URL install works",
    (_, item) => {
      for (const name of item.registryDependencies ?? []) expect(name).not.toMatch(/^@/);
    },
  );

  it("button uses shadcn's standard utils item instead of shipping its own", () => {
    expect(byName.get("button")?.registryDependencies).toContain("utils");
    expect(byName.has("utils")).toBe(false);
  });

  it.each([
    ["link", "registry/ui/link.tsx"],
    ["skip-link", "registry/ui/skip-link.tsx"],
    ["field", "registry/ui/field.tsx"],
    ["input", "registry/ui/input.tsx"],
    ["textarea", "registry/ui/textarea.tsx"],
    ["checkbox", "registry/ui/checkbox.tsx"],
    ["radio-group", "registry/ui/radio-group.tsx"],
    ["switch", "registry/ui/switch.tsx"],
    ["select", "registry/ui/select.tsx"],
    ["card", "registry/ui/card.tsx"],
    ["badge", "registry/ui/badge.tsx"],
  ])("%s is a standalone component that needs only utils", (name, path) => {
    const item = byName.get(name) as Item & { files?: { path: string; type: string }[] };
    expect(item?.type).toBe("registry:ui");
    expect(item?.registryDependencies).toEqual(["utils"]);
    expect(item?.files).toEqual([{ path, type: "registry:ui" }]);
  });

  it("keeps the theme as a separate item", () => {
    expect(byName.get("theme")?.type).toBe("registry:theme");
  });
});

describe("package scripts", () => {
  it("build emits the registry JSON before the site", () => {
    expect(pkg.scripts.build).toMatch(/^shadcn build && astro build$/);
  });

  it("check validates the registry", () => {
    expect(pkg.scripts.check).toContain("shadcn registry validate");
  });
});
