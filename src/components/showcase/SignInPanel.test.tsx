import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import SignInPanel from "./SignInPanel";

describe("SignInPanel", () => {
  it("labels every control and has no axe violations", async () => {
    const { container } = render(<SignInPanel delay={0} />);
    expect(screen.getByRole("textbox", { name: "Email" })).toBeRequired();
    expect(screen.getByLabelText(/^Password/)).toHaveAttribute("type", "password");
    expect(screen.getByRole("checkbox", { name: "Keep me signed in" })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Sign in" })).toHaveAttribute("type", "submit");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("explains each error in text and focuses the first invalid field", async () => {
    render(<SignInPanel delay={0} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    const email = screen.getByRole("textbox", { name: "Email" });
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription(/Enter an email address/);
    expect(screen.getByLabelText(/^Password/)).toHaveAccessibleDescription(/Enter your password/);
    expect(email).toHaveFocus();
  });

  it("shows the loading state, then announces the result", async () => {
    render(<SignInPanel delay={0} />);
    const user = userEvent.setup();
    await user.type(screen.getByRole("textbox", { name: "Email" }), "ada@example.com");
    await user.type(screen.getByLabelText(/^Password/), "engraving");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText(/Signed in as ada@example\.com/)).toBe(
      screen.getByRole("status"),
    );
    expect(screen.getByRole("button", { name: "Sign in" })).not.toHaveAttribute("aria-busy");
    expect(screen.getByRole("textbox", { name: "Email" })).not.toHaveAttribute("aria-invalid");
  });
});
