import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { Field } from "./field";

describe("Field", () => {
  describe("with a render prop", () => {
    it("labels the control with a native label", () => {
      render(<Field label="Email">{(control) => <input type="email" {...control} />}</Field>);
      const input = screen.getByRole("textbox", { name: "Email" });
      const label = screen.getByText("Email");
      expect(label.tagName).toBe("LABEL");
      expect(label).toHaveAttribute("for", input.id);
      expect(input.id).not.toBe("");
    });

    it("focuses the control when the label is clicked", async () => {
      render(<Field label="Email">{(control) => <input {...control} />}</Field>);
      await userEvent.click(screen.getByText("Email"));
      expect(screen.getByRole("textbox")).toHaveFocus();
    });

    it("gives each field its own control id", () => {
      render(
        <>
          <Field label="First name">{(control) => <input {...control} />}</Field>
          <Field label="Last name">{(control) => <input {...control} />}</Field>
        </>,
      );
      const [first, last] = screen.getAllByRole("textbox");
      expect(first!.id).not.toBe(last!.id);
      expect(screen.getByRole("textbox", { name: "Last name" })).toBe(last);
    });

    it("adds no description or invalid state when there is nothing to say", () => {
      render(<Field label="Email">{(control) => <input {...control} />}</Field>);
      const input = screen.getByRole("textbox");
      expect(input).not.toHaveAttribute("aria-describedby");
      expect(input).not.toHaveAttribute("aria-invalid");
      expect(input).not.toBeRequired();
    });

    it("describes the control with its description", () => {
      render(
        <Field label="Email" description="We only use it to send the receipt.">
          {(control) => <input {...control} />}
        </Field>,
      );
      expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
        "We only use it to send the receipt.",
      );
    });

    it("marks the control invalid and describes it with the error", () => {
      render(
        <Field label="Email" error="Enter an email address.">
          {(control) => <input {...control} />}
        </Field>,
      );
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toBeInvalid();
      expect(input).toHaveAccessibleDescription("Error: Enter an email address.");
    });

    it("reads the description before the error", () => {
      render(
        <Field label="Email" description="Work address." error="Enter an email address.">
          {(control) => <input {...control} />}
        </Field>,
      );
      expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
        "Work address. Error: Enter an email address.",
      );
    });

    it("shows the error with an icon and text, never color alone", () => {
      render(
        <Field label="Email" error="Enter an email address.">
          {(control) => <input {...control} />}
        </Field>,
      );
      const error = screen.getByText("Enter an email address.").closest("[aria-live]")!;
      expect(error).toHaveClass("text-destructive");
      expect(error.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
      expect(error).toHaveTextContent("Error: Enter an email address.");
    });

    it("treats an empty error as no error", () => {
      render(
        <Field label="Email" error="">
          {(control) => <input {...control} />}
        </Field>,
      );
      expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
    });
  });

  describe("announcing errors", () => {
    // A live region must exist before its content changes, or screen readers can miss the update.
    it("keeps an empty polite live region ready before any error", () => {
      const { container } = render(
        <Field label="Email">{(control) => <input {...control} />}</Field>,
      );
      const region = container.querySelector('[aria-live="polite"]');
      expect(region).not.toBeNull();
      expect(region).toBeEmptyDOMElement();
    });

    it("puts a new error into the same live region", () => {
      const field = (error?: string) => (
        <Field label="Email" error={error}>
          {(control) => <input {...control} />}
        </Field>
      );
      const { container, rerender } = render(field());
      const region = container.querySelector('[aria-live="polite"]');
      rerender(field("Enter an email address."));
      expect(container.querySelector('[aria-live="polite"]')).toBe(region);
      expect(region).toHaveTextContent("Error: Enter an email address.");
      rerender(field());
      expect(region).toBeEmptyDOMElement();
    });
  });

  describe("required", () => {
    it("makes the control required and shows a visible text marker", () => {
      render(
        <Field label="Email" required>
          {(control) => <input {...control} />}
        </Field>,
      );
      const input = screen.getByRole("textbox");
      expect(input).toBeRequired();
      expect(screen.getByText("(required)")).toBeVisible();
    });

    it("keeps the marker out of the name, since the control already reports required", () => {
      render(
        <Field label="Email" required>
          {(control) => <input {...control} />}
        </Field>,
      );
      expect(screen.getByRole("textbox", { name: "Email" })).toBeRequired();
      expect(screen.getByText("(required)")).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("with an element child", () => {
    it("wires the label, description and error into the child", () => {
      render(
        <Field label="Email" description="Work address." error="Enter an email address." required>
          <input type="email" />
        </Field>,
      );
      const input = screen.getByRole("textbox", { name: "Email" });
      expect(input).toHaveAccessibleDescription("Work address. Error: Enter an email address.");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toBeRequired();
    });

    it("keeps the child's own id and points the label at it", () => {
      render(
        <Field label="Email">
          <input id="email" />
        </Field>,
      );
      expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute("id", "email");
    });

    it("merges the child's own aria-describedby", () => {
      render(
        <>
          <p id="policy">Read the privacy policy.</p>
          <Field label="Email" description="Work address.">
            <input aria-describedby="policy" />
          </Field>
        </>,
      );
      expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
        "Work address. Read the privacy policy.",
      );
    });

    it("leaves the child's own invalid and required state alone when the field has none", () => {
      render(
        <Field label="Email">
          <input aria-invalid="true" required />
        </Field>,
      );
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toBeRequired();
    });
  });

  it("forwards props to its wrapper and merges className", () => {
    render(
      <Field label="Email" className="max-w-sm" data-testid="field">
        {(control) => <input {...control} />}
      </Field>,
    );
    expect(screen.getByTestId("field")).toHaveClass("max-w-sm", "flex");
  });

  describe("accessibility", () => {
    it("has no axe violations with a description, an error and required", async () => {
      const { container } = render(
        <Field label="Email" description="Work address." error="Enter an email address." required>
          {(control) => <input type="email" {...control} />}
        </Field>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no axe violations with an element child", async () => {
      const { container } = render(
        <Field label="Message" description="Up to 500 characters.">
          <textarea />
        </Field>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
