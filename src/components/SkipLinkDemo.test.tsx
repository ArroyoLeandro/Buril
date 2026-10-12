import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import SkipLinkDemo from "./SkipLinkDemo";

describe("SkipLinkDemo", () => {
  it("skips the demo toolbar and focuses the demo content", async () => {
    render(<SkipLinkDemo />);
    await userEvent.tab();
    expect(screen.getByRole("link", { name: "Skip to the demo content" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("region", { name: "Demo content" })).toHaveFocus();
  });

  it("has no axe violations", async () => {
    const { container } = render(<SkipLinkDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
