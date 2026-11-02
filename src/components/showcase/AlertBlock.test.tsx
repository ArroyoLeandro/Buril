import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import AlertBlock from "./AlertBlock";

describe("AlertBlock", () => {
  it("shows one destructive Alert in front, a static callout with no live role", async () => {
    const { container } = render(<AlertBlock />);
    const alerts = container.querySelectorAll("[data-slot=alert]");
    expect(alerts).toHaveLength(3);
    const front = alerts[0]!;
    expect(front).not.toHaveAttribute("role");
    expect(front).not.toHaveAttribute("aria-hidden");
    expect(front.className).toMatch(/\bborder-destructive\b/);
    expect(front).toHaveTextContent("Payment failed");
    expect(front).toHaveTextContent("The card ending in 4242 was declined.");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("stacks two inert copies behind it, hidden from assistive technology", () => {
    const { container } = render(<AlertBlock />);
    const behind = [...container.querySelectorAll("[data-slot=alert]")].slice(1);
    for (const alert of behind) {
      expect(alert).toHaveAttribute("inert");
      expect(alert).toHaveAttribute("aria-hidden", "true");
    }
    expect(screen.queryByText("Deploy finished")).toBeInTheDocument();
  });

  it("speaks Spanish on Spanish pages", () => {
    const { container } = render(<AlertBlock locale="es" />);
    const front = container.querySelector("[data-slot=alert]")!;
    expect(front).toHaveTextContent("Error en el pago");
    expect(front).toHaveTextContent("Se rechazó la tarjeta terminada en 4242.");
  });
});
