import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { describe, expect, it } from "vitest";

import {
  contrast,
  isSoftSpring,
  setReducedMotion,
  setTheme,
  settle,
  themes,
  tokenColor,
  transitionTiming,
} from "../../test/browser";
import { Button, IconButton, type IconButtonProps } from "./button";

const ringParts = ["outline-color", "outline-width", "outline-style", "outline-offset", "outline"];

describe("Button in a real browser", () => {
  it.each(themes)(
    "shows the focus outline at once and at full contrast on Tab in %s mode",
    async (theme) => {
      setTheme(theme);
      const screen = await render(<Button>Save</Button>);
      const button = screen.getByRole("button").element();
      await userEvent.tab();
      expect(document.activeElement).toBe(button);
      expect(button.matches(":focus-visible")).toBe(true);

      // Nothing transitions the outline, and its first frame is already the final one.
      const transitions = button
        .getAnimations()
        .filter((animation) => animation instanceof CSSTransition)
        .map((animation) => (animation as CSSTransition).transitionProperty);
      expect(transitions.filter((property) => ringParts.includes(property))).toEqual([]);
      const first = getComputedStyle(button);
      const [color, width, style] = [first.outlineColor, first.outlineWidth, first.outlineStyle];
      expect(width).toBe("2px");
      expect(style).toBe("solid");
      await settle();
      expect(getComputedStyle(button).outlineColor).toBe(color);

      expect(contrast(color, tokenColor("--background"))).toBeGreaterThanOrEqual(3);
    },
  );
});

describe("IconButton motion in a real browser", () => {
  type Motion = NonNullable<IconButtonProps["motion"]>;

  /** A 24px stroke icon with a marked lid, like a trash can. */
  function Icon() {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <g data-lid>
          <path d="M4 7h16M9 7V4h6v3" />
        </g>
        <path d="M6 7l1 13h10l1-13" />
      </svg>
    );
  }

  async function renderButton(motion: Motion, props: { dir?: "rtl" } = {}) {
    const screen = await render(
      <div dir={props.dir}>
        <IconButton aria-label="Act" motion={motion}>
          <Icon />
        </IconButton>
      </div>,
    );
    // Queried inside this render: a test may render several buttons with the same name.
    const button = screen.container.querySelector("button")!;
    const icon = button.querySelector<HTMLElement>("[data-motion]")!;
    return { button, icon };
  }
  /**
   * Records every gesture that starts on the icon. A gesture can be over before a hover or a key
   * press sent from the test runner returns, but its start event is never lost, so the tests wait
   * for the event instead of hoping the animation is still running.
   */
  function recordStarts(icon: Element) {
    const names: string[] = [];
    icon.addEventListener("animationstart", (event) => {
      names.push((event as AnimationEvent).animationName);
    });
    return names;
  }
  /** A computed time, such as `0.648s` or `200ms`, in ms. */
  const ms = (time: string) => parseFloat(time) * (time.endsWith("ms") ? 1 : 1000);
  const gesturesOn = (icon: Element) =>
    icon
      .getAnimations()
      .filter((animation): animation is CSSAnimation => animation instanceof CSSAnimation);

  // Durations come from the motion tokens: slower × 1.5, gesture, gesture × 1.3, gesture × 0.9
  // and slow × 1.4.
  const gestures = [
    { motion: "spin", name: "buril-icon-spin", duration: 840, delay: 0 },
    { motion: "wiggle", name: "buril-icon-shake", duration: 720, delay: 200 },
    { motion: "swing", name: "buril-icon-swing", duration: 936, delay: 0 },
    { motion: "nudge-x", name: "buril-icon-nudge", duration: 648, delay: 0 },
    { motion: "nudge-up", name: "buril-icon-nudge", duration: 648, delay: 0 },
    { motion: "nudge-diagonal", name: "buril-icon-nudge", duration: 648, delay: 0 },
    { motion: "pop", name: "buril-icon-pop", duration: 644, delay: 0 },
  ] as const;

  it.each(gestures)(
    "plays $motion once on hover, then stops",
    async ({ motion, name, duration, delay }) => {
      await setReducedMotion(false);
      const { button, icon } = await renderButton(motion);
      const started = recordStarts(icon);
      expect(gesturesOn(icon)).toEqual([]);
      await userEvent.hover(button);
      await expect.poll(() => started).toEqual([name]);
      // The timing, from the hovered icon's computed style, which stays after the gesture ends.
      const style = getComputedStyle(icon);
      expect(style.animationName).toBe(name);
      expect(ms(style.animationDuration)).toBeCloseTo(duration, 6);
      expect(ms(style.animationDelay)).toBe(delay);
      // One-shot: never a loop.
      expect(style.animationIterationCount).toBe("1");
      await settle();
      expect(started).toEqual([name]);
      expect(gesturesOn(icon).filter(({ playState }) => playState === "running")).toEqual([]);
    },
  );

  it.each(gestures)("plays $motion when keyboard focus arrives", async ({ motion, name }) => {
    await setReducedMotion(false);
    const { button, icon } = await renderButton(motion);
    const started = recordStarts(icon);
    await userEvent.tab();
    expect(button.matches(":focus-visible")).toBe(true);
    await expect.poll(() => started).toEqual([name]);
  });

  it("plays the gesture again on the next hover", async () => {
    await setReducedMotion(false);
    const { button, icon } = await renderButton("swing");
    const started = recordStarts(icon);
    await userEvent.hover(button);
    await expect.poll(() => started).toHaveLength(1);
    await settle();
    await userEvent.unhover(button);
    await userEvent.hover(button);
    await expect.poll(() => started).toEqual(["buril-icon-swing", "buril-icon-swing"]);
  });

  it("settles spins, nudges and pops with the soft spring", async () => {
    await setReducedMotion(false);
    for (const motion of ["spin", "nudge-x", "pop"] as const) {
      const { button, icon } = await renderButton(motion);
      await userEvent.hover(button);
      const easing = getComputedStyle(icon).animationTimingFunction;
      expect(isSoftSpring(easing), `${motion}: ${easing}`).toBe(true);
      await userEvent.unhover(button);
    }
  });

  it("swings the bell from the top and shakes the can from the bottom", async () => {
    await setReducedMotion(false);
    for (const [motion, top] of [
      ["swing", true],
      ["wiggle", false],
    ] as const) {
      const { icon } = await renderButton(motion);
      const [, y = "0"] = getComputedStyle(icon).transformOrigin.split(" ");
      const height = icon.getBoundingClientRect().height;
      expect(parseFloat(y) < height / 2, motion).toBe(top);
    }
  });

  it("nudges forward in the reading direction", async () => {
    await setReducedMotion(false);
    const ltr = await renderButton("nudge-x");
    expect(getComputedStyle(ltr.icon).getPropertyValue("--buril-nudge-x")).toBe("3.75px");
    const rtl = await renderButton("nudge-x", { dir: "rtl" });
    expect(getComputedStyle(rtl.icon).getPropertyValue("--buril-nudge-x")).toBe("-3.75px");
  });

  // Space holds the button :active, like a pointer press that has not been released yet. CSS
  // cannot keep an animation running once :active ends, so the press is a transition: it squeezes
  // the icon at once, and on release the transition back runs to its end and settles.
  it("squeezes the pop icon while pressed and lets it settle with the spring on release", async () => {
    await setReducedMotion(false);
    const { icon } = await renderButton("pop");
    const started = recordStarts(icon);
    await userEvent.tab();
    await expect.poll(() => started).toEqual(["buril-icon-pop"]);
    const release = transitionTiming(icon, "transform");
    expect(release?.duration).toBeCloseTo(644, 6);
    expect(isSoftSpring(release!.easing), release!.easing).toBe(true);

    await userEvent.keyboard("{Space>}");
    expect(transitionTiming(icon, "transform")?.duration).toBe(100);
    await settle();
    // The press starts no animation of its own, so releasing never cuts one off half-way.
    expect(started).toEqual(["buril-icon-pop"]);
    expect(getComputedStyle(icon).transform).toBe("matrix(0.88, 0, 0, 0.88, 0, 0)");

    await userEvent.keyboard("{/Space}");
    await settle();
    expect(getComputedStyle(icon).transform).toBe("none");
  });

  it("turns the close icon 90° with the soft spring while hovered, and back after", async () => {
    await setReducedMotion(false);
    const { button, icon } = await renderButton("rotate");
    const timing = transitionTiming(icon, "rotate");
    expect(timing?.duration).toBe(420);
    expect(isSoftSpring(timing!.easing), timing!.easing).toBe(true);
    await userEvent.hover(button);
    await settle();
    expect(getComputedStyle(icon).rotate).toBe("90deg");
    await userEvent.unhover(button);
    await settle();
    expect(getComputedStyle(icon).rotate).toBe("none");
  });

  it("lifts a marked lid while the can wiggles", async () => {
    await setReducedMotion(false);
    const { button, icon } = await renderButton("wiggle");
    const lid = icon.querySelector("[data-lid]")!;
    await userEvent.hover(button);
    await settle();
    expect(getComputedStyle(lid).translate).toBe("0px -3px");
    expect(getComputedStyle(lid).rotate).toBe("-19.6deg");
  });

  it.each([...gestures.map(({ motion }) => motion), "rotate" as const])(
    "keeps the %s icon still under reduced motion",
    async (motion) => {
      await setReducedMotion(true);
      const { button, icon } = await renderButton(motion);
      await userEvent.hover(button);
      expect(gesturesOn(icon)).toEqual([]);
      expect(transitionTiming(icon, "rotate")).toBeUndefined();
      expect(transitionTiming(icon, "transform")).toBeUndefined();
      await settle();
      expect(getComputedStyle(icon).rotate).toBe("none");
      expect(getComputedStyle(icon.querySelector("[data-lid]")!).translate).toBe("none");
    },
  );
});

describe("Button loading in a real browser", () => {
  // 8px read as cramped next to the spinning ring; 12px keeps the spinner apart from the label.
  it.each(["sm", "default", "lg"] as const)(
    "leaves a 12px gap between the spinner and the label at the %s size",
    async (size) => {
      const screen = await render(
        <Button loading size={size}>
          Save changes
        </Button>,
      );
      const button = screen.getByRole("button").element();
      const spinner = button.querySelector("svg")!.getBoundingClientRect();
      const label = document.createRange();
      label.selectNodeContents(
        [...button.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)!,
      );
      expect(label.getBoundingClientRect().left - spinner.right).toBeCloseTo(12, 0);
      // The pair stays centered in the button.
      const box = button.getBoundingClientRect();
      const left = spinner.left - box.left;
      const right = box.right - label.getBoundingClientRect().right;
      expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
    },
  );
});
