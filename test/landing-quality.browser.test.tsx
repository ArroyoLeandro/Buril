import { commands } from "vitest/browser";
import { describe, expect, inject, it } from "vitest";

/**
 * Whole-page quality checks of the landing in a real browser (`test/docs-site.ts` serves the site,
 * `test/site-probe.ts` opens it): axe in both languages and themes, reduced motion, the narrowest
 * reflow width and the keyboard order through the showcase.
 */
const origin = inject("docsOrigin");
const order = ["team", "settings", "checkbox", "field", "alert", "buttons", "gestures"];

/** Scrolls until every client:visible island has hydrated. */
const hydrated = {
  until: `(window.scrollTo(0, document.body.scrollHeight), !document.querySelector("astro-island[ssr]"))`,
};

describe("axe on the landing", () => {
  it.each([
    ["/", "light", 1440],
    ["/", "dark", 1440],
    ["/es/", "light", 375],
    ["/es/", "dark", 375],
    ["/", "dark", 375],
    ["/es/", "light", 1440],
  ] as const)(
    "%s in the %s theme at %ipx has no WCAG 2.2 AA violations",
    async (path, colorScheme, width) => {
      const { result } = await commands.probePage<{ id: string; nodes: string[] }[]>(origin, path, {
        width,
        colorScheme,
        axe: true,
        steps: [hydrated],
        evaluate: `(async () => {
        window.scrollTo(0, 0);
        const { violations } = await axe.run(
          { exclude: [["astro-dev-toolbar"]] },
          { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } },
        );
        return violations.map((v) => ({ id: v.id, nodes: v.nodes.slice(0, 5).map((n) => n.target.join(" ")) }));
      })()`,
      });
      expect(result).toEqual([]);
    },
  );
});

interface Motion {
  gesture: string;
  thumb: string;
  checkmark: string;
}

/** Hovers the Reload gesture, then reads what moves: its icon, a Switch thumb and a check. */
const motion = (reducedMotion: "reduce" | "no-preference") =>
  commands.probePage<Motion>(origin, "/", {
    width: 1440,
    reducedMotion,
    steps: [
      hydrated,
      { hover: '[data-cell="gestures"] button[aria-label="Reload page"]' },
      { wait: 100 },
    ],
    evaluate: `(() => {
      const style = (selector) => getComputedStyle(document.querySelector(selector));
      return {
        gesture: style('[data-cell="gestures"] button[aria-label="Reload page"] [data-motion]').animationName,
        thumb: style('[data-cell="settings"] [data-thumb] > span').transitionProperty,
        checkmark: style('[data-cell="checkbox"] input + svg').transitionProperty,
      };
    })()`,
  });

describe("reduced motion on the landing", () => {
  it("plays the gesture on hover and slides the thumb when motion is allowed", async () => {
    const { result } = await motion("no-preference");
    expect(result.gesture).toBe("buril-icon-spin");
    expect(result.thumb).toContain("translate");
    expect(result.checkmark).toContain("stroke-dashoffset");
  });

  it("keeps the gesture, the thumb and the check still under reduced motion", async () => {
    const { result } = await motion("reduce");
    expect(result.gesture).toBe("none");
    expect(result.thumb).not.toContain("translate");
    expect(result.checkmark).not.toContain("stroke-dashoffset");
  });
});

describe("the landing at 320px", () => {
  it.each(["/", "/es/"])("%s fits the headline and the pill on screen", async (path) => {
    const { result } = await commands.probePage<{
      h1: [number, number];
      pill: number;
      page: [number, number];
    }>(origin, path, {
      width: 320,
      evaluate: `(() => {
        const h1 = document.querySelector("[data-hero] h1");
        const pill = document.querySelector("[data-hero] a");
        return {
          h1: [h1.scrollWidth, h1.clientWidth],
          pill: pill.getBoundingClientRect().right,
          page: [document.documentElement.scrollWidth, document.documentElement.clientWidth],
        };
      })()`,
    });
    expect(result.h1[0]).toBeLessThanOrEqual(result.h1[1]);
    expect(result.pill).toBeLessThanOrEqual(320 - 16);
    expect(result.page[0]).toBeLessThanOrEqual(result.page[1]);
  });
});

interface Stop {
  cell: string | null;
  hidden: boolean;
  visible: boolean;
  outline: string;
  x: number;
  y: number;
}

describe("keyboard order through the showcase", () => {
  it.each([
    [1440, "/"],
    [1440, "/es/"],
    [375, "/es/"],
  ] as const)(
    "at %ipx, %s follows the visual order and skips the faded copies",
    async (width, path) => {
      const { trace } = await commands.probePage<null, Stop>(origin, path, {
        width,
        steps: [hydrated, { focus: '[data-hero] a[href$="/docs/components"]' }],
        trace: {
          press: "Tab",
          times: 30,
          evaluate: `(() => {
          const el = document.activeElement;
          const r = el.getBoundingClientRect();
          return {
            cell: el.closest("[data-cell]")?.dataset.cell ?? null,
            hidden: !!el.closest("[inert], [aria-hidden='true']"),
            visible: r.width > 0 && r.height > 0,
            outline: getComputedStyle(el).outlineStyle,
            x: Math.round(r.left + r.width / 2),
            y: Math.round(r.top + window.scrollY + r.height / 2),
          };
        })()`,
        },
        evaluate: "null",
      });
      const stops = trace.slice(
        0,
        trace.findIndex((stop, i) => i > 0 && !stop.cell),
      );
      // Each cell once, in reading order: Tab never jumps back to an earlier block.
      const cells = stops.map(({ cell }) => cell).filter((cell, i, all) => cell !== all[i - 1]);
      expect(cells).toEqual(order);
      for (const stop of stops) {
        expect(stop.hidden).toBe(false);
        expect(stop.visible).toBe(true);
        expect(stop.outline).not.toBe("none");
      }
      // Inside a cell, each stop is below the last one, or on the same row and to its right.
      for (const [i, stop] of stops.entries()) {
        const last = stops[i - 1];
        if (!last || last.cell !== stop.cell) continue;
        const sameRow = Math.abs(stop.y - last.y) < 14;
        expect(sameRow ? stop.x > last.x : stop.y > last.y, `${stop.cell} stop ${i}`).toBe(true);
      }
    },
  );
});

/** The headline's characters, with "|" wherever a new line starts. */
const lineBreaks = `(() => {
  const h1 = document.querySelector("[data-hero] h1");
  const range = document.createRange();
  const walk = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
  let out = "", last = null;
  for (let node = walk.nextNode(); node; node = walk.nextNode()) {
    for (let i = 0; i < node.length; i++) {
      if (!node.data[i].trim()) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const top = Math.round(range.getBoundingClientRect().top);
      if (last !== null && top !== last) out += "|";
      out += node.data[i];
      last = top;
    }
  }
  return out;
})()`;

describe("the headline font swap", () => {
  it.each([
    [375, "/"],
    [375, "/es/"],
    [768, "/"],
    [768, "/es/"],
    [1024, "/es/"],
    [1440, "/"],
    [1440, "/es/"],
    [1920, "/es/"],
  ] as const)(
    "at %ipx, %s breaks the same lines in the fallback and in Silkscreen, so the swap does not shift the page",
    async (width, path) => {
      const fallback = await commands.probePage<string>(origin, path, {
        width,
        block: /fonts\.(googleapis|gstatic)\.com/.source,
        evaluate: lineBreaks,
      });
      const loaded = await commands.probePage<string>(origin, path, {
        width,
        evaluate: lineBreaks,
      });
      expect(loaded.result.split("|").length).toBeGreaterThanOrEqual(2);
      expect(fallback.result).toBe(loaded.result);
    },
  );
});

interface HeadlineType {
  family: string;
  weight: string;
  spacing: string;
  transform: string;
  accentFamily: string;
  accent: string;
  capRatio: number;
  lineHeights: number[];
  fontSize: number;
}

/** The headline's computed type: Inter for the words, Silkscreen for the accent. */
const headlineType = `(async () => {
  await document.fonts.ready;
  const h1 = document.querySelector("[data-hero] h1");
  const accent = h1.querySelector("[data-accent]");
  const style = getComputedStyle(h1);
  const accentStyle = getComputedStyle(accent);
  const ctx = document.createElement("canvas").getContext("2d");
  const cap = (font) => { ctx.font = font; return ctx.measureText("E").actualBoundingBoxAscent; };
  const interCap = cap("600 " + style.fontSize + " Inter");
  const accentCap = cap("400 " + accentStyle.fontSize + " Silkscreen");
  return {
    family: style.fontFamily,
    weight: style.fontWeight,
    spacing: style.letterSpacing,
    transform: style.textTransform,
    accentFamily: accentStyle.fontFamily,
    accent: accent.textContent.trim(),
    capRatio: accentCap / interCap,
    lineHeights: [...h1.querySelectorAll(":scope > span.block")].map((line) => Math.round(line.getBoundingClientRect().height)),
    fontSize: parseFloat(style.fontSize),
  };
})()`;

describe("the hero headline type", () => {
  it.each([
    [375, "/", "engraved"],
    [375, "/es/", "durar"],
    [768, "/es/", "durar"],
    [1440, "/", "engraved"],
    [1440, "/es/", "durar"],
    [1920, "/", "engraved"],
  ] as const)(
    "at %ipx, %s reads in Inter semibold with one pixel-font accent",
    async (width, path, word) => {
      const { result } = await commands.probePage<HeadlineType>(origin, path, {
        width,
        evaluate: headlineType,
      });
      expect(result.family).toMatch(/^Inter,/);
      expect(result.weight).toBe("600");
      expect(result.spacing).toBe("normal");
      expect(result.transform).toBe("none");
      expect(result.accentFamily).toMatch(/^Silkscreen,/);
      expect(result.accent).toBe(word);
      // The accent's capitals stand as tall as Inter's, so the word sits on the line, not above it.
      expect(result.capRatio).toBeGreaterThan(0.95);
      expect(result.capRatio).toBeLessThan(1.05);
      // A display size: at least 32px on a phone, at most 72px on a wide screen.
      expect(result.fontSize).toBeGreaterThanOrEqual(32);
      expect(result.fontSize).toBeLessThanOrEqual(72);
      // The accent never makes its line taller than a line without it.
      if (width >= 768) expect(new Set(result.lineHeights).size).toBe(1);
    },
  );
});

/** WCAG contrast of the headline and the lead against the paper under the darkest engraving line. */
const contrastOverEngraving = `(() => {
  const canvas = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (value) => {
    canvas.clearRect(0, 0, 1, 1);
    canvas.fillStyle = value;
    canvas.fillRect(0, 0, 1, 1);
    return [...canvas.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  };
  const luminance = (c) => {
    const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const art = document.querySelector("[data-hero] svg[data-engraving]");
  let opacity = 1;
  for (let el = art; el && el !== document.body; el = el.parentElement) opacity *= parseFloat(getComputedStyle(el).opacity);
  const paper = rgb(getComputedStyle(document.body).backgroundColor);
  const strokes = [...art.querySelectorAll("g[class]")].map((g) => rgb(getComputedStyle(g).color));
  const under = strokes.map((stroke) => paper.map((p, i) => Math.round(p * (1 - opacity) + stroke[i] * opacity)));
  const worst = (selector) => {
    const color = rgb(getComputedStyle(document.querySelector(selector)).color);
    return Math.min(ratio(color, paper), ...under.map((bg) => ratio(color, bg)));
  };
  return { opacity, headline: worst("[data-hero] h1"), lead: worst("[data-hero] p") };
})()`;

describe("the hero over the engraving", () => {
  it.each(["light", "dark"] as const)(
    "keeps the headline and the lead above 4.5:1 in the %s theme, at full engraving strength",
    async (colorScheme) => {
      const { result } = await commands.probePage<{
        opacity: number;
        headline: number;
        lead: number;
      }>(origin, "/", { width: 1440, colorScheme, evaluate: contrastOverEngraving });
      // The engraving keeps its strength: 20% in light, 25% in dark.
      expect(result.opacity).toBeGreaterThanOrEqual(0.2);
      expect(result.headline).toBeGreaterThanOrEqual(4.5);
      expect(result.lead).toBeGreaterThanOrEqual(4.5);
    },
  );
});
