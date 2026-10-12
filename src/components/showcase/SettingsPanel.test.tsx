import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import SettingsPanel from "./SettingsPanel";

describe("SettingsPanel", () => {
  it("combines a switch, a radio group and a select, with no axe violations", async () => {
    const { container } = render(<SettingsPanel />);
    expect(screen.getByRole("switch", { name: "Email notifications" })).toBeChecked();
    expect(screen.getByRole("group", { name: "Digest" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Weekly" })).toBeChecked();
    expect(screen.getByRole("combobox", { name: "Language" })).toHaveValue("en");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("announces each change in a status region", async () => {
    render(<SettingsPanel />);
    const user = userEvent.setup();
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("");

    await user.click(screen.getByRole("radio", { name: "Daily" }));
    expect(status).toHaveTextContent("Digest set to daily.");

    await user.click(screen.getByRole("switch", { name: "Email notifications" }));
    expect(status).toHaveTextContent("Email notifications turned off.");
    // No notifications, no digest: the whole group is disabled through its fieldset.
    expect(screen.getByRole("radio", { name: "Weekly" })).toBeDisabled();

    await user.selectOptions(screen.getByRole("combobox", { name: "Language" }), "es");
    expect(status).toHaveTextContent("Language set to Español.");
  });
});
