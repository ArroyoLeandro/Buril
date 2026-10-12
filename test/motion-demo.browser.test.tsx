import { commands } from "vitest/browser";
import { describe, expect, inject, it } from "vitest";

/**
 * The Motion page's demo in a real browser: with motion allowed, the demo Switch's dot slides and
 * the Spinner turns. Its "Simulate reduced motion" switch makes the components behave as they do
 * with the system setting on: the dot jumps and the Spinner shows its still dots.
 */
const origin = inject("docsOrigin");

describe.each(["/docs/motion", "/es/docs/motion"])("%s demo", (path) => {
  it("moves until reduced motion is simulated, then behaves as reduced motion does", async () => {
    const demo = await commands.inspectMotionDemo(origin, path);
    expect(demo.before).toEqual({ slides: true, dots: "none", stage: false });
    expect(demo.after).toEqual({ slides: false, dots: "inline", stage: true });
  });
});
