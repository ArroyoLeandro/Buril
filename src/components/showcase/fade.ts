/**
 * The landing blocks dissolve at their edges instead of ending on a hard cut. Each fade is a mask,
 * so it never changes a color: the parts it covers are copies marked `inert` and `aria-hidden`,
 * and the live controls sit above it (`test/landing.browser.test.tsx` measures that). An element
 * that fades carries `data-fade`; `--fade` sets how tall the bottom fade is.
 */
export const fadeBottom =
  "[mask-image:linear-gradient(to_bottom,#000_calc(100%_-_var(--fade,150px)),transparent_calc(100%_-_12px))]";

/** Fades a strip of copies out toward its end: it starts faint, so it never reads as live. */
export const fadeEnd =
  "[mask-image:linear-gradient(to_right,rgb(0_0_0/0.5),transparent_85%)] rtl:[mask-image:linear-gradient(to_left,rgb(0_0_0/0.5),transparent_85%)]";
