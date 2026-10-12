import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import {
  contrast,
  isSoftSpring,
  pseudoBox,
  setReducedMotion,
  setTheme,
  settle,
  themes,
  transitionTiming,
} from "../../test/browser";
import { Switch } from "./switch";

// The default track and the sizes a consumer can give it with className.
const sizes = [
  { width: 44, height: 24, className: undefined },
  { width: 36, height: 24, className: "w-9" },
  { width: 56, height: 32, className: "h-8 w-14" },
  { width: 64, height: 40, className: "h-10 w-16" },
];
const states = [
  { state: "off", checked: false },
  { state: "on", checked: true },
] as const;
// The dot sits 4px inside the track; allow 1px for subpixel layout.
const inset = 4;
const tolerance = 1;

const cases = themes.flatMap((theme) =>
  sizes.flatMap((size) => states.map((state) => ({ theme, ...size, ...state }))),
);

/** The parts of a rendered Switch, measured the way the browser painted them. */
function measure(container: HTMLElement) {
  const track = container.querySelector("input")!;
  const thumb = container.querySelector<HTMLElement>("[data-thumb]")!;
  // The dot is a ::before (of the thumb or of an element inside it): the one that is round.
  const dotOwner = [thumb, ...thumb.querySelectorAll<HTMLElement>("*")].find((element) => {
    const before = getComputedStyle(element, "::before");
    return before.content !== "none" && before.borderRadius !== "0px";
  })!;
  const labels = [...container.querySelectorAll<HTMLElement>("[aria-hidden]:not([data-thumb])")];
  return {
    track: track.getBoundingClientRect(),
    trackColor: getComputedStyle(track).backgroundColor,
    dot: pseudoBox(dotOwner, "::before"),
    dotColor: getComputedStyle(dotOwner, "::before").backgroundColor,
    label: labels.find((label) => getComputedStyle(label).display !== "none")!,
  };
}

const overlaps = (a: DOMRect, b: DOMRect) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

describe("Switch in a real browser", () => {
  it.each(cases)(
    "keeps the dot inside a $width x $height track when $state in $theme mode",
    async ({ theme, width, height, className, checked }) => {
      setTheme(theme);
      const screen = await render(
        <label>
          Email notifications{" "}
          <Switch
            className={className}
            defaultChecked={checked}
            stateLabels={{ on: "On", off: "Off" }}
          />
        </label>,
      );
      const { track, dot } = measure(screen.container);
      expect(track.width).toBe(width);
      expect(track.height).toBe(height);

      // Fully inside, with equal gaps above and below.
      expect(dot.left).toBeGreaterThanOrEqual(track.left - tolerance);
      expect(dot.right).toBeLessThanOrEqual(track.right + tolerance);
      expect(dot.top - track.top).toBeCloseTo(inset, 0);
      expect(track.bottom - dot.bottom).toBeCloseTo(inset, 0);
      expect(dot.width).toBeCloseTo(height - 2 * inset, 0);
      expect(dot.height).toBeCloseTo(height - 2 * inset, 0);

      // Off at the left inset, on at the right one: the position tells the state.
      const gap = checked ? track.right - dot.right : dot.left - track.left;
      expect(Math.abs(gap - inset)).toBeLessThanOrEqual(tolerance);
    },
  );

  it.each(cases)(
    "shows a dot that contrasts with the $width x $height track when $state in $theme mode",
    async ({ theme, className, checked }) => {
      setTheme(theme);
      const screen = await render(
        <label>
          Email notifications <Switch className={className} defaultChecked={checked} />
        </label>,
      );
      const { trackColor, dotColor } = measure(screen.container);
      expect(dotColor).not.toBe(trackColor);
      // Non-text contrast (WCAG 1.4.11): the dot is the part that shows the state.
      expect(contrast(dotColor, trackColor)).toBeGreaterThanOrEqual(3);
    },
  );

  it.each(cases)(
    "keeps the state text clear of the $width x $height track when $state in $theme mode",
    async ({ theme, className, checked }) => {
      setTheme(theme);
      const screen = await render(
        <label>
          Email notifications{" "}
          <Switch
            className={className}
            defaultChecked={checked}
            stateLabels={{ on: "On", off: "Off" }}
          />
        </label>,
      );
      const { track, dot, label } = measure(screen.container);
      const text = label.getBoundingClientRect();
      expect(label.textContent).toBe(checked ? "On" : "Off");
      expect(text.width).toBeGreaterThan(0);
      expect(overlaps(text, track)).toBe(false);
      expect(overlaps(text, dot)).toBe(false);
    },
  );

  it("slides the dot to the right inset when turned on, and back when turned off", async () => {
    const screen = await render(
      <label>
        Email notifications <Switch stateLabels={{ on: "On", off: "Off" }} />
      </label>,
    );
    const control = screen.getByRole("switch");
    for (const checked of [true, false]) {
      await control.click();
      await settle();
      const { track, dot } = measure(screen.container);
      const gap = checked ? track.right - dot.right : dot.left - track.left;
      expect(Math.abs(gap - inset)).toBeLessThanOrEqual(tolerance);
    }
  });
});

describe("Switch motion in a real browser", () => {
  async function renderSwitch() {
    const screen = await render(
      <label>
        Email notifications <Switch />
      </label>,
    );
    const track = screen.container.querySelector("input")!;
    const thumb = screen.container.querySelector<HTMLElement>("[data-thumb]")!;
    return { screen, track, thumb, carrier: thumb.firstElementChild! };
  }
  const slides = (carrier: Element) =>
    carrier
      .getAnimations()
      .some((animation) => (animation as CSSTransition).transitionProperty === "translate");

  // The base duration and the soft spring: slow enough to follow the dot, which settles softly.
  it("slides the dot over 420ms with the soft spring, and fades the colors with it", async () => {
    await setReducedMotion(false);
    const { screen, track, thumb, carrier } = await renderSwitch();
    for (const [element, property] of [
      [carrier, "translate"],
      [track, "background-color"],
      [track, "border-color"],
      [thumb, "color"],
    ] as const) {
      const timing = transitionTiming(element, property);
      expect(timing?.duration, property).toBe(420);
      expect(isSoftSpring(timing!.easing), timing!.easing).toBe(true);
    }
    // Toggle it in this task and look straight away: getAnimations() flushes the style change, so
    // the slide exists and has not ended. A round trip to the test runner could outlast it.
    (screen.getByRole("switch").element() as HTMLInputElement).click();
    expect(slides(carrier)).toBe(true);
  });

  it("jumps the dot under reduced motion, while the colors still fade", async () => {
    await setReducedMotion(true);
    const { screen, track, carrier } = await renderSwitch();
    expect(transitionTiming(carrier, "translate")).toBeUndefined();
    expect(transitionTiming(track, "background-color")?.duration).toBe(420);
    (screen.getByRole("switch").element() as HTMLInputElement).click();
    expect(slides(carrier)).toBe(false);
  });
});
