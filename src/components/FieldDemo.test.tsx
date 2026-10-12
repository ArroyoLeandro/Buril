import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import FieldDemo from "./FieldDemo";

describe("FieldDemo", () => {
  it("labels and describes a required email field", () => {
    render(<FieldDemo />);
    const email = screen.getByRole("textbox", { name: "Email" });
    expect(email).toBeRequired();
    expect(email).toHaveAccessibleDescription("We only use it to send the newsletter.");
  });

  it("shows an error and moves focus to the field when it is submitted empty", async () => {
    render(<FieldDemo />);
    await userEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    const email = screen.getByRole("textbox", { name: "Email" });
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveFocus();
    expect(email).toHaveAccessibleDescription(
      "We only use it to send the newsletter. Error: Enter your email address.",
    );
  });

  it("clears the error and confirms once the address is valid", async () => {
    render(<FieldDemo />);
    await userEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Email" }), "ada@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(screen.getByRole("textbox", { name: "Email" })).not.toHaveAttribute("aria-invalid");
    expect(screen.getByRole("status")).toHaveTextContent("Subscribed ada@example.com.");
  });

  it("explains a malformed address with an example", async () => {
    render(<FieldDemo />);
    const email = screen.getByRole("textbox", { name: "Email" });
    await userEvent.type(email, "ada@");
    await userEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(email).toHaveFocus();
    expect(email).toHaveAccessibleDescription(
      "We only use it to send the newsletter. Error: Enter an email address like name@example.com.",
    );
  });

  it("drops an earlier confirmation when a later submit fails", async () => {
    render(<FieldDemo />);
    const email = screen.getByRole("textbox", { name: "Email" });
    await userEvent.type(email, "ada@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(screen.getByRole("status")).toHaveTextContent("Subscribed ada@example.com.");
    await userEvent.clear(email);
    await userEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(email).toBeInvalid();
  });

  it("has no axe violations, with or without an error", async () => {
    const { container } = render(<FieldDemo />);
    expect(await axe(container)).toHaveNoViolations();
    await userEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("FieldDemo in Spanish", () => {
  it("labels the field and reports errors and success in Spanish", async () => {
    render(<FieldDemo locale="es" />);
    const input = screen.getByRole("textbox", { name: /Correo electrónico/ });
    await userEvent.click(screen.getByRole("button", { name: "Suscribirme" }));
    expect(input).toHaveAccessibleDescription(/Escribe tu correo electrónico\./);
    expect(input).toHaveFocus();
    await userEvent.type(input, "ada@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Suscribirme" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Suscripción confirmada para ada@example.com.",
    );
  });

  it("marks the field obligatorio, not required", () => {
    render(<FieldDemo locale="es" />);
    expect(screen.getByText("(obligatorio)")).toBeInTheDocument();
    expect(screen.queryByText("(required)")).toBeNull();
  });
});
