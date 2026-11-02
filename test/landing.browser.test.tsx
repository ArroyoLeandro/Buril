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

/** Live content inside each fading block: it must end above the fade, so it stays readable. */
const fades = `(() => {
  const live = "input, label, p, h4, button, a, [data-slot=badge], [data-slot=avatar], li";
  return [...document.querySelectorAll("[data-bento] [data-fade]")].map((fade) => {
    const cell = fade.closest("[data-cell]");
    const size = parseFloat(getComputedStyle(fade).getPropertyValue("--fade")) || 150;
    const box = fade.getBoundingClientRect();
    const limit = Math.min(box.bottom, cell.getBoundingClientRect().bottom) - size;
    const parts = [...fade.querySelectorAll(live)].filter(
      (el) => !el.closest("[inert]") && el.getBoundingClientRect().height > 0,
    );
    return {
      cell: cell.dataset.cell,
      count: parts.length,
      below: parts
        .filter((el) => el.getBoundingClientRect().bottom > limit + 1)
        .map((el) => el.outerHTML.slice(0, 60)),
      wide: parts
        .filter((el) => el.getBoundingClientRect().right > cell.getBoundingClientRect().right + 1)
        .map((el) => el.outerHTML.slice(0, 60)),
    };
  });
})()`;

describe("the fading blocks", () => {
  it.each([
    [320, "/"],
    [320, "/es/"],
    [768, "/es/"],
    [1024, "/es/"],
    [1440, "/"],
    [1440, "/es/"],
  ] as const)("at %ipx, %s keeps every live control above the fade", async (width, path) => {
    const { result } = await commands.probePage<
      { cell: string; count: number; below: string[]; wide: string[] }[]
    >(origin, path, { width, evaluate: fades });
    expect(result.map(({ cell }) => cell)).toEqual(expect.arrayContaining(["team", "settings"]));
    for (const fade of result) {
      expect(fade.count, fade.cell).toBeGreaterThan(2);
      expect(fade.below, fade.cell).toEqual([]);
      expect(fade.wide, fade.cell).toEqual([]);
    }
  });
});

const bottomRow = `(() => {
  const inside = (cell, el) => {
    const c = cell.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return r.left >= c.left && r.right <= c.right && r.top >= c.top && r.bottom <= c.bottom;
  };
  const cell = (id) => document.querySelector('[data-cell="' + id + '"]');
  const gestures = [...cell("gestures").querySelectorAll("button")].map((b) => b.getBoundingClientRect());
  const live = (id) => [...cell(id).querySelectorAll("button, [data-slot=alert]")].filter((el) => !el.closest("[inert]"));
  return {
    gestureRows: new Set(gestures.map((b) => Math.round(b.top))).size,
    gestureColumns: new Set(gestures.map((b) => Math.round(b.left))).size,
    buttonsInside: live("buttons").every((el) => inside(cell("buttons"), el)),
    buttonRows: new Set(live("buttons").map((el) => Math.round(el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2))).size,
    alertInside: live("alert").every((el) => inside(cell("alert"), el)),
    alerts: live("alert").length,
  };
})()`;

describe("the bottom row", () => {
  it.each([
    [320, "/es/", 2, 3],
    [768, "/es/", 1, 6],
    [1024, "/es/", 2, 3],
    [1280, "/es/", 2, 3],
    [1440, "/", 2, 3],
  ] as const)(
    "at %ipx, %s fits the Alert and the buttons and sets the gestures %i by %i",
    async (width, path, rows, columns) => {
      const { result } = await commands.probePage<{
        gestureRows: number;
        gestureColumns: number;
        buttonsInside: boolean;
        buttonRows: number;
        alertInside: boolean;
        alerts: number;
      }>(origin, path, { width, evaluate: bottomRow });
      expect([result.gestureRows, result.gestureColumns]).toEqual([rows, columns]);
      expect(result.buttonsInside).toBe(true);
      expect(result.alertInside).toBe(true);
      expect(result.alerts).toBe(1);
      // From xl up the six buttons share one row; below, they wrap inside the cell.
      if (width >= 1280) expect(result.buttonRows).toBe(1);
    },
  );
});
