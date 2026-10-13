import { commands } from "vitest/browser";
import { describe, expect, inject, it } from "vitest";

/**
 * The landing showcase in a real browser (`test/docs-site.ts` serves the site, `test/site-probe.ts`
 * opens it): the bento grid at phone, tablet, desktop and wide widths.
 */
const origin = inject("docsOrigin");

interface Box {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface Layout {
  columns: number;
  bento: Box;
  cells: (Box & { id: string })[];
  scrollWidth: number;
  clientWidth: number;
}

const measure = `(() => {
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return {
      top: Math.round(r.top + scrollY), left: Math.round(r.left), right: Math.round(r.right),
      bottom: Math.round(r.bottom + scrollY), width: Math.round(r.width), height: Math.round(r.height),
    };
  };
  const bento = document.querySelector("[data-bento]");
  return {
    columns: getComputedStyle(bento).gridTemplateColumns.split(" ").length,
    bento: box(bento),
    cells: [...bento.querySelectorAll(":scope > [data-cell]")].map((cell) => ({ id: cell.dataset.cell, ...box(cell) })),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  };
})()`;

const order = ["team", "settings", "checkbox", "field", "alert", "buttons", "gestures"];
const overlap = (a: Box, b: Box) =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

describe.each([
  [320, 1],
  [768, 2],
  [1440, 12],
  [1920, 12],
] as const)("the showcase at %ipx", (width, columns) => {
  it.each(["/", "/es/"])("%s lays out the bento without sideways scrolling", async (path) => {
    const { status, result } = await commands.probePage<Layout>(origin, path, {
      width,
      evaluate: measure,
    });
    expect(status).toBe(200);
    expect(result.columns).toBe(columns);
    expect(result.scrollWidth).toBeLessThanOrEqual(result.clientWidth);
    expect(result.bento.width).toBeLessThanOrEqual(1320);
    // Centered, with at least the 16px gutter on each side.
    expect(Math.abs(result.bento.left - (result.clientWidth - result.bento.right))).toBeLessThan(2);
    expect(result.bento.left).toBeGreaterThanOrEqual(16);

    const { cells } = result;
    expect(cells.map(({ id }) => id)).toEqual(order);
    // The visual order (row by row, left to right) is the source order, so Tab follows the eye.
    const visual = [...cells].sort((a, b) => a.top - b.top || a.left - b.left);
    expect(visual.map(({ id }) => id)).toEqual(order);
    for (const [i, a] of cells.entries()) {
      expect(a.height, a.id).toBeGreaterThanOrEqual(180);
      for (const b of cells.slice(i + 1)) expect(overlap(a, b), `${a.id} / ${b.id}`).toBe(0);
    }
  });
});

describe("the showcase rows", () => {
  const at = async (width: number) => {
    const { result } = await commands.probePage<Layout>(origin, "/", { width, evaluate: measure });
    return Object.fromEntries(result.cells.map((cell) => [cell.id, cell]));
  };

  it("at 1440px puts Team, Settings and Checkbox on top, Alert, Button and Gestures below", async () => {
    const cell = await at(1440);
    expect(cell.settings!.top).toBe(cell.team!.top);
    expect(cell.checkbox!.top).toBe(cell.team!.top);
    expect(cell.field!.left).toBe(cell.checkbox!.left);
    expect(cell.field!.top).toBeGreaterThan(cell.checkbox!.bottom);
    // Team and Settings span both top rows.
    expect(cell.team!.bottom).toBe(cell.field!.bottom);
    expect(cell.settings!.bottom).toBe(cell.field!.bottom);
    for (const id of ["alert", "buttons", "gestures"]) {
      expect(cell[id]!.top, id).toBe(cell.alert!.top);
      expect(cell[id]!.top, id).toBeGreaterThan(cell.field!.bottom);
    }
    // Three column lines, 3 | 6 | 3.
    expect(cell.alert!.left).toBe(cell.team!.left);
    expect(cell.buttons!.left).toBe(cell.settings!.left);
    expect(cell.gestures!.left).toBe(cell.checkbox!.left);
    expect(cell.settings!.width).toBeGreaterThan(cell.team!.width * 1.9);
  });

  it("at 768px gives Team, Settings and Gestures the full width and pairs the rest", async () => {
    const cell = await at(768);
    expect(cell.team!.width).toBe(cell.settings!.width);
    expect(cell.gestures!.width).toBe(cell.team!.width);
    expect(cell.field!.top).toBe(cell.checkbox!.top);
    expect(cell.buttons!.top).toBe(cell.alert!.top);
    expect(cell.checkbox!.width).toBeLessThan(cell.team!.width / 1.9);
  });
});
