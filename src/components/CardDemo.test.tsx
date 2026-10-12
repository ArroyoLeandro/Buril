import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import CardDemo from "./CardDemo";

describe("CardDemo", () => {
  it("titles each card with a heading", () => {
    render(<CardDemo />);
    expect(screen.getByRole("heading", { name: "Starter plan" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Accessible forms" })).toBeInTheDocument();
  });

  it("keeps the plan card's action a real button", () => {
    render(<CardDemo />);
    expect(screen.getByRole("button", { name: "Choose Starter" })).toBeInTheDocument();
  });

  it("makes the article card one link named by its title", () => {
    render(<CardDemo />);
    const link = screen.getByRole("link", { name: "Accessible forms" });
    expect(link).toHaveAttribute("href", "/docs/components/field");
    expect(link).toHaveClass("after:absolute", "after:inset-0");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("marks only the linked card interactive, so the plan card never moves", () => {
    const { container } = render(<CardDemo />);
    const cards = container.querySelectorAll('[data-slot="card"]');
    expect(cards[0]).not.toHaveAttribute("data-interactive");
    expect(cards[1]).toHaveAttribute("data-interactive");
  });

  it("has no axe violations", async () => {
    const { container } = render(<CardDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("CardDemo in Spanish", () => {
  it("writes both cards in Spanish and links the Spanish Field page", () => {
    render(<CardDemo locale="es" />);
    expect(screen.getByRole("heading", { name: "Plan básico" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Elegir el plan básico" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Formularios accesibles" })).toHaveAttribute(
      "href",
      "/es/docs/components/field",
    );
  });
});
