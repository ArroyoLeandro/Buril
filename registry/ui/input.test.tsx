import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { Field } from "./field";
import { Input } from "./input";

describe("Input", () => {
  it("renders a native input that takes typing", async () => {
    render(<Input aria-label="Name" />);
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input.tagName).toBe("INPUT");
    await userEvent.type(input, "Ada");
    expect(input).toHaveValue("Ada");
  });

  it("passes the native type through", () => {
    render(<Input type="email" aria-label="Email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
  });

  it("uses the input border, the background and the ring focus outline", () => {
    render(<Input aria-label="Name" />);
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
    render(<Input aria-label="Name" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("forwards ref and merges className", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input aria-label="Name" ref={ref} className="max-w-xs" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveClass("max-w-xs", "w-full");
  });

  describe("inside a Field", () => {
    it("is labelled, described and marked invalid through the render prop", () => {
      render(
        <Field label="Email" description="Work address." error="Enter an email address." required>
          {(control) => <Input type="email" {...control} />}
        </Field>,
      );
      const input = screen.getByRole("textbox", { name: "Email" });
      expect(input).toHaveAccessibleDescription("Work address. Error: Enter an email address.");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toBeRequired();
    });

    it("focuses when its label is clicked", async () => {
      render(<Field label="Email">{(control) => <Input {...control} />}</Field>);
      await userEvent.click(screen.getByText("Email"));
      expect(screen.getByRole("textbox")).toHaveFocus();
    });

    it("works as the element child", () => {
      render(
        <Field label="Email" error="Enter an email address.">
          <Input />
        </Field>,
      );
      expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });
  });

  describe("accessibility", () => {
    it("has no axe violations in a Field with an error", async () => {
      const { container } = render(
        <Field label="Email" description="Work address." error="Enter an email address.">
          {(control) => <Input type="email" {...control} />}
        </Field>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no axe violations when disabled", async () => {
      const { container } = render(
        <Field label="Email">{(control) => <Input disabled {...control} />}</Field>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
