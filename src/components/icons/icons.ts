/**
 * The docs site's own stroke icons, hand drawn on a 24 grid for a 2px round stroke in
 * `currentColor`. They decorate the site (the header, the Copy buttons, the calls to action and
 * the landing showcase) and are always `aria-hidden`: the control's text or `aria-label` is the
 * name. They are site-only: the registry never ships them, and Buril components take any icon a
 * consumer passes.
 *
 * `Icon.astro` renders them on the server and `Icon.tsx` inside React islands. Each icon is a list
 * of SVG elements; a `g` wraps a part that moves on its own, such as the trash lid that the
 * IconButton `wiggle` gesture lifts (`data-lid`).
 */
type Shape =
  | ["path", { d: string }]
  | ["circle", { cx: number; cy: number; r: number }]
  | ["rect", { x: number; y: number; width: number; height: number; rx: number }]
  | ["g", Record<string, string>, Shape[]];

const path = (d: string): Shape => ["path", { d }];
const circle = (cx: number, cy: number, r: number): Shape => ["circle", { cx, cy, r }];
const rect = (x: number, y: number, width: number, height: number, rx: number): Shape => [
  "rect",
  { x, y, width, height, rx },
];

export const icons = {
  sun: [
    circle(12, 12, 4),
    path(
      "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
    ),
  ],
  moon: [path("M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z")],
  monitor: [rect(3, 4, 18, 12, 1.5), path("M8 20h8M12 16v4")],
  globe: [
    circle(12, 12, 9),
    path("M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"),
  ],
  menu: [path("M4 7h16M4 12h16M4 17h16")],
  "arrow-right": [path("M5 12h13M13 6.5l5.5 5.5-5.5 5.5")],
  "arrow-up": [path("M12 19V5M6 11l6-6 6 6")],
  "chevron-down": [path("M6 9l6 6 6-6")],
  copy: [
    rect(9, 9, 11, 11, 2),
    path("M15 9V5.5A1.5 1.5 0 0 0 13.5 4h-8A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15H9"),
  ],
  check: [path("M5.5 12.5l4 4 9-9")],
  close: [path("M6 6l12 12M18 6L6 18")],
  plus: [path("M12 5v14M5 12h14")],
  refresh: [path("M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5")],
  trash: [
    ["g", { "data-lid": "" }, [path("M4 7h16M9 7V4h6v3")]],
    path("M6 7l1 13h10l1-13M10 11v6M14 11v6"),
  ],
  bell: [path("M12 3v1.5M18 16.5V11a6 6 0 0 0-12 0v5.5L4.5 18.5h15zM10 21a2.2 2.2 0 0 0 4 0")],
  send: [path("M4 4l17 8-17 8 3-8zM7 12h6")],
  heart: [
    path(
      "M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z",
    ),
  ],
  external: [
    path(
      "M18 13.5V18a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 5 18V8a1.5 1.5 0 0 1 1.5-1.5H11M14.5 4H20v5.5M20 4l-8.5 8.5",
    ),
  ],
  info: [circle(12, 12, 9), path("M12 11v5M12 8h.01")],
  warning: [path("M12 3.5 2.5 20h19z"), path("M12 10v4M12 17h.01")],
  error: [circle(12, 12, 9), path("M12 7.5v5M12 16h.01")],
  code: [path("M8.5 7 3.5 12l5 5M15.5 7l5 5-5 5")],
  mail: [rect(3, 5.5, 18, 13, 1.5), path("M3.5 6.5 12 13l8.5-6.5")],
  cookie: [
    path(
      "M20.5 12.5A8.5 8.5 0 1 1 11.5 3.5a3 3 0 0 0 3.5 3.5 3 3 0 0 0 3.5 3.5 2.5 2.5 0 0 0 2 2z",
    ),
    path("M8.5 9.5h.01M8 14.5h.01M12.5 12.5h.01M15.5 16h.01"),
  ],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof icons;
export type { Shape as IconShape };

export const iconNames = Object.keys(icons) as IconName[];

/** The attributes every site icon carries, spelled as SVG attributes. */
export const iconAttributes = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
  focusable: "false",
} as const;

const attributes = (values: Record<string, string | number>) =>
  Object.entries(values)
    .map(([name, value]) => (value === "" ? ` ${name}` : ` ${name}="${value}"`))
    .join("");

/** The icon's elements as SVG markup, for the server-rendered `Icon.astro`. */
export function iconMarkup(shapes: readonly Shape[]): string {
  return shapes
    .map((shape) =>
      shape[0] === "g"
        ? `<g${attributes(shape[1])}>${iconMarkup(shape[2])}</g>`
        : `<${shape[0]}${attributes(shape[1])}></${shape[0]}>`,
    )
    .join("");
}
