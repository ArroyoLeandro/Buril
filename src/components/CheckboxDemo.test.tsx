import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import CheckboxDemo from "./CheckboxDemo";

const toppings = ["Cheese", "Mushrooms", "Olives"];

describe("CheckboxDemo", () => {
  it("starts with one topping checked, so the parent is mixed", () => {
    render(<CheckboxDemo />);
    expect(screen.getByRole("checkbox", { name: "All toppings" })).toBePartiallyChecked();
    expect(screen.getByRole("checkbox", { name: "Cheese" })).toBeChecked();
  });

  it("checks and clears every topping from the parent", async () => {
    render(<CheckboxDemo />);
    const all = screen.getByRole("checkbox", { name: "All toppings" });
    await userEvent.click(all);
    expect(all).toBeChecked();
    expect(all).not.toBePartiallyChecked();
    for (const name of toppings) expect(screen.getByRole("checkbox", { name })).toBeChecked();

    await userEvent.click(all);
    expect(all).not.toBeChecked();
    for (const name of toppings) expect(screen.getByRole("checkbox", { name })).not.toBeChecked();
  });

  it("turns the parent mixed again when one topping changes", async () => {
    render(<CheckboxDemo />);
    await userEvent.click(screen.getByRole("checkbox", { name: "All toppings" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Olives" }));
    expect(screen.getByRole("checkbox", { name: "All toppings" })).toBePartiallyChecked();
  });

  it("shows a disabled checkbox", () => {
    render(<CheckboxDemo />);
    expect(screen.getByRole("checkbox", { name: "Gift wrap (unavailable)" })).toBeDisabled();
  });

  it("has no axe violations", async () => {
    const { container } = render(<CheckboxDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
