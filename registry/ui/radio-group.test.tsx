import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it, vi } from "vitest";

import { RadioGroup, RadioGroupItem, type RadioGroupProps } from "./radio-group";

function Delivery(props: Partial<RadioGroupProps>) {
  return (
    <RadioGroup legend="Delivery" {...props}>
      <RadioGroupItem value="standard">Standard</RadioGroupItem>
      <RadioGroupItem value="express">Express</RadioGroupItem>
      <RadioGroupItem value="pickup">Pickup</RadioGroupItem>
    </RadioGroup>
  );
}

/** The group between two buttons, to check where Tab goes in and out. */
function Page(props: Partial<RadioGroupProps>) {
  return (
    <>
      <button type="button">Before</button>
      <Delivery {...props} />
      <button type="button">After</button>
    </>
  );
}

const radio = (name: string) => screen.getByRole("radio", { name });

describe("RadioGroup", () => {
  it("is a fieldset named by its legend", () => {
    render(<Delivery />);
    const group = screen.getByRole("group", { name: "Delivery" });
    expect(group.tagName).toBe("FIELDSET");
    expect(group.querySelector("legend")).toHaveTextContent("Delivery");
  });

  it("renders native radios named by their labels", () => {
    render(<Delivery />);
    for (const name of ["Standard", "Express", "Pickup"]) {
      expect(radio(name).tagName).toBe("INPUT");
      expect(radio(name)).toHaveAttribute("type", "radio");
    }
  });

  it("gives every radio the same name, generated unless one is passed", () => {
    const { unmount } = render(<Delivery />);
    const generated = radio("Standard").getAttribute("name");
    expect(generated).toBeTruthy();
    for (const name of ["Express", "Pickup"])
      expect(radio(name)).toHaveAttribute("name", generated!);
    unmount();
    render(<Delivery name="delivery" />);
    expect(radio("Pickup")).toHaveAttribute("name", "delivery");
  });

  it("submits the chosen value with the form", async () => {
    render(
      <form aria-label="Checkout">
        <Delivery name="delivery" defaultValue="express" />
      </form>,
    );
    const form = screen.getByRole("form", { name: "Checkout" }) as HTMLFormElement;
    expect(new FormData(form).get("delivery")).toBe("express");
    await userEvent.click(radio("Pickup"));
    expect(new FormData(form).get("delivery")).toBe("pickup");
  });

  describe("uncontrolled", () => {
    it("checks defaultValue and reports a new choice", async () => {
      const onValueChange = vi.fn();
      render(<Delivery defaultValue="standard" onValueChange={onValueChange} />);
      expect(radio("Standard")).toBeChecked();
      await userEvent.click(radio("Express"));
      expect(radio("Express")).toBeChecked();
      expect(radio("Standard")).not.toBeChecked();
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("express");
    });
  });

  describe("controlled", () => {
    it("follows value and only reports a click", async () => {
      const onValueChange = vi.fn();
      const { rerender } = render(<Delivery value="standard" onValueChange={onValueChange} />);
      await userEvent.click(radio("Pickup"));
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith("pickup");
      expect(radio("Standard")).toBeChecked();
      rerender(<Delivery value="pickup" onValueChange={onValueChange} />);
      expect(radio("Pickup")).toBeChecked();
    });
  });

  describe("keyboard", () => {
    it("takes one Tab stop: the checked radio", async () => {
      render(<Page defaultValue="express" />);
      await userEvent.click(screen.getByRole("button", { name: "Before" }));
      await userEvent.tab();
      expect(radio("Express")).toHaveFocus();
      await userEvent.tab();
      expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
      await userEvent.tab({ shift: true });
      expect(radio("Express")).toHaveFocus();
    });

    it("takes one Tab stop on the first radio when none is checked", async () => {
      render(<Page />);
      await userEvent.click(screen.getByRole("button", { name: "Before" }));
      await userEvent.tab();
      expect(radio("Standard")).toHaveFocus();
      await userEvent.tab();
      expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    });

    it("moves focus and the choice with the arrow keys, wrapping at the ends", async () => {
      const onValueChange = vi.fn();
      render(<Page defaultValue="standard" onValueChange={onValueChange} />);
      await userEvent.click(radio("Standard"));
      await userEvent.keyboard("{ArrowDown}");
      expect(radio("Express")).toHaveFocus();
      expect(radio("Express")).toBeChecked();
      await userEvent.keyboard("{ArrowRight}");
      expect(radio("Pickup")).toBeChecked();
      await userEvent.keyboard("{ArrowDown}");
      expect(radio("Standard")).toBeChecked();
      await userEvent.keyboard("{ArrowUp}");
      expect(radio("Pickup")).toHaveFocus();
      expect(radio("Pickup")).toBeChecked();
      expect(onValueChange).toHaveBeenLastCalledWith("pickup");
    });
  });

  it("disables every radio when the group is disabled", () => {
    render(<Delivery disabled />);
    for (const name of ["Standard", "Express", "Pickup"]) expect(radio(name)).toBeDisabled();
  });

  it("disables a single item", async () => {
    render(
      <RadioGroup legend="Delivery" defaultValue="standard">
        <RadioGroupItem value="standard">Standard</RadioGroupItem>
        <RadioGroupItem value="drone" disabled>
          Drone
        </RadioGroupItem>
      </RadioGroup>,
    );
    await userEvent.click(radio("Drone"));
    expect(radio("Drone")).not.toBeChecked();
    expect(radio("Standard")).toBeChecked();
  });

  it("marks every radio required when the group is required", () => {
    render(<Delivery required />);
    for (const name of ["Standard", "Express", "Pickup"]) expect(radio(name)).toBeRequired();
  });

  it("forwards the item ref to its input and className to its label row", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <RadioGroup legend="Delivery">
        <RadioGroupItem value="standard" ref={ref} className="font-semibold">
          Standard
        </RadioGroupItem>
      </RadioGroup>,
    );
    expect(ref.current).toBe(radio("Standard"));
    expect(radio("Standard").closest("label")).toHaveClass("font-semibold", "min-h-6");
  });

  it("calls the item's own onChange too", async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup legend="Delivery">
        <RadioGroupItem value="standard" onChange={onChange}>
          Standard
        </RadioGroupItem>
      </RadioGroup>,
    );
    await userEvent.click(radio("Standard"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("forwards props to the fieldset and merges className", () => {
    render(<Delivery className="max-w-sm" aria-describedby="hint" />);
    const group = screen.getByRole("group");
    expect(group).toHaveClass("max-w-sm");
    expect(group).toHaveAttribute("aria-describedby", "hint");
  });

  it("throws a clear error when an item is outside a group", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<RadioGroupItem value="alone">Alone</RadioGroupItem>)).toThrow(
      /inside a RadioGroup/,
    );
    vi.mocked(console.error).mockRestore();
  });

  describe("accessibility", () => {
    it("has no axe violations", async () => {
      const { container } = render(<Delivery defaultValue="express" />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no axe violations when disabled", async () => {
      const { container } = render(<Delivery disabled />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
