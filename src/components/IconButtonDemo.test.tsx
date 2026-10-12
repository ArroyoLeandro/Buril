import { act, fireEvent, render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { afterEach, describe, expect, it, vi } from "vitest";

import IconButtonDemo from "./IconButtonDemo";

describe("IconButtonDemo", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("names every button by its action", () => {
    render(<IconButtonDemo />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("aria-label");
      expect(button.getAttribute("aria-label")).not.toBe("");
    }
  });

  it("shows loading on Refresh, announces it, then settles", () => {
    vi.useFakeTimers();
    render(<IconButtonDemo />);
    const refresh = screen.getByRole("button", { name: "Refresh results" });
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("");

    fireEvent.click(refresh);
    expect(refresh).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveTextContent("Refreshing results…");

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(refresh).not.toHaveAttribute("aria-busy");
    expect(status).toHaveTextContent("");
  });

  it("clears its pending timer when it unmounts", () => {
    vi.useFakeTimers();
    const { unmount } = render(<IconButtonDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Refresh results" }));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("shows a live demo of the gestures, one per kind of icon", () => {
    render(<IconButtonDemo />);
    const gestures = {
      "Close dialog": "rotate",
      "Delete draft": "wiggle",
      Notifications: "swing",
      "Reload page": "spin",
      "Send message": "nudge-x",
      Like: "pop",
      "Open in a new tab": "nudge-diagonal",
    };
    for (const [name, motion] of Object.entries(gestures)) {
      const button = screen.getByRole("button", { name });
      expect(button.querySelector("[data-motion]")).toHaveAttribute("data-motion", motion);
    }
    // The trash marks its lid, so the lid lifts before the can shakes.
    const trash = screen.getByRole("button", { name: "Delete draft" });
    expect(trash.querySelector("[data-lid]")).not.toBeNull();
  });

  it("toggles Like, which pops, as a pressed button", () => {
    render(<IconButtonDemo />);
    const like = screen.getByRole("button", { name: "Like" });
    expect(like).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(like);
    expect(like).toHaveAttribute("aria-pressed", "true");
  });

  it("has no axe violations", async () => {
    const { container } = render(<IconButtonDemo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("IconButtonDemo in Spanish", () => {
  it("names every icon button and announces the refresh in Spanish", () => {
    vi.useFakeTimers();
    render(<IconButtonDemo locale="es" />);
    expect(screen.getByRole("button", { name: "Agregar elemento (icon-sm)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar panel" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Actualizar resultados" }));
    expect(screen.getByRole("status")).toHaveTextContent("Actualizando resultados…");
  });

  it("names the gesture demos in Spanish", () => {
    render(<IconButtonDemo locale="es" />);
    for (const name of [
      "Cerrar diálogo",
      "Eliminar borrador",
      "Notificaciones",
      "Recargar página",
      "Enviar mensaje",
      "Me gusta",
      "Abrir en una pestaña nueva",
    ]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
    expect(screen.getByRole("heading", { name: "Movimiento" })).toBeInTheDocument();
  });
});
