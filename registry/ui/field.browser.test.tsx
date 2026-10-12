import { useState } from "react";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { isSoftSpring, setReducedMotion, settle } from "../../test/browser";
import { Field } from "./field";
import { Input } from "./input";

function Email() {
  const [error, setError] = useState<string>();
  return (
    <>
      <Field label="Email" error={error}>
        <Input type="email" />
      </Field>
      <button type="button" onClick={() => setError("Enter an email address.")}>
        Validate
      </button>
    </>
  );
}

describe("Field in a real browser", () => {
  it("fades a new error in and ends fully opaque, in place", async () => {
    const screen = await render(<Email />);
    const input = screen.getByRole("textbox", { name: "Email" }).element();
    const region = screen.container.querySelector<HTMLElement>("[aria-live]")!;
    // Resolves as soon as React inserts the message, while its fade is still running.
    const inserted = new Promise((resolve) =>
      new MutationObserver((_, observer) => {
        observer.disconnect();
        resolve(undefined);
      }).observe(region, { childList: true }),
    );
    (screen.getByRole("button", { name: "Validate" }).element() as HTMLButtonElement).click();
    await inserted;
    const message = region.firstElementChild as HTMLElement;
    expect(input.getAttribute("aria-describedby")).toContain(region.id);
    expect(message.textContent).toContain("Enter an email address.");
    // It starts from its starting style, so the fade is running.
    expect(message.getAnimations().length).toBeGreaterThan(0);
    await settle();
    expect(getComputedStyle(message).opacity).toBe("1");
    expect(getComputedStyle(message).translate).toBe("none");
  });
});

describe("Field error motion in a real browser", () => {
  /** Show the error and return the transitions its message starts with. */
  async function showError() {
    const screen = await render(<Email />);
    const region = screen.container.querySelector<HTMLElement>("[aria-live]")!;
    const inserted = new Promise((resolve) =>
      new MutationObserver((_, observer) => {
        observer.disconnect();
        resolve(undefined);
      }).observe(region, { childList: true }),
    );
    (screen.getByRole("button", { name: "Validate" }).element() as HTMLButtonElement).click();
    await inserted;
    const message = region.firstElementChild as HTMLElement;
    const transitions = Object.fromEntries(
      message
        .getAnimations()
        .map((animation) => [(animation as CSSTransition).transitionProperty, animation]),
    );
    return { message, transitions };
  }
  const timingOf = (animation: Animation) => {
    const { duration, easing } = animation.effect!.getTiming();
    const [from] = (animation.effect as KeyframeEffect).getKeyframes();
    return { duration, easing: String(easing), from };
  };

  // The message fades in quickly and drops 3px into place over the base duration.
  it("fades the message in over 200ms and drops it 3px over 420ms, both with the spring", async () => {
    await setReducedMotion(false);
    const { transitions } = await showError();
    const fade = timingOf(transitions.opacity!);
    expect(fade.duration).toBe(200);
    expect(isSoftSpring(fade.easing), fade.easing).toBe(true);
    const drop = timingOf(transitions.translate!);
    expect(drop.duration).toBe(420);
    expect(isSoftSpring(drop.easing), drop.easing).toBe(true);
    expect(drop.from?.translate).toBe("0px -3px");
    await settle();
  });

  it("only fades the message in under reduced motion", async () => {
    await setReducedMotion(true);
    const { message, transitions } = await showError();
    expect(Object.keys(transitions)).toEqual(["opacity"]);
    await settle();
    expect(getComputedStyle(message).translate).toBe("none");
  });
});
