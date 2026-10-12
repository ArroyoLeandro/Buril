import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { readTokens } from "./tokens";

const css = `
:root {
  color-scheme: light;
  --buril-paper: #f4efe6;
  --buril-ink: #1a1714;
  --background: var(--buril-paper);
  --card: var(--background);
  --muted-foreground: color-mix(in oklab, var(--buril-ink) 72%, var(--buril-paper));
  --decor: var(--buril-ink);
}
.dark {
  --background: var(--buril-ink);
  --card: var(--background);
}
@media (prefers-color-scheme: dark) {
  :root:not(.light) { --background: #000000; }
}
`;

describe("readTokens", () => {
  it("lists the semantic tokens in order, without primitives or color-scheme", () => {
    expect(readTokens(css).map(({ name }) => name)).toEqual([
      "background",
      "card",
      "muted-foreground",
      "decor",
    ]);
  });

  it("resolves light and dark values to the primitive colors", () => {
    const [background, card, muted] = readTokens(css);
    expect(background).toMatchObject({ light: "#f4efe6", dark: "#1a1714" });
    expect(card).toMatchObject({ light: "#f4efe6", dark: "#1a1714" });
    expect(muted!.light).toBe("color-mix(in oklab, #1a1714 72%, #f4efe6)");
  });

  it("keeps the light value when dark mode does not redefine a token", () => {
    expect(readTokens(css).at(-1)).toMatchObject({
      name: "decor",
      light: "#1a1714",
      dark: "#1a1714",
    });
  });

  it("reads the real Buril tokens", () => {
    const real = readTokens(
      readFileSync(resolve(__dirname, "../../registry/styles/buril.css"), "utf8"),
    );
    const byName = Object.fromEntries(real.map((token) => [token.name, token]));
    expect(byName.primary).toMatchObject({ light: "#1a1714", dark: "#ede6da" });
    expect(byName.ring).toMatchObject({ light: "#c90f1a", dark: "#ff5a51" });
    expect(byName.decor).toMatchObject({ light: "#d72828", dark: "#d72828" });
    expect(real).toHaveLength(20);
  });
});
