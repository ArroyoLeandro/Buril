import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { isSoftSpring, setReducedMotion, settle, transitionTiming } from "../../test/browser";
import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert in a real browser", () => {
  it.each(["default", "destructive"] as const)(
    "fades the %s alert in and ends fully opaque",
    async (variant) => {
      const screen = await render(
        <Alert variant={variant}>
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>Your changes are saved.</AlertDescription>
        </Alert>,
      );
      const alert = screen.getByText("Saved").element().parentElement!;
      expect(alert.getAnimations().length).toBeGreaterThan(0);
      await settle();
      expect(getComputedStyle(alert).opacity).toBe("1");
    },
  );
});

describe("Alert motion in a real browser", () => {
  // A fade is not movement, so it runs in both motion modes.
  it.each([false, true])("fades in over 200ms when reduced motion is %s", async (reduce) => {
    await setReducedMotion(reduce);
    const screen = await render(
      <Alert>
        <AlertTitle>Saved</AlertTitle>
      </Alert>,
    );
    const alert = screen.getByText("Saved").element().parentElement!;
    const timing = transitionTiming(alert, "opacity");
    expect(timing?.duration).toBe(200);
    expect(isSoftSpring(timing!.easing), timing!.easing).toBe(true);
    expect(transitionTiming(alert, "translate")).toBeUndefined();
  });
});
