import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import InputDemo from "./InputDemo";

describe("InputDemo", () => {
  it("labels every input", () => {
    render(<InputDemo />);
    expect(screen.getByRole("textbox", { name: "Full name" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Username" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Account ID" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Promo code" })).toBeInTheDocument();
  });

  // A value people need to read or copy stays focusable: read-only, not disabled.
  it("keeps the read-only account ID focusable and the disabled promo code out of the Tab order", async () => {
    render(<InputDemo />);
    const account = screen.getByRole("textbox", { name: "Account ID" });
    expect(account).toHaveAttribute("readonly");
    expect(account).toBeEnabled();
    expect(screen.getByRole("textbox", { name: "Promo code" })).toBeDisabled();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    expect(account).toHaveFocus();
    await userEvent.tab();
    expect(document.body).toHaveFocus();
  });

  it("flags a username with spaces as invalid and clears it once fixed", async () => {
    render(<InputDemo />);
    const username = screen.getByRole("textbox", { name: "Username" });
    await userEvent.type(username, "ada lovelace");
    expect(username).toHaveAttribute("aria-invalid", "true");
    expect(username).toHaveAccessibleDescription(
      "Letters, numbers and dashes. Error: Usernames cannot contain spaces.",
    );
    await userEvent.clear(username);
    await userEvent.type(username, "ada-lovelace");
    expect(username).not.toHaveAttribute("aria-invalid");
  });

  it("has no axe violations", async () => {
    const { container } = render(<InputDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
