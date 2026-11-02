import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import CheckboxBlock from "./CheckboxBlock";

describe("CheckboxBlock", () => {
  it("is one checked Checkbox with a label and a description", async () => {
    const { container } = render(<CheckboxBlock />);
    const checkbox = screen.getByRole("checkbox", { name: "Email me the changelog" });
    expect(checkbox).toBeChecked();
    expect(checkbox).toHaveAccessibleDescription("Once a month.");
    await userEvent.setup().click(screen.getByText("Email me the changelog"));
    expect(checkbox).not.toBeChecked();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("speaks Spanish on Spanish pages", () => {
    render(<CheckboxBlock locale="es" />);
    expect(
      screen.getByRole("checkbox", { name: "Envíame los cambios por correo" }),
    ).toHaveAccessibleDescription("Una vez al mes.");
  });
});
