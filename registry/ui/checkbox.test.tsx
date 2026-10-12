import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "./checkbox";
import { Field } from "./field";

describe("Checkbox", () => {
  it("renders a native checkbox named by its wrapping label", () => {
    render(
      <label>
        <Checkbox /> Accept the terms
      </label>,
    );
    const checkbox = screen.getByRole("checkbox", { name: "Accept the terms" });
    expect(checkbox.tagName).toBe("INPUT");
    expect(checkbox).toHaveAttribute("type", "checkbox");
  });

  it("toggles when its label text is clicked", async () => {
    render(
      <label>
        <Checkbox /> Accept the terms
      </label>,
    );
    await userEvent.click(screen.getByText("Accept the terms"));
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("toggles with Space", async () => {
    const onChange = vi.fn();
    render(<Checkbox aria-label="Accept the terms" onChange={onChange} />);
    await userEvent.tab();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("works controlled", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Checkbox aria-label="Subscribe" checked={false} onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledTimes(1);
    rerender(<Checkbox aria-label="Subscribe" checked onChange={onChange} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  describe("indeterminate", () => {
    it("sets the DOM property, which reports a mixed state", () => {
      render(<Checkbox aria-label="All toppings" indeterminate />);
      const checkbox = screen.getByRole<HTMLInputElement>("checkbox");
      expect(checkbox.indeterminate).toBe(true);
      expect(checkbox).toBePartiallyChecked();
    });

    it("clears when the prop turns off", () => {
      const { rerender } = render(<Checkbox aria-label="All toppings" indeterminate />);
      rerender(<Checkbox aria-label="All toppings" indeterminate={false} />);
      expect(screen.getByRole("checkbox")).not.toBePartiallyChecked();
    });

    it("is applied again on the next render after a click clears it", async () => {
      const { rerender } = render(<Checkbox aria-label="All toppings" indeterminate />);
      const checkbox = screen.getByRole<HTMLInputElement>("checkbox");
      await userEvent.click(checkbox);
      expect(checkbox.indeterminate).toBe(false);
      rerender(<Checkbox aria-label="All toppings" indeterminate />);
      expect(checkbox.indeterminate).toBe(true);
    });
  });

  it("can be disabled", async () => {
    render(<Checkbox aria-label="Accept the terms" disabled />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("hides its check and dash icons from assistive technology", () => {
    const { container } = render(<Checkbox aria-label="Accept the terms" />);
    const icons = container.querySelectorAll("svg");
    expect(icons).toHaveLength(2);
    for (const icon of icons) expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("forwards object and callback refs to the input", () => {
    const objectRef = createRef<HTMLInputElement>();
    let callbackNode: HTMLInputElement | null = null;
    render(
      <>
        <Checkbox aria-label="One" ref={objectRef} />
        <Checkbox aria-label="Two" ref={(node) => void (callbackNode = node)} />
      </>,
    );
    expect(objectRef.current).toBe(screen.getByRole("checkbox", { name: "One" }));
    expect(callbackNode).toBe(screen.getByRole("checkbox", { name: "Two" }));
  });

  it("merges className onto the input", () => {
    render(<Checkbox aria-label="Accept the terms" className="rounded-none" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveClass("rounded-none", "appearance-none");
    expect(checkbox).not.toHaveClass("rounded-sm");
  });

  it("is labelled, described and marked invalid by a Field", () => {
    render(
      <Field label="Terms" description="You can cancel at any time." error="Accept the terms.">
        <Checkbox />
      </Field>,
    );
    const checkbox = screen.getByRole("checkbox", { name: "Terms" });
    expect(checkbox).toHaveAccessibleDescription(
      "You can cancel at any time. Error: Accept the terms.",
    );
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
  });

  describe("accessibility", () => {
    it("has no axe violations with a wrapping label", async () => {
      const { container } = render(
        <label>
          <Checkbox defaultChecked /> Accept the terms
        </label>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no axe violations when indeterminate", async () => {
      const { container } = render(
        <label>
          <Checkbox indeterminate /> All toppings
        </label>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
