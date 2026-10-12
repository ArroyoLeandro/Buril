import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";

import { Field } from "./field";
import { Select } from "./select";

function Options() {
  return (
    <>
      <option value="">Choose a size</option>
      <option value="s">Small</option>
      <option value="m">Medium</option>
      <option value="l">Large</option>
    </>
  );
}

describe("Select", () => {
  it("renders a native select with its options", () => {
    render(
      <Select aria-label="Size">
        <Options />
      </Select>,
    );
    const select = screen.getByRole("combobox", { name: "Size" });
    expect(select.tagName).toBe("SELECT");
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("changes value natively and reports it", async () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Size" onChange={onChange}>
        <Options />
      </Select>,
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "Medium");
    expect(screen.getByRole("combobox")).toHaveValue("m");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("draws a chevron hidden from assistive technology", () => {
    const { container } = render(
      <Select aria-label="Size">
        <Options />
      </Select>,
    );
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("drops the chevron for a list box (multiple or size above 1)", () => {
    const { container } = render(
      <>
        <Select aria-label="Sizes" multiple>
          <Options />
        </Select>
        <Select aria-label="Size" size={4}>
          <Options />
        </Select>
      </>,
    );
    expect(screen.getAllByRole("listbox")).toHaveLength(2);
    expect(container.querySelector("svg")).toBeNull();
    for (const listbox of screen.getAllByRole("listbox")) expect(listbox).not.toHaveClass("pr-10");
  });

  it("can be disabled", () => {
    render(
      <Select aria-label="Size" disabled>
        <Options />
      </Select>,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("forwards ref and merges className onto the select", () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select aria-label="Size" ref={ref} className="text-sm">
        <Options />
      </Select>,
    );
    expect(ref.current).toBe(screen.getByRole("combobox"));
    expect(ref.current).toHaveClass("text-sm", "appearance-none");
    expect(ref.current).not.toHaveClass("text-base");
  });

  describe("inside a Field", () => {
    it("is labelled, described, required and marked invalid through the render prop", () => {
      render(
        <Field label="Size" description="Check the size chart." error="Choose a size." required>
          {(control) => (
            <Select {...control}>
              <Options />
            </Select>
          )}
        </Field>,
      );
      const select = screen.getByRole("combobox", { name: "Size" });
      expect(select).toHaveAccessibleDescription("Check the size chart. Error: Choose a size.");
      expect(select).toHaveAttribute("aria-invalid", "true");
      expect(select).toBeRequired();
    });

    it("works as the element child", async () => {
      render(
        <Field label="Size">
          <Select>
            <Options />
          </Select>
        </Field>,
      );
      await userEvent.click(screen.getByText("Size"));
      expect(screen.getByRole("combobox", { name: "Size" })).toHaveFocus();
    });
  });

  describe("accessibility", () => {
    it("has no axe violations in a Field with an error", async () => {
      const { container } = render(
        <Field label="Size" error="Choose a size.">
          {(control) => (
            <Select {...control}>
              <Options />
            </Select>
          )}
        </Field>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
