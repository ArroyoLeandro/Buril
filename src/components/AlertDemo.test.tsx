import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import AlertDemo from "./AlertDemo";

describe("AlertDemo", () => {
  it("shows static alerts without a live role", () => {
    render(<AlertDemo />);
    expect(screen.getByText("New version available")).toBeInTheDocument();
    expect(screen.getByText("Payment failed")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  // The polite region is on the page, empty, before the message is inserted into it.
  it("inserts the saved message into a status region that already exists", async () => {
    render(<AlertDemo />);
    const region = screen.getByRole("status");
    expect(region).toBeEmptyDOMElement();
    await userEvent.click(screen.getByRole("button", { name: "Save draft" }));
    expect(screen.getByRole("status")).toBe(region);
    expect(region).toHaveTextContent("Draft saved");
  });

  it("has no axe violations before and after the message", async () => {
    const { container } = render(<AlertDemo />);
    expect(await axe(container)).toHaveNoViolations();
    await userEvent.click(screen.getByRole("button", { name: "Save draft" }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
