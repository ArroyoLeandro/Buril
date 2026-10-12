import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import IconButtonDemo from "./IconButtonDemo";

describe("IconButtonDemo", () => {
  it("names every button by its action", () => {
    render(<IconButtonDemo />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("aria-label");
      expect(button.getAttribute("aria-label")).not.toBe("");
    }
  });

  it("has no axe violations", async () => {
    const { container } = render(<IconButtonDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
