import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import FieldBlock from "./FieldBlock";

describe("FieldBlock", () => {
  it("starts with an email that has no domain, marked invalid and described by the error", async () => {
    const { container } = render(<FieldBlock />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveValue("ada@studio");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Error: Add the domain, like ada@studio.dev.");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("clears the error once the address has a domain, and shows it again when it loses it", async () => {
    render(<FieldBlock />);
    const user = userEvent.setup();
    const input = screen.getByRole("textbox", { name: "Email" });
    await user.type(input, ".dev");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAccessibleDescription();
    await user.type(input, "{Backspace}{Backspace}{Backspace}{Backspace}");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Error: Add the domain, like ada@studio.dev.");
  });

  it("speaks Spanish on Spanish pages", () => {
    render(<FieldBlock locale="es" />);
    expect(screen.getByRole("textbox", { name: "Correo electrónico" })).toHaveAccessibleDescription(
      "Error: Agrega el dominio, como ada@studio.dev.",
    );
  });
});
