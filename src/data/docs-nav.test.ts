import { describe, expect, it } from "vitest";

import { componentCategory, componentHref, documentedComponents } from "./components";
import type { DocumentedComponent } from "./components";
import { docsNav } from "./docs-nav";

const entry = (overrides: Partial<DocumentedComponent>): DocumentedComponent => ({
  slug: "card",
  name: "Card",
  description: "A card.",
  item: "card",
  source: "registry/ui/card.tsx",
  ...overrides,
});

describe("componentCategory", () => {
  it("uses the category an entry declares", () => {
    expect(componentCategory(entry({ slug: "card", category: "Feedback" }))).toBe("Feedback");
  });

  it("falls back to the catalog category for entries written before the field existed", () => {
    expect(componentCategory(entry({ slug: "card" }))).toBe("Content");
    expect(componentCategory(entry({ slug: "alert" }))).toBe("Feedback");
    expect(componentCategory(entry({ slug: "button" }))).toBe("Actions");
    expect(componentCategory(entry({ slug: "skip-link" }))).toBe("Navigation");
  });

  it("puts unknown slugs in Other", () => {
    expect(componentCategory(entry({ slug: "mystery" }))).toBe("Other");
  });
});

describe("docsNav", () => {
  it("starts with the Getting Started pages", () => {
    const [first] = docsNav();
    expect(first!.title).toBe("Getting Started");
    expect(first!.items.map(({ name, href }) => [name, href])).toEqual([
      ["Introduction", "/docs"],
      ["Installation", "/docs/installation"],
      ["Theming", "/docs/theming"],
      ["Accessibility", "/docs/accessibility"],
    ]);
  });

  it("groups every documented component under its catalog category, in catalog order", () => {
    const groups = docsNav().slice(1);
    expect(groups.map(({ title }) => title)).toEqual([
      "Actions",
      "Forms",
      "Content",
      "Feedback",
      "Navigation",
    ]);
    const listed = groups.flatMap(({ items }) => items.map(({ href }) => href));
    expect(listed.sort()).toEqual(
      documentedComponents.map(({ slug }) => componentHref(slug)).sort(),
    );
    const names = (title: string) =>
      groups.find((group) => group.title === title)!.items.map(({ name }) => name);
    expect(names("Actions")).toEqual(["Button", "Icon Button", "Link"]);
    expect(names("Content")).toEqual(["Card", "Badge", "Avatar", "Separator"]);
    expect(names("Feedback")).toEqual(["Alert", "Spinner", "Skeleton"]);
  });

  it("adds groups for new categories and keeps an entry's status", () => {
    const groups = docsNav("en", [
      entry({ slug: "button", name: "Button" }),
      entry({ slug: "card", name: "Card", status: "new" }),
      entry({ slug: "mystery", name: "Mystery" }),
    ]).slice(1);
    expect(groups.map(({ title }) => title)).toEqual(["Actions", "Content", "Other"]);
    expect(groups[1]!.items[0]).toMatchObject({ name: "Card", status: "new" });
    expect(groups[0]!.items[0]!.status).toBeUndefined();
  });
});
