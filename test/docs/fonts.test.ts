// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Silkscreen loads with `display=swap`, so headings first paint in a fallback. The landing headline
 * wraps over several lines, and a fallback of a different width rewraps it when Silkscreen
 * arrives, which shifts the page. A local monospace face scaled to Silkscreen's average advance
 * keeps the wrap, so the swap changes the glyphs but not the layout.
 */
const css = readFileSync("src/styles/global.css", "utf8");

describe("the display font fallback", () => {
  it("is a local monospace face scaled to Silkscreen's width", () => {
    const face = /@font-face\s*\{[^}]*font-family:\s*"Silkscreen Fallback"[^}]*\}/.exec(css);
    expect(face, "@font-face Silkscreen Fallback").not.toBeNull();
    expect(face![0]).toMatch(/src:\s*local\("Courier New"\)/);
    // Silkscreen is 1.167 times as wide as Courier New over the same text (measured in Chromium).
    expect(face![0]).toMatch(/size-adjust:\s*116\.7%/);
    expect(face![0]).toMatch(/ascent-override:\s*88\.3%/);
    expect(face![0]).toMatch(/descent-override:\s*21\.4%/);
  });

  it("has an Inter headline fallback: local Arial Bold scaled to Inter semibold", () => {
    const face = /@font-face\s*\{[^}]*font-family:\s*"Inter Headline Fallback"[^}]*\}/.exec(css);
    expect(face, "@font-face Inter Headline Fallback").not.toBeNull();
    expect(face![0]).toMatch(/src:\s*local\("Arial Bold"\)/);
    expect(face![0]).toMatch(/font-weight:\s*600/);
    // Inter semibold is 1.013 times as wide as Arial Bold on both headlines (measured in Chromium).
    expect(face![0]).toMatch(/size-adjust:\s*101\.3%/);
    expect(face![0]).toMatch(/ascent-override:\s*95\.8%/);
    expect(face![0]).toMatch(/descent-override:\s*23\.7%/);
    expect(css).toMatch(
      /--font-headline:\s*"Inter",\s*"Inter Headline Fallback",\s*system-ui,\s*sans-serif;/,
    );
  });

  it("comes right after Silkscreen in the display font stack", () => {
    expect(css).toMatch(
      /--font-display:\s*"Silkscreen",\s*"Silkscreen Fallback",\s*ui-monospace,\s*monospace;/,
    );
  });
});
