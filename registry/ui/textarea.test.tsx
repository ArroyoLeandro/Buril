import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { Field } from "./field";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders a native textarea that takes several lines", async () => {
    render(<Textarea aria-label="Message" />);
    const textarea = screen.getByRole("textbox", { name: "Message" });
    expect(textarea.tagName).toBe("TEXTAREA");
    await userEvent.type(textarea, "Hello{Enter}there");
    expect(textarea).toHaveValue("Hello\nthere");
  });

  it("uses the input border, the background and the ring focus outline", () => {
    render(<Textarea aria-label="Message" />);
    expect(screen.getByRole("textbox")).toHaveClass(
      "border-input",
      "bg-background",
      "focus-visible:outline-2",
      "focus-visible:outline-offset-2",
      "focus-visible:outline-ring",
      "aria-invalid:border-destructive",
    );
  });

  it("can be disabled", () => {
    render(<Textarea aria-label="Message" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea aria-label="Message" ref={ref} className="min-h-40" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    expect(ref.current).toHaveClass("min-h-40");
    expect(ref.current).not.toHaveClass("min-h-20");
  });

  describe("inside a Field", () => {
    it("is labelled, described and marked invalid through the render prop", () => {
      render(
        <Field label="Message" description="Up to 500 characters." error="Write a message.">
          {(control) => <Textarea {...control} />}
        </Field>,
      );
      const textarea = screen.getByRole("textbox", { name: "Message" });
      expect(textarea).toHaveAccessibleDescription("Up to 500 characters. Error: Write a message.");
      expect(textarea).toHaveAttribute("aria-invalid", "true");
    });

    it("works as the element child", () => {
      render(
        <Field label="Message" required>
          <Textarea />
        </Field>,
      );
      expect(screen.getByRole("textbox", { name: "Message" })).toBeRequired();
    });
  });

  it("has no axe violations in a Field with an error", async () => {
    const { container } = render(
      <Field label="Message" error="Write a message.">
        {(control) => <Textarea {...control} />}
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
