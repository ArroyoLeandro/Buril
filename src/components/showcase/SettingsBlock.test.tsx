import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import SettingsBlock from "./SettingsBlock";

describe("SettingsBlock", () => {
  it("is a Card of notification settings with the engraved band", () => {
    const { container } = render(<SettingsBlock />);
    expect(screen.getByRole("heading", { level: 4, name: "Notifications" })).toBeInTheDocument();
    expect(screen.getByText("Choose what reaches you.")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-decor]")).toHaveLength(1);
  });

  it("wires two switches and a checkbox to their labels and descriptions", () => {
    render(<SettingsBlock />);
    const comments = screen.getByRole("switch", { name: "Comments" });
    expect(comments).toBeChecked();
    expect(comments).toHaveAccessibleDescription("Replies and mentions.");
    const reviews = screen.getByRole("switch", { name: "Review requests" });
    expect(reviews).not.toBeChecked();
    expect(reviews).toHaveAccessibleDescription("When someone asks for your review.");
    const digest = screen.getByRole("checkbox", { name: "Daily digest" });
    expect(digest).toBeChecked();
    expect(digest).toHaveAccessibleDescription("One email at 9:00.");
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("toggles natively, so it works before any JavaScript loads", async () => {
    render(<SettingsBlock />);
    const user = userEvent.setup();
    await user.click(screen.getByText("Review requests"));
    expect(screen.getByRole("switch", { name: "Review requests" })).toBeChecked();
    await user.click(screen.getByRole("checkbox", { name: "Daily digest" }));
    expect(screen.getByRole("checkbox", { name: "Daily digest" })).not.toBeChecked();
  });

  it("keeps the plan card behind and the faded rows inert and hidden", () => {
    const { container } = render(<SettingsBlock />);
    // Only the three live controls are reachable.
    expect(screen.queryAllByRole("radio")).toEqual([]);
    expect(screen.getAllByRole("switch")).toHaveLength(2);
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    expect(screen.queryAllByRole("button")).toEqual([]);
    const inert = container.querySelectorAll("[inert]");
    expect(inert.length).toBeGreaterThanOrEqual(2);
    for (const part of inert) expect(part).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("[inert] input[type=radio]")).not.toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(<SettingsBlock />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("speaks Spanish on Spanish pages", () => {
    render(<SettingsBlock locale="es" />);
    expect(screen.getByRole("heading", { level: 4, name: "Notificaciones" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Comentarios" })).toHaveAccessibleDescription(
      "Respuestas y menciones.",
    );
    expect(screen.getByRole("switch", { name: "Solicitudes de revisión" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Resumen diario" })).toBeInTheDocument();
  });
});
