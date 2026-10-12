import { describe, expect, it } from "vitest";

import { defaultLocale, getLocale, locales, ui, translator } from "./ui";

const placeholders = (value: string) => [...value.matchAll(/\{(\w+)\}/g)].map(([, name]) => name);

describe("UI dictionary", () => {
  it("has English as the default and Spanish as the second locale", () => {
    expect(locales).toEqual(["en", "es"]);
    expect(defaultLocale).toBe("en");
  });

  it("defines every key in both languages", () => {
    expect(Object.keys(ui.es).sort()).toEqual(Object.keys(ui.en).sort());
  });

  it.each(locales)("has no empty %s strings", (locale) => {
    for (const [key, value] of Object.entries(ui[locale])) {
      expect(value.trim(), `${locale}: ${key}`).not.toBe("");
    }
  });

  it("uses the same placeholders in both languages", () => {
    for (const [key, value] of Object.entries(ui.en)) {
      const spanish = ui.es[key as keyof typeof ui.es];
      expect(placeholders(spanish).sort(), key).toEqual(placeholders(value).sort());
    }
  });
});

describe("getLocale", () => {
  it.each([
    ["/", "en"],
    ["/docs", "en"],
    ["/docs/components/button", "en"],
    ["/es", "es"],
    ["/es/", "es"],
    ["/es/docs/theming", "es"],
    ["/espresso", "en"],
  ])("reads %s as %s", (path, locale) => {
    expect(getLocale(path)).toBe(locale);
    expect(getLocale(new URL(path, "http://localhost"))).toBe(locale);
  });
});

describe("translator", () => {
  it("returns the string for the locale", () => {
    expect(translator("en")("theme.light")).toBe("Light");
    expect(translator("es")("theme.light")).toBe("Claro");
  });

  it("fills placeholders", () => {
    expect(translator("en")("install.copyLabel", { name: "pnpm" })).toBe("Copy pnpm command");
    expect(translator("es")("install.copyLabel", { name: "pnpm" })).toBe(
      "Copiar el comando de pnpm",
    );
  });
});
