import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import TextareaDemo from "./TextareaDemo";

describe("TextareaDemo", () => {
  it("labels and describes the message field", () => {
    render(<TextareaDemo />);
    expect(screen.getByRole("textbox", { name: "Message" })).toHaveAccessibleDescription(
      "Up to 200 characters.",
    );
  });

  it("flags a message over the limit as invalid", async () => {
    render(<TextareaDemo />);
    const message = screen.getByRole("textbox", { name: "Message" });
    await userEvent.click(message);
    await userEvent.paste("a".repeat(201));
    expect(message).toHaveAttribute("aria-invalid", "true");
    expect(message).toHaveAccessibleDescription(
      "Up to 200 characters. Error: Shorten the message to 200 characters or fewer.",
    );
  });

  it("clears the error once the message is back within the limit", async () => {
    render(<TextareaDemo />);
    const message = screen.getByRole("textbox", { name: "Message" });
    await userEvent.click(message);
    await userEvent.paste("a".repeat(201));
    expect(message).toBeInvalid();
    await userEvent.keyboard("{Backspace}");
    expect(message).not.toHaveAttribute("aria-invalid");
    expect(message).toHaveAccessibleDescription("Up to 200 characters.");
    expect(screen.getByText("200 / 200")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<TextareaDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
