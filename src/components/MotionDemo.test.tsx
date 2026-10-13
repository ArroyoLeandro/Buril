import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, expect, it } from "vitest";

import MotionDemo from "./MotionDemo";

describe("MotionDemo", () => {
  const stage = (container: HTMLElement) =>
    container.querySelector<HTMLElement>("[data-motion-stage]")!;

  it("plays every kind of motion: switch, checkbox, radio, press, icon gestures and a card", () => {
    render(<MotionDemo />);
    expect(screen.getByRole("switch", { name: "Email notifications" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Accept the terms" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Delivery" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
    for (const name of ["Close dialog", "Notifications", "Like"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
    expect(screen.getByRole("status")).toHaveTextContent("Loading files");
    expect(screen.getByRole("link", { name: "Accessible forms" })).toBeInTheDocument();
  });

  it("draws its icons from the site icon set", () => {
    render(<MotionDemo />);
    const icon = (name: string) =>
      screen.getByRole("button", { name }).querySelector("svg")?.getAttribute("data-icon");
    expect(icon("Close dialog")).toBe("close");
    expect(icon("Notifications")).toBe("bell");
    expect(icon("Like")).toBe("heart");
  });

  it("fills the heart while Like is pressed", async () => {
    render(<MotionDemo />);
    const like = screen.getByRole("button", { name: "Like" });
    expect(like.querySelector("svg")).toHaveAttribute("fill", "none");
    await userEvent.click(like);
    expect(like.querySelector("svg")).toHaveAttribute("fill", "currentColor");
  });

  it("simulates reduced motion on the stage from a labelled switch, off by default", async () => {
    const { container } = render(<MotionDemo />);
    const simulate = screen.getByRole("switch", { name: "Simulate reduced motion" });
    expect(simulate).not.toBeChecked();
    expect(stage(container)).not.toHaveAttribute("data-reduced-motion");

    await userEvent.click(simulate);
    expect(simulate).toBeChecked();
    expect(stage(container)).toHaveAttribute("data-reduced-motion");

    await userEvent.click(simulate);
    expect(stage(container)).not.toHaveAttribute("data-reduced-motion");
  });

  it("keeps the simulation switch outside the stage it controls", () => {
    const { container } = render(<MotionDemo />);
    const simulate = screen.getByRole("switch", { name: "Simulate reduced motion" });
    expect(stage(container).contains(simulate)).toBe(false);
  });

  it("has no axe violations", async () => {
    const { container } = render(<MotionDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("MotionDemo in Spanish", () => {
  it("names the controls in Spanish", () => {
    render(<MotionDemo locale="es" />);
    expect(screen.getByRole("switch", { name: "Simular movimiento reducido" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Notificaciones por correo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
  });
});
