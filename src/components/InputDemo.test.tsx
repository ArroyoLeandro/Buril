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
    expect(screen.getByRole("textbox", { name: "Account ID" })).toBeDisabled();
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
