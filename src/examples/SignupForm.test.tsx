import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import { SignupForm } from "./SignupForm";

/** The Forms guide shows this file, so it must do what the guide says. */
describe("SignupForm example", () => {
  it("shows each error under its field, marks it invalid and focuses the first one", async () => {
    render(<SignupForm />);
    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));
    const name = screen.getByRole("textbox", { name: "Name" });
    const email = screen.getByRole("textbox", { name: /^Email/ });
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Error: Enter your name.");
    expect(email).toHaveAccessibleDescription(
      "We never share it. Error: Enter an email address like name@example.com.",
    );
    expect(name).toHaveFocus();
    expect(name).toBeRequired();
  });

  it("clears the errors and confirms in the status region once the form is valid", async () => {
    render(<SignupForm />);
    await userEvent.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
    await userEvent.type(screen.getByRole("textbox", { name: /^Email/ }), "ada@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));
    expect(screen.getByRole("textbox", { name: "Name" })).not.toHaveAttribute("aria-invalid");
    expect(screen.getByRole("status")).toHaveTextContent("Thanks, Ada. Check your inbox.");
  });

  it("has no axe violations with errors showing", async () => {
    const { container } = render(<SignupForm />);
    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
