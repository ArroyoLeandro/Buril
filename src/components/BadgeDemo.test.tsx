import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import BadgeDemo from "./BadgeDemo";

describe("BadgeDemo", () => {
  it("shows each variant with text that carries its meaning", () => {
    render(<BadgeDemo />);
    for (const text of ["New", "Draft", "Beta", "Failed"]) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  });

  it("keeps badges out of the Tab order", async () => {
    render(<BadgeDemo />);
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Mark order 1042 as shipped" })).toHaveFocus();
  });

  it("changes the status badge and announces the change in a separate status region", async () => {
    render(<BadgeDemo />);
    const status = screen.getByRole("status");
    expect(status).toBeEmptyDOMElement();
    expect(screen.getByText("Processing")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Mark order 1042 as shipped" }));
    expect(screen.getByText("Shipped")).toBeInTheDocument();
    expect(screen.queryByText("Processing")).toBeNull();
    expect(status).toHaveTextContent("Order 1042 marked as shipped.");
    expect(screen.getByText("Shipped")).not.toHaveAttribute("role");
  });

  it("keeps focus on the button and can switch the status back", async () => {
    render(<BadgeDemo />);
    await userEvent.click(screen.getByRole("button", { name: "Mark order 1042 as shipped" }));
    const button = screen.getByRole("button", { name: "Mark order 1042 as processing" });
    expect(button).toHaveFocus();
    await userEvent.click(button);
    expect(screen.getByText("Processing")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Order 1042 marked as processing.");
  });

  it("has no axe violations", async () => {
    const { container } = render(<BadgeDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("BadgeDemo in Spanish", () => {
  it("labels the badges and announces the change in Spanish", async () => {
    render(<BadgeDemo locale="es" />);
    expect(screen.getByText("Fallido")).toBeInTheDocument();
    expect(screen.getByText("En preparación")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Marcar el pedido 1042 como enviado" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Pedido 1042 marcado como enviado.");
  });
});
