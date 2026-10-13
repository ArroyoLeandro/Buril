/**
 * The landing blocks dissolve at their edges instead of ending on a hard cut. Each fade is a mask,
 * so it never changes a color: the parts it covers are copies marked `inert` and `aria-hidden`,
 * and the live controls sit above it (`test/landing.browser.test.tsx` measures that). An element
 * that fades carries `data-fade`; `--fade` sets how tall the bottom fade is.
 */
export const fadeBottom =
  "[mask-image:linear-gradient(to_bottom,#000_calc(100%_-_var(--fade,150px)),transparent_calc(100%_-_12px))]";

/** Fades a row out toward its end, for a strip that runs past the cell. */
export const fadeEnd =
  "[mask-image:linear-gradient(to_right,#000_58%,transparent_97%)] rtl:[mask-image:linear-gradient(to_left,#000_58%,transparent_97%)]";
