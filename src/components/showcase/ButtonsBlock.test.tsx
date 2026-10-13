import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import ButtonsBlock from "./ButtonsBlock";

describe("ButtonsBlock", () => {
  it("shows the three Button sizes and the three IconButton sizes, each named", async () => {
    const { container } = render(<ButtonsBlock />);
    const buttons = screen.getAllByRole("button");
    expect(
      buttons.map((button) => button.textContent || button.getAttribute("aria-label")),
    ).toEqual(["Archive", "Save", "Publish", "Add a row", "Copy the link", "Email the team"]);
    const heights = ["min-h-8", "min-h-10", "min-h-12", "size-8", "size-10", "size-12"];
    buttons.forEach((button, index) => expect(button.className).toContain(heights[index]));
    expect(await axe(container)).toHaveNoViolations();
  });

  it("runs past the cell with inert copies that fade, never fading the live buttons", () => {
    const { container } = render(<ButtonsBlock />);
    const tail = container.querySelector("[inert]")!;
    expect(tail).toHaveAttribute("aria-hidden", "true");
    expect(tail.querySelectorAll("button").length).toBeGreaterThan(0);
    expect(tail.className).toMatch(/mask-image/);
    for (const button of screen.getAllByRole("button")) {
      for (let el = button.parentElement; el && el !== container; el = el.parentElement) {
        expect(el.className).not.toMatch(/mask-image/);
      }
    }
  });

  it("speaks Spanish on Spanish pages", () => {
    render(<ButtonsBlock locale="es" />);
    expect(screen.getByRole("button", { name: "Publicar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agregar una fila" })).toBeInTheDocument();
  });
});
