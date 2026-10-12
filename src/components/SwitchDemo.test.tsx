import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import SwitchDemo from "./SwitchDemo";

describe("SwitchDemo", () => {
  it("names each switch by its label", () => {
    render(<SwitchDemo />);
    expect(screen.getByRole("switch", { name: "Email notifications" })).toBeChecked();
    expect(screen.getByRole("switch", { name: "Push notifications" })).not.toBeChecked();
    expect(screen.getByRole("switch", { name: "SMS notifications" })).toBeDisabled();
  });

  it("applies the change immediately and says so in a status message", async () => {
    render(<SwitchDemo />);
    await userEvent.click(screen.getByRole("switch", { name: "Push notifications" }));
    expect(screen.getByRole("status")).toHaveTextContent("Push notifications turned on.");
  });

  it("turns it back off and says so", async () => {
    render(<SwitchDemo />);
    const push = screen.getByRole("switch", { name: "Push notifications" });
    await userEvent.click(push);
    await userEvent.click(push);
    expect(push).not.toBeChecked();
    expect(screen.getByRole("status")).toHaveTextContent("Push notifications turned off.");
  });

  it("has no axe violations", async () => {
    const { container } = render(<SwitchDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
