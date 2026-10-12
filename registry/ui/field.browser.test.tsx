import { useState } from "react";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { settle } from "../../test/browser";
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
