import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import SelectDemo from "./SelectDemo";

describe("SelectDemo", () => {
  it("labels and describes the required size select", () => {
    render(<SelectDemo />);
    const size = screen.getByRole("combobox", { name: "Size" });
    expect(size).toBeRequired();
    expect(size).toHaveAccessibleDescription("See the size chart for measurements.");
  });

  it("shows an error when submitted without a size, then clears it", async () => {
    render(<SelectDemo />);
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    const size = screen.getByRole("combobox", { name: "Size" });
    expect(size).toHaveAttribute("aria-invalid", "true");
    expect(size).toHaveFocus();
    await userEvent.selectOptions(size, "Medium");
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    expect(size).not.toHaveAttribute("aria-invalid");
    expect(screen.getByRole("status")).toHaveTextContent("Added size Medium to the cart.");
  });

  it("shows a disabled select", () => {
    render(<SelectDemo />);
    expect(screen.getByRole("combobox", { name: "Color" })).toBeDisabled();
  });

  it("has no axe violations", async () => {
    const { container } = render(<SelectDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("SelectDemo in Spanish", () => {
  it("labels the selects and reports errors and success in Spanish", async () => {
    render(<SelectDemo locale="es" />);
    const size = screen.getByRole("combobox", { name: /Talla/ });
    await userEvent.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    expect(size).toHaveAccessibleDescription(/Elige una talla\./);
    await userEvent.selectOptions(size, "m");
    await userEvent.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    expect(screen.getByRole("status")).toHaveTextContent("Se agregó la talla Mediana al carrito.");
  });
});
