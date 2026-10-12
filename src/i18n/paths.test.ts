import { describe, expect, it } from "vitest";

import {
  alternates,
  localizedHref,
  localizePath,
  pageRoutes,
  routeOf,
  unlocalizePath,
} from "./paths";

describe("localizePath", () => {
  it.each([
    ["/", "en", "/"],
    ["/docs", "en", "/docs"],
    ["/docs/components/button", "en", "/docs/components/button"],
    ["/", "es", "/es/"],
    ["/docs", "es", "/es/docs"],
    ["/docs/components/button", "es", "/es/docs/components/button"],
  ] as const)("puts %s in %s at %s", (path, locale, expected) => {
    expect(localizePath(path, locale)).toBe(expected);
  });
});

describe("unlocalizePath", () => {
  it.each([
    ["/", "/"],
    ["/docs", "/docs"],
    ["/docs/", "/docs"],
    ["/es", "/"],
    ["/es/", "/"],
    ["/es/docs/theming", "/docs/theming"],
    ["/es/docs/theming/", "/docs/theming"],
    ["/espresso", "/espresso"],
  ])("reads %s as the page %s", (path, expected) => {
    expect(unlocalizePath(path)).toBe(expected);
  });
});

describe("routeOf", () => {
  it.each([
    ["../pages/index.astro", "/"],
    ["../pages/docs/index.astro", "/docs"],
    ["../pages/docs/theming.astro", "/docs/theming"],
    ["../pages/es/index.astro", "/es/"],
    ["../pages/es/docs/components/button.astro", "/es/docs/components/button"],
  ])("maps %s to %s", (file, route) => {
    expect(routeOf(file)).toBe(route);
  });
});

describe("pageRoutes", () => {
  it("lists the built pages by URL", () => {
    expect(pageRoutes).toContain("/");
    expect(pageRoutes).toContain("/docs");
    expect(pageRoutes).toContain("/docs/components/button");
  });
});

describe("alternates", () => {
  const routes = ["/", "/es/", "/docs", "/es/docs", "/docs/theming"];

  it("lists every language version of a page that exists, English first", () => {
    expect(alternates("/es/docs", routes)).toEqual([
      { locale: "en", href: "/docs" },
      { locale: "es", href: "/es/docs" },
    ]);
    expect(alternates("/", routes)).toEqual([
      { locale: "en", href: "/" },
      { locale: "es", href: "/es/" },
    ]);
  });

  it("is empty when the page has no translation yet", () => {
    expect(alternates("/docs/theming", routes)).toEqual([]);
  });
});

describe("localizedHref", () => {
  const routes = ["/", "/es/", "/docs", "/es/docs", "/docs/theming"];

  it("links the page in the reader's language when it exists", () => {
    expect(localizedHref("/docs", "es", routes)).toBe("/es/docs");
    expect(localizedHref("/", "es", routes)).toBe("/es/");
    expect(localizedHref("/docs/theming", "en", routes)).toBe("/docs/theming");
  });

  it("falls back to the English page until the translation exists", () => {
    expect(localizedHref("/docs/theming", "es", routes)).toBe("/docs/theming");
  });
});
