import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import LinkDemo from "./LinkDemo";

describe("LinkDemo", () => {
  it("renders real links, including one that announces a new tab", () => {
    render(<LinkDemo />);
    for (const link of screen.getAllByRole("link")) expect(link).toHaveAttribute("href");
    expect(screen.getByRole("link", { name: /\(opens in a new tab\)$/ })).toHaveAttribute(
      "target",
      "_blank",
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(<LinkDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
