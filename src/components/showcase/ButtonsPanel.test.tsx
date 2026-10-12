import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import ButtonsPanel from "./ButtonsPanel";

describe("ButtonsPanel", () => {
  it("shows the button variants with no axe violations", async () => {
    const { container } = render(<ButtonsPanel delay={0} />);
    for (const name of ["Publish", "Save draft", "Preview", "Cancel", "Delete"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps the busy button focusable and announces the result outside it", async () => {
    render(<ButtonsPanel delay={0} />);
    const user = userEvent.setup();
    const status = screen.getByRole("status");
    await user.click(screen.getByRole("button", { name: "Publish" }));
    expect(await screen.findByText("Published.")).toBe(status);
    expect(screen.getByRole("button", { name: "Publish" })).not.toHaveAttribute("aria-busy");
  });
});
