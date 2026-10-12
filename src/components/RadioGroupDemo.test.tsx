import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import RadioGroupDemo from "./RadioGroupDemo";

describe("RadioGroupDemo", () => {
  it("names the group by its legend and starts on Standard", () => {
    render(<RadioGroupDemo />);
    expect(screen.getByRole("group", { name: "Delivery" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Standard, 3 to 5 days" })).toBeChecked();
    expect(screen.getByText(/Delivery: Standard/)).toBeInTheDocument();
  });

  it("follows the choice made with the keyboard", async () => {
    render(<RadioGroupDemo />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Express, next day" })).toBeChecked();
    expect(screen.getByText(/Delivery: Express/)).toBeInTheDocument();
  });

  it("shows an unavailable option as disabled", () => {
    render(<RadioGroupDemo />);
    expect(screen.getByRole("radio", { name: "Drone (unavailable)" })).toBeDisabled();
  });

  it("has no axe violations", async () => {
    const { container } = render(<RadioGroupDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
