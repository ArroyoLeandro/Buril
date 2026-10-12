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

describe("RadioGroupDemo in Spanish", () => {
  it("names the group and the options and follows the choice in Spanish", async () => {
    render(<RadioGroupDemo locale="es" />);
    expect(screen.getByRole("group", { name: "Entrega" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Estándar, de 3 a 5 días" })).toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "Exprés, al día siguiente" }));
    expect(screen.getByText("Entrega: Exprés, al día siguiente.")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Dron (no disponible)" })).toBeDisabled();
  });
});
